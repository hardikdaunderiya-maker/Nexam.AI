import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type ResumeFeedbackData = {
  ats_score: {
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
  };
  topic_wise_feedback: Array<{
    topic: string;
    questions_asked: string[];
    candidate_response_summary: string;
    resume_alignment: string;
    performance_rating: number;
    feedback: string;
    areas_for_improvement: string[];
  }>;
  overall_assessment: {
    resume_interview_consistency: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  };
};

export class ResumeFeedbackCacheService {
  /**
   * Get cached resume feedback by call ID
   */
  static async getCachedFeedback(callId: string): Promise<ResumeFeedbackData | null> {
    try {
      const { data, error } = await supabase
        .from("resume_feedback_cache")
        .select("feedback_data")
        .eq("call_id", callId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return null;
        }
        throw error;
      }

      return data.feedback_data as ResumeFeedbackData;
    } catch (error) {
      console.error("Error getting cached feedback:", error);
      
      return null;
    }
  }

  /**
   * Cache resume feedback for a call
   */
  static async cacheFeedback(
    callId: string,
    interviewId: string,
    feedbackData: ResumeFeedbackData
  ): Promise<boolean> {
    try {
      console.log(`🔄 Attempting to cache feedback for call: ${callId}, interview: ${interviewId}`);
      
      const { data, error } = await supabase
        .from("resume_feedback_cache")
        .upsert({
          call_id: callId,
          interview_id: interviewId,
          feedback_data: feedbackData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "call_id"
        })
        .select();

      if (error) {
        console.error("❌ Supabase error details:", error);
        throw error;
      }

      console.log(`✅ Resume feedback cached successfully:`, data);
      
      return true;
    } catch (error) {
      console.error("❌ Error caching feedback:", error);
      
      return false;
    }
  }

  /**
   * Check if feedback exists for a call
   */
  static async hasCachedFeedback(callId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("resume_feedback_cache")
        .select("id")
        .eq("call_id", callId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return false;
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking cached feedback:", error);
      
      return false;
    }
  }

  /**
   * Delete cached feedback for a call
   */
  static async deleteCachedFeedback(callId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("resume_feedback_cache")
        .delete()
        .eq("call_id", callId);

      if (error) {
        
        throw error;
      }

      console.log(`🗑️ Cached feedback deleted for call: ${callId}`);
      
      return true;
    } catch (error) {
      console.error("Error deleting cached feedback:", error);
      
      return false;
    }
  }

  /**
   * Get all cached feedback for an interview
   */
  static async getCachedFeedbackByInterview(interviewId: string): Promise<ResumeFeedbackData[]> {
    try {
      const { data, error } = await supabase
        .from("resume_feedback_cache")
        .select("feedback_data")
        .eq("interview_id", interviewId);

      if (error) {
        throw error;
      }

      return data.map(item => item.feedback_data as ResumeFeedbackData);
    } catch (error) {
      console.error("Error getting cached feedback by interview:", error);
      
      return [];
    }
  }
}
