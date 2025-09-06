import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";
 
export const maxDuration = 60;
 
export async function POST(req: Request, res: Response) {
  logger.info("generate-interview-questions request received");
  const body = await req.json();
 
  // Check if Groq API key is available
  if (!process.env.GROQ_API_KEY) {
    logger.error("Groq API key not found");

    return NextResponse.json(
      { error: "Groq API key not configured" },
      { status: 500 },
    );
  }
 
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
 
  try {
    const baseCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: generateQuestionsPrompt(body),
        },
      ],
      response_format: { type: "json_object" },
    });
 
    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content;
 
    logger.info("Interview questions generated successfully");
 
    return NextResponse.json(
      {
        response: content,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating interview questions", {error});
 
    return NextResponse.json(
      {
        error: "internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    );
  }
}