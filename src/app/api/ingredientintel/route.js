import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request) {
  console.log("API KEY?????", process.env.PERPLEXITY_API_KEY);
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
    // Expect the full, constructed prompt from the frontend
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = "sonar";

    // Define the JSON Schema for the expected ingredient array output
    // This schema describes an ARRAY of objects, where each object is an ingredient.
    const ingredientArraySchema = {
      type: "array", // The root element is an array
      items: {
        // Each item in the array is an object
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
        ], // All properties are required
        additionalProperties: false, // Do not allow additional properties outside these properties
      },
    };

    // --- First Layer: Get structured ingredient information (as JSON Array) ---
    // The prompt explicitly asks for a JSON array conforming to the schema
    const ingredientPrompt = `Based on the following request, identify key ingredients and provide their details. Your response MUST be a JSON array where each object strictly conforms to the provided JSON schema. Do NOT include any additional text or markdown outside the JSON.

    Request: "${prompt}"
    `;

    let ingredientsData; // This will hold the parsed JSON array of ingredients

    try {
      const completion = await openai.chat.completions.create({
        model: model,
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
        max_tokens: 200,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      console.log("Raw JSON response from Perplexity (Layer 1):", aiResponse);
      // Return the structured ingredient data

      return NextResponse.json(
        {
          ingredients: aiResponse,
        },
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (parseError) {
      console.error("Error in Layer 1 (Ingredient JSON Schema):", parseError);
      return NextResponse.json(
        {
          error: `Failed to get or parse structured ingredient data: ${parseError.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Critical error in Perplexity API route:", error);
    return NextResponse.json(
      { error: "Failed to process AI request. An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
