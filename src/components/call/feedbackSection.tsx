import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Using simple div elements instead of Badge and Progress components for now
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface ATSScore {
  score: number;
  max_score: number;
  factors: {
    keyword_match: number;
    experience_relevance: number;
    skills_alignment: number;
    education_match: number;
    format_quality: number;
  };
  improvement_suggestions: string[];
}

interface TopicFeedback {
  topic: string;
  questions_asked: string[];
  candidate_response_summary: string;
  resume_alignment: string;
  performance_rating: number;
  feedback: string;
  areas_for_improvement: string[];
}

interface OverallAssessment {
  resume_interview_consistency: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

interface FeedbackData {
  ats_score: ATSScore;
  topic_wise_feedback: TopicFeedback[];
  overall_assessment: OverallAssessment;
}

interface Props {
  callId: string;
}

function FeedbackSection({ callId }: Props) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post("/api/generate-resume-feedback", {
          callId,
        });

        setFeedbackData(response.data.feedback);
      } catch (error: any) {
        console.error("Error generating feedback:", error);
        const errorMessage = error.response?.data?.error || "Failed to generate feedback";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (callId) {
      generateFeedback();
    }
  }, [callId]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) {
      return "text-green-600";
    }
    if (rating >= 3) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toUpperCase()) {
      case "SELECTED":
        return "bg-green-100 text-green-800";
      case "POTENTIAL":
        return "bg-yellow-100 text-yellow-800";
      case "NOT_SELECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="bg-slate-200 rounded-2xl min-h-[200px] p-4 px-5 mb-[150px]">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <p className="font-semibold">Resume Feedback</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-slate-600 mb-4 text-center">
            {error}
          </p>
          <p className="text-sm text-slate-500 text-center">
            To enable resume feedback, please upload a resume when creating the interview.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-200 rounded-2xl min-h-[200px] p-4 px-5 mb-[150px]">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <p className="font-semibold">Resume Feedback</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Generating feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!feedbackData && !loading && !error) {
    return (
      <div className="bg-slate-200 rounded-2xl min-h-[200px] p-4 px-5 mb-[150px]">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <p className="font-semibold">Resume Feedback</p>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No feedback available</p>
        </div>
      </div>
    );
  }

  if (!feedbackData) {
    return null;
  }

  return (
    <div className="bg-slate-200 rounded-2xl min-h-[200px] p-4 px-5 mb-[150px]">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" />
        <p className="font-semibold">Resume Feedback</p>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        {/* ATS Score Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ATS Score Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-blue-600">
                {feedbackData.ats_score.score}
              </div>
              <div className="text-sm text-slate-600">
                / {feedbackData.ats_score.max_score}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(feedbackData.ats_score.score / feedbackData.ats_score.max_score) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {Object.entries(feedbackData.ats_score.factors).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            {feedbackData.ats_score.improvement_suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Improvement Suggestions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {feedbackData.ats_score.improvement_suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-slate-600">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic-wise Feedback */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Topic-wise Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackData.topic_wise_feedback.map((topic, index) => (
                <div key={index} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">{topic.topic}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getRatingColor(topic.performance_rating)}`}>
                        {topic.performance_rating}/5
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={`star-${star}`}
                            className={`w-4 h-4 ${
                              star <= topic.performance_rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Questions Asked:</h5>
                      <ul className="list-disc list-inside text-sm text-slate-600">
                        {topic.questions_asked.map((question, qIndex) => (
                          <li key={`question-${qIndex}`}>{question}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Response Summary:</h5>
                      <p className="text-sm text-slate-600">{topic.candidate_response_summary}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Resume Alignment:</h5>
                      <p className="text-sm text-slate-600">{topic.resume_alignment}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Feedback:</h5>
                      <p className="text-sm text-slate-600">{topic.feedback}</p>
                    </div>

                    {topic.areas_for_improvement.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">Areas for Improvement:</h5>
                        <ul className="list-disc list-inside text-sm text-slate-600">
                          {topic.areas_for_improvement.map((area, aIndex) => (
                            <li key={`improvement-${aIndex}`}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Resume-Interview Consistency:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${feedbackData.overall_assessment.resume_interview_consistency}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {feedbackData.overall_assessment.resume_interview_consistency}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Recommendation:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(feedbackData.overall_assessment.recommendation)}`}>
                  {feedbackData.overall_assessment.recommendation}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Strengths
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {feedbackData.overall_assessment.strengths.map((strength, index) => (
                      <li key={`strength-${index}`} className="text-sm text-slate-600">{strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Areas to Improve
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {feedbackData.overall_assessment.weaknesses.map((weakness, index) => (
                      <li key={`weakness-${index}`} className="text-sm text-slate-600">{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default FeedbackSection;
