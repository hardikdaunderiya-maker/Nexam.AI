import { NextResponse } from "next/server";
import { ResumeFeedbackCacheService } from "@/services/resumeFeedbackCache.service";

// GET - Check if feedback is cached for a call
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('callId');
    const interviewId = searchParams.get('interviewId');

    if (callId) {
      const hasCached = await ResumeFeedbackCacheService.hasCachedFeedback(callId);
      const cachedFeedback = await ResumeFeedbackCacheService.getCachedFeedback(callId);
      
      return NextResponse.json({
        callId,
        hasCached,
        feedback: cachedFeedback,
      });
    }

    if (interviewId) {
      const feedbackList = await ResumeFeedbackCacheService.getCachedFeedbackByInterview(interviewId);
      
      return NextResponse.json({
        interviewId,
        count: feedbackList.length,
        feedbackList,
      });
    }

    return NextResponse.json(
      { error: "callId or interviewId parameter is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in cache GET:", error);

    return NextResponse.json(
      { error: "Failed to check cache" },
      { status: 500 }
    );
  }
}

// DELETE - Clear cache for a call
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json(
        { error: "callId parameter is required" },
        { status: 400 }
      );
    }

    const deleted = await ResumeFeedbackCacheService.deleteCachedFeedback(callId);
    
    return NextResponse.json({
      success: deleted,
      message: deleted ? "Cache cleared successfully" : "Failed to clear cache",
      callId,
    });
  } catch (error) {
    console.error("Error in cache DELETE:", error);
    
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
