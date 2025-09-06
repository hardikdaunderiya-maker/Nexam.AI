import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and HR analyst. Your task is to analyze a candidate's resume and their interview responses to provide comprehensive feedback.`;

const getResumeFeedbackPrompt = (
  resumeText: string,
  transcript: string,
  interviewQuestions: string
) => {
  return `
Analyze the following resume and interview transcript to provide comprehensive feedback:

RESUME CONTENT:
${resumeText}

INTERVIEW TRANSCRIPT:
${transcript}

INTERVIEW QUESTIONS ASKED:
${interviewQuestions}

Please provide a detailed analysis in the following JSON format:

{
  "ats_score": {
    "score": 85,
    "max_score": 100,
    "factors": {
      "keyword_match": 20,
      "experience_relevance": 25,
      "skills_alignment": 20,
      "education_match": 15,
      "format_quality": 15
    },
    "improvement_suggestions": [
      "Add more industry-specific keywords",
      "Quantify achievements with numbers"
    ]
  },
  "topic_wise_feedback": [
    {
      "topic": "Technical Skills",
      "questions_asked": [
        "Can you explain your experience with React?"
      ],
      "candidate_response_summary": "Candidate mentioned 2 years of React experience with component development",
      "resume_alignment": "Strong - Resume shows React projects and certifications",
      "performance_rating": 4,
      "feedback": "Good technical knowledge demonstrated, aligns well with resume claims",
      "areas_for_improvement": [
        "Could provide more specific examples of complex React implementations"
      ]
    }
  ],
  "overall_assessment": {
    "resume_interview_consistency": 85,
    "strengths": [
      "Strong technical background",
      "Good communication skills"
    ],
    "weaknesses": [
      "Limited leadership experience",
      "Could improve problem-solving examples"
    ],
    "recommendation": "POTENTIAL"
  }
}

Ensure the response is valid JSON and covers all major topics from the resume that were discussed in the interview.
`;
};

export async function POST(req: Request) {
  logger.info("generate-resume-feedback request received");

  try {
    const body = await req.json();
    const { callId } = body;

    if (!callId) {

      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 }
      );
    }

    // Get call details and interview information
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(response.interview_id);

    if (!interview?.document_context) {

      return NextResponse.json(
        { error: "No resume found for this interview. Please upload a resume when creating the interview." },
        { status: 400 }
      );
    }

    if (!response.details?.transcript) {

      return NextResponse.json(
        { error: "No transcript available for this call" },
        { status: 400 }
      );
    }

    const transcript = response.details.transcript;
    const questions = interview?.questions || [];
    const interviewQuestions = questions
      .map((q: any, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      logger.error("GROQ_API_KEY is not configured");

      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const prompt = getResumeFeedbackPrompt(interview.document_context, transcript, interviewQuestions);

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
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      logger.error("Groq API error:", errorText);

      return NextResponse.json(
        { error: "Failed to generate resume feedback" },
        { status: 500 }
      );
    }

    const data = await groqResponse.json();
    const feedback = data.choices[0]?.message?.content;

    logger.info("Resume feedback generated successfully");

    const feedbackContent = feedback as string;
    
    return NextResponse.json(
      { feedback: JSON.parse(feedbackContent || "{}") },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error generating resume feedback:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
