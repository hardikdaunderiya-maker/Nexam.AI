import { NextResponse } from "next/server";
import { saveResumeMappingToFile } from "@/lib/resumeMapping";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { interviewId, filePath } = body;

    if (!interviewId || !filePath) {
      return NextResponse.json(
        { success: false, error: "Interview ID and file path are required" },
        { status: 400 }
      );
    }

    console.log(`Saving resume mapping: ${interviewId} -> ${filePath}`);
    await saveResumeMappingToFile(interviewId, filePath);
    console.log(`Resume mapping saved successfully for interview: ${interviewId}`);

    return NextResponse.json({
      success: true,
      message: "Resume mapping saved successfully",
    });

  } catch (error) {
    console.error("Error saving resume mapping:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save resume mapping" },
      { status: 500 }
    );
  }
}
