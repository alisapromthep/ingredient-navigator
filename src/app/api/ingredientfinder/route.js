import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request) {
  return new Response("testing", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const openai = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});
export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = "sonar-reasoning"; // Using sonar-reasoning for both layers for consistency and power

    // --- JSON Schema for Layer 1: Ingredient Array ---
    const ingredientArraySchema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "The common name of the ingredient (e.g., 'Hyaluronic Acid').",
          },
          function: {
            type: "string",
            description:
              "The primary function or role (concise, 1-2 sentences).",
          },
          clinicalStudies: {
            type: "string",
            description:
              "Summary of relevant clinical studies (max 2-3 key findings or 'N/A' if none readily available). Prioritize brevity.",
          },
          marketTrendAnalysis: {
            type: "string",
            description:
              "Concise analysis of its current trend, popularity, and relevance on TikTok, Instagram, YouTube (1-2 sentences focusing on viral potential).",
          },
        },
        required: [
          "name",
          "function",
          "clinicalStudies",
          "marketTrendAnalysis",
        ],
        additionalProperties: false,
      },
    };

    // --- JSON Schema for Layer 2: Actionable Summary Object ---
    const actionableSummarySchema = {
      type: "object",
      properties: {
        sellingPoints: {
          type: "array",
          items: { type: "string" },
          description:
            "Key selling points/benefits for marketing derived from the ingredients.",
        },
        cautions: {
          type: "array",
          items: { type: "string" },
          description:
            "Critical cautions or considerations (safety, stability, usage) related to these ingredients.",
        },
        marketOpportunities: {
          type: "array",
          items: { type: "string" },
          description:
            "Current market trends or application opportunities related to these ingredients.",
        },
        nextSteps: {
          type: "array",
          items: { type: "string" },
          description: "Suggested next steps for product development.",
        },
      },
      required: [
        "sellingPoints",
        "cautions",
        "marketOpportunities",
        "nextSteps",
      ],
      additionalProperties: false,
    };

    // --- Layer 1: Get structured ingredient information (as JSON Array) ---
    const ingredientPrompt = `Based on the following request, identify key ingredients and provide their details. Your response MUST be a JSON array where each object strictly conforms to the provided JSON schema. Do NOT include any additional text or markdown outside the JSON.
Each description should be as concise as possible while being informative. For 'clinicalStudies' provide only 2-3 key findings. For 'marketTrendAnalysis', provide a brief 1-2 sentence summary of its social media popularity on TikTok, Instagram, and YouTube.

Request: "${prompt}"
`;

    let ingredientsData; // This will hold the parsed JSON array of ingredients
    let primaryAiResponseText; // Will hold stringified ingredients data for the next prompt
    let rawIngredients;
    let rawActions;
    try {
      const completion1 = await openai.chat.completions.create({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: ingredientPrompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { schema: ingredientArraySchema },
        },
        max_tokens: 500,
      });

      const contentString1 = completion1.choices[0]?.message?.content;
      console.log(
        "Raw JSON response from Perplexity (Layer 1 - Ingredients):",
        contentString1
      );
      //clean up raw strings before parsing to avoid errors of incomplete strings/objects.
      let cleanedString1 = contentString1.trim();
      if (cleanedString1.startsWith("```json")) {
        cleanedString1 = cleanedString1.substring(7);
      }
      if (cleanedString1.endsWith("```")) {
        cleanedString1 = cleanedString1.substring(0, cleanedString1.length - 3);
      }
      cleanedString1 = cleanedString1.trim();
      ingredientsData = JSON.parse(cleanedString1);

      rawIngredients = cleanedString1;

      primaryAiResponseText = cleanedString1;
    } catch (parseError) {
      console.error("Error in Layer 1 (Ingredient JSON Schema):", parseError);
      return NextResponse.json(
        {
          error: `Failed to get or parse structured ingredient data: ${parseError.message}`,
        },
        { status: 500 }
      );
    }
    // --- Layer 2: Generate actionable summary (as JSON) from the structured ingredient data ---
    const summaryPrompt = `Based on the following structured ingredient analysis, extract and summarize the most crucial actionable insights for a small beauty business owner looking to formulate new products. Your response MUST be a JSON object that strictly conforms to the provided JSON schema. Do NOT include any additional text or markdown outside the JSON.

    Structured Ingredient Analysis:
    ${primaryAiResponseText}

    `;

    let actionableSummaryJson;
    try {
      const completion2 = await openai.chat.completions.create({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: summaryPrompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { schema: actionableSummarySchema },
        },
        max_tokens: 500, // Adjusted max_tokens for summary
      });

      const contentString2 = completion2.choices[0]?.message?.content;

      let cleanedString2 = contentString2.trim();
      if (cleanedString2.startsWith("```json")) {
        cleanedString2 = cleanedString2.substring(7);
      } else if (cleanedString2.startsWith("```")) {
        cleanedString2 = cleanedString2.substring(3);
      }
      if (cleanedString2.endsWith("```")) {
        cleanedString2 = cleanedString2.substring(0, cleanedString2.length - 3);
      }
      cleanedString2 = cleanedString2.trim();

      console.log("Cleaned string for Layer 2 parse:", cleanedString2);

      // Parse the cleaned string
      actionableSummaryJson = JSON.parse(cleanedString2);
      rawActions = cleanedString2;

      console.log(
        "Raw JSON response from Perplexity (Layer 2 - Summary):",
        contentString2
      );
    } catch (error) {
      console.log("error", error);
    }

    // Return both the structured ingredient data and the actionable summary
    return NextResponse.json({
      ingredients: ingredientsData || rawIngredients, // Structured array of ingredient objects
      actionableSummary: actionableSummaryJson || rawActions, // Structured JSON object for summary
    });
  } catch (error) {
    console.error("Critical error in Perplexity API route:", error);
    return NextResponse.json(
      { error: "Failed to process AI request. An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
