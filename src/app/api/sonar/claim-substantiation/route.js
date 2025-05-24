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

export async function POST(request) {}
export const runtime = "nodejs";
