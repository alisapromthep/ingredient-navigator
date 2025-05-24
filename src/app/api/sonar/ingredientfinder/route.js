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
              "The primary function or role or usages (concise, 2-3 sentences).",
          },
        },
        required: ["name", "function"],
        additionalProperties: false,
      },
    };

    //Get structured ingredient information
    const ingredientSearchPrompt = `Based on the following request, identify key ingredients and provide their function details and usages. Your response MUST be a JSON array where each object strictly conforms to the provided JSON schema. Do NOT include any additional text or markdown outside the JSON.
Each description should be as concise as possible while being informative. 

Request: "${prompt}"
`;

    let ingredientsData; // This will hold the parsed JSON array of ingredients
    let rawIngredients;

    try {
      const ingredientFound = await openai.chat.completions.create({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: ingredientSearchPrompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { schema: ingredientArraySchema },
        },
        max_tokens: 500,
      });

      const contentString1 = ingredientFound.choices[0]?.message?.content;
      console.log(
        "Raw JSON response from Perplexity (Ingredients):",
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
      primaryingredientFoundText = cleanedString1;
    } catch (parseError) {
      console.error("Error in Layer 1 (Ingredient JSON Schema):", parseError);
      return NextResponse.json(
        {
          error: `Failed to get or parse structured ingredient data: ${parseError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ingredients: ingredientsData || rawIngredients, // Structured array of ingredient objects
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
