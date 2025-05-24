import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export async function POST(request) {
  //Need to take in previously found ingredient data
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    //Actionable Summary Object ---
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

    //Generate actionable summary (as JSON) from the structured ingredient data ---
    const summaryPrompt = `Based on the following structured ingredient analysis, extract and summarize the most crucial actionable insights for a small beauty business owner looking to formulate new products. Your response MUST be a JSON object that strictly conforms to the provided JSON schema. Do NOT include any additional text or markdown outside the JSON.

    Structured Ingredient Analysis:
    ${primaryingredientFoundText}

    `;
    let actionableSummaryJson;

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

    return NextResponse.json({
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
