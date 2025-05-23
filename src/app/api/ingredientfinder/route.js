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
            description: "The common name of the ingredient.",
          },
          function: {
            type: "string",
            description:
              "The primary function or role of the ingredient in a cosmetic product.",
          },
          clinicalStudies: {
            type: "string",
            description:
              "A summary of any relevant clinical studies or scientific evidence supporting its claims, or 'N/A' if none are readily available.",
          },
          marketTrendAnalysis: {
            type: "string",
            description:
              "An analysis of its current trend, popularity, and relevance in the beauty market.",
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

    Request: "${prompt}"
    `;

    let ingredientsData; // This will hold the parsed JSON array of ingredients
    let primaryAiResponseText; // Will hold stringified ingredients data for the next prompt

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

      ingredientsData = JSON.parse(contentString1);

      primaryAiResponseText = contentString1;
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
      actionableSummaryJson = JSON.parse(contentString2);
      //actionableSummaryJson = JSON.stringify(contentString2, null, 2);
      console.log(
        "Raw JSON response from Perplexity (Layer 2 - Summary):",
        contentString2
      );
    } catch (error) {
      console.log("error", error);
    }

    // Return both the structured ingredient data and the actionable summary
    return NextResponse.json({
      ingredients: ingredientsData, // Structured array of ingredient objects
      actionableSummary: actionableSummaryJson, // Structured JSON object for summary
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
