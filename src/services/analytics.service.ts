"use server";

import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Question } from "@/types/interview";
import { Analytics } from "@/types/response";
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/analytics";

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const interviewTranscript = transcript || response.details?.transcript;
    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured");
      return { error: "Groq API key not configured", status: 500 };
    }

    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions,
    );

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
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      return { error: "Failed to generate analytics", status: 500 };
    }

    const data = await groqResponse.json();
    const content = data.choices[0]?.message?.content || "";
    const analyticsResponse = JSON.parse(content);

    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    return { analytics: analyticsResponse, status: 200 };
  } catch (error) {
    console.error("Error in Groq request:", error);

    return { error: "internal server error", status: 500 };
  }
};