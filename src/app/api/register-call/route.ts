import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  try {
    logger.info("register-call request received");

    // Check API key
    if (!process.env.RETELL_API_KEY) {
      logger.error("RETELL_API_KEY is not configured");
      
      return NextResponse.json(
        { error: "Retell API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const interviewerId = body.interviewer_id;

    // Debug: Log the received data
    logger.info(`Received interviewer_id: ${interviewerId}`);
    logger.info(`Received dynamic_data:`, body.dynamic_data);

    // Validate input
    if (!interviewerId) {
      logger.error("Missing interviewer_id in request body");
      
      return NextResponse.json(
        { error: "Missing interviewer_id" },
        { status: 400 }
      );
    }

    // Fetch interviewer
    const interviewer = await InterviewerService.getInterviewer(Number(interviewerId));
    
    // Debug: Log the interviewer data
    logger.info(`Fetched interviewer:`, interviewer);

    if (!interviewer) {
      logger.error(`Interviewer not found for ID: ${interviewerId}`);
      
      return NextResponse.json(
        { error: "Interviewer not found" },
        { status: 404 }
      );
    }

    if (!interviewer.agent_id) {
      logger.error(`Interviewer missing agent_id: ${interviewerId}`, interviewer);
      
      return NextResponse.json(
        { error: "Interviewer missing agent_id" },
        { status: 400 }
      );
    }

    // Debug: Log the agent_id being used
    logger.info(`Using agent_id: ${interviewer.agent_id}`);

    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: "agent_a07c0780865a69e9e17947c01c",
      retell_llm_dynamic_variables: body.dynamic_data,
    });

    logger.info("Call registered successfully");
    
    return NextResponse.json(
      { registerCallResponse },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error in register-call:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}