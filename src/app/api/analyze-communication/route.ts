import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  SYSTEM_PROMPT,
  getCommunicationAnalysisPrompt,
} from "@/lib/prompts/communication-analysis";

export async function POST(req: Request) {
  logger.info("analyze-communication request received");

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      logger.error("GROQ_API_KEY is not configured");

      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    // Make Groq API call
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: getCommunicationAnalysisPrompt(transcript),
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      logger.error("Groq API error:", errorText);
      
      return NextResponse.json(
        { error: "Failed to analyze communication" },
        { status: 500 }
      );
    }

    const data = await groqResponse.json();
    const analysis = data.choices[0]?.message?.content;

    logger.info("Communication analysis completed successfully");

    return NextResponse.json(
      { analysis: JSON.parse(analysis || "{}") },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error analyzing communication skills");

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
