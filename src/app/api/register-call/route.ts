import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  logger.info("register-call request received");

  const body = await req.json();


  const registerCallResponse = await retellClient.call.createWebCall({
    agent_id: "agent_a07c0780865a69e9e17947c01c",
    retell_llm_dynamic_variables: body.dynamic_data,
  });

  logger.info("Call registered successfully");

  return NextResponse.json(
    {
      registerCallResponse,
    },
    { status: 200 },
  );
}
