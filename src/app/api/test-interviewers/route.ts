import { NextResponse } from "next/server";
import { InterviewerService } from "@/services/interviewers.service";

export async function GET() {
  try {
    console.log("🔍 Fetching all interviewers...");
    const interviewers = await InterviewerService.getAllInterviewers();
    console.log("📋 Found interviewers:", interviewers);
    
    return NextResponse.json({
      count: interviewers.length,
      interviewers: interviewers
    });
  } catch (error) {
    console.error("❌ Error fetching interviewers:", error);
    
    
    return NextResponse.json(
      { error: "Failed to fetch interviewers", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

