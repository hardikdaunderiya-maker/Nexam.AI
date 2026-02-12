import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  logger.info("register-call request received");

  try {
    const body = await req.json();

    // Check if API key is configured
    if (!process.env.RETELL_API_KEY) {
      logger.error("RETELL_API_KEY is not configured");
      return NextResponse.json(
        { error: "Retell API key is not configured" },
        { status: 500 }
      );
    }

    // Get interviewer details to retrieve the agent_id
    const interviewer = await InterviewerService.getInterviewer(
      body.interviewer_id
    );

    if (!interviewer || !interviewer.agent_id) {
      logger.error(`Interviewer not found or missing agent_id: ${body.interviewer_id}`);
      return NextResponse.json(
        { error: "Interviewer not found or invalid" },
        { status: 400 }
      );
    }

    logger.info(`Using agent_id: ${interviewer.agent_id} for interviewer: ${interviewer.name}`);

    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: interviewer.agent_id,
      retell_llm_dynamic_variables: body.dynamic_data,
    });

    logger.info("Call registered successfully");

    return NextResponse.json(
      {
        registerCallResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error registering call:", error as Error);
    
    return NextResponse.json(
      { 
        error: "Failed to register call",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}