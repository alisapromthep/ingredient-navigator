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
    const { prompt, activeFilters } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

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
            description: "The primary function(concise, 1-2 sentences).",
          },
        },
        required: ["name", "function"],
        additionalProperties: false,
      },
    };

    const appliedFiltersSchema = {
      type: "object",
      properties: {
        appliedFilters: {
          type: "object",
          description:
            "Confirmation of whether each specified filter was applied.",
          patternProperties: {
            ".*": {
              type: "boolean",
              description:
                "True if the filter was considered and applied, false otherwise.",
            },
          },
          additionalProperties: false,
        },
      },
      required: ["appliedFilters"],
    };

    const ingredientSearchPrompt = `Based on the following request, identify key ingredients and provide their function and usages. Your response MUST be a JSON array where each object strictly conforms to the provided JSON schema. Do NOT include any additional text or markdown outside the JSON. Each description should be as concise as possible while being informative.
    
    Request: "${prompt}"`;

    let ingredientsData;
    let rawIngredientsData;
    let appliedFiltersConfirmation = {};

    try {
      const aiResponse1 = await openai.chat.completions.create({
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

      rawIngredientsData = aiResponse1.choices[0]?.message?.content;
      console.log(
        "Raw JSON response from Perplexity (Ingredients):",
        rawIngredientsData
      );
      let cleanedString1 = rawIngredientsData.trim();
      if (cleanedString1.startsWith("```json")) {
        cleanedString1 = cleanedString1.substring(7);
      }
      if (cleanedString1.endsWith("```")) {
        cleanedString1 = cleanedString1.substring(0, cleanedString1.length - 3);
      }
      cleanedString1 = cleanedString1.trim();
      ingredientsData = JSON.parse(cleanedString1);
    } catch (parseError) {
      console.error("Error in Layer 1 (Ingredient JSON Schema):", parseError);
      return NextResponse.json(
        {
          error: `Failed to get or parse structured ingredient data: ${parseError.message}`,
          details: parseError.message,
          rawResponse: rawIngredientsData,
        },
        { status: 500 }
      );
    }

    let filterConfirmationPrompt = "";
    if (activeFilters && activeFilters.length > 0) {
      filterConfirmationPrompt = `Given the following list of criteria used in an ingredient search: ${activeFilters.join(
        ", "
      )}. Respond ONLY with a JSON object, wrapped in a markdown code block (e.g., \`\`\`json\n{\n  "key": "value"\n}\n\`\`\`).
      The JSON object should have a single top-level key "appliedFilters". Under this key, 
      list EACH of the criteria from the given list as a key.
      The value for each criterion key must be an object with two properties: "status" (boolean) and "explanation" (string).
      Set "status" to 'true' if ALL suggested ingredients strictly satisfy this criterion, 
      'false' if at least one ingredient does not, or 'null' if it cannot be determined from the available information.
      For "explanation", provide a 1-2 sentence reason. If "status" is 'true', the explanation should simply be
      'All suggested ingredients satisfy this filter.'. 
      If "status" is 'false', explain why 
      (e.g., 'One or more ingredients were not found to be vegan.'). If "status" is 'null',
      explain why it cannot be determined (e.g., 'Information on the sustainability of these ingredients was not available for 
      these ingredients.'). Do NOT provide any explanation or additional text outside the JSON block.`;

      try {
        const aiResponse2 = await openai.chat.completions.create({
          model: "sonar",
          messages: [
            {
              role: "user",
              content: filterConfirmationPrompt,
            },
          ],
          max_tokens: 500,
        });

        let rawFilterConfirmationResponseContent =
          aiResponse2.choices[0]?.message?.content;
        console.log(
          "Raw JSON response (Filters):",
          rawFilterConfirmationResponseContent
        );

        let cleanedString2 = rawFilterConfirmationResponseContent.trim();
        if (cleanedString2.startsWith("```json")) {
          cleanedString2 = cleanedString2.substring(7);
        }
        if (cleanedString2.endsWith("```")) {
          cleanedString2 = cleanedString2.substring(
            0,
            cleanedString2.length - 3
          );
        }
        cleanedString2 = cleanedString2.trim();

        const parsedFilters = JSON.parse(cleanedString2);
        if (parsedFilters && parsedFilters.appliedFilters) {
          appliedFiltersConfirmation = parsedFilters.appliedFilters;
        }
      } catch (parseError) {
        console.warn(
          "Error in Layer 2 (Filter Confirmation JSON Schema):",
          parseError
        );
        appliedFiltersConfirmation = {};
      }
    }

    return NextResponse.json({
      ingredientsData,
      appliedFilters: appliedFiltersConfirmation,
      rawResponse: prompt,
    });
  } catch (error) {
    console.error("Critical error in Perplexity API route:", error);
    return NextResponse.json(
      {
        error: "Failed to process AI request. An unexpected error occurred.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
