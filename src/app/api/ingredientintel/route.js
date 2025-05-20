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
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = "sonar";

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: `Search for active ingredients commonly used in hair texture sprays and explain their function in providing texture. ${
            prompt ? `Consider these additional details: ${prompt}` : ""
          }`,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content;

    if (answer) {
      return NextResponse.json({ result: answer });
    } else {
      return NextResponse.json(
        { error: "No response from Perplexity API" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    return NextResponse.json(
      { error: "Failed to get response from Perplexity API" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
