import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Position, PositionCandidate, PositionStats } from "@/types/position";

const supabase = createClientComponentClient();

// Helper function to convert database status to display status
const convertStatusToDisplay = (dbStatus: string | null): "selected" | "potential" | "not_selected" | "no_status" => {
  switch (dbStatus) {
    case "SELECTED":
      return "selected";
    case "POTENTIAL":
      return "potential";
    case "NOT_SELECTED":
      return "not_selected";
    case "NO_STATUS":
    default:
      return "no_status";
  }
};

const getAllPositions = async (organizationId: string, userId?: string): Promise<Position[]> => {
  try {
    // First, get all interviews using the same logic as InterviewService
    const { data: interviews, error: interviewError } = await supabase
      .from("interview")
      .select(`*`)
      .or(`organization_id.eq.${organizationId}${userId ? `,user_id.eq.${userId}` : ''}`)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (interviewError) {
      throw interviewError;
    }

    console.log("Fetched interviews for HRM:", interviews?.length || 0, "interviews");

    // Convert each interview to a position (no grouping - each interview is a position)
    const positions: Position[] = interviews?.map((interview: any) => {
      const position: Position = {
        id: interview.id,
        name: interview.name || "Unnamed Interview",
        description: interview.description || "",
        totalCandidates: 0,
        hiredCount: 0,
        interviewedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        organizationId: interview.organization_id,
        createdAt: new Date(interview.created_at),
        interviewId: interview.id,
      };

      return position;
    }) || [];

    // Now fetch response data for each position separately to get accurate counts
    for (const position of positions) {
      try {
        const { data: responses, error: responseError } = await supabase
          .from("response")
          .select(`
            id,
            candidate_status,
            analytics
          `)
          .eq("interview_id", position.interviewId)
          .eq("is_ended", true);

        if (!responseError && responses) {
          position.totalCandidates = responses.length;

          responses.forEach((response: any) => {
            const status = response.candidate_status || "NO_STATUS";
            switch (status) {
              case "SELECTED":
                position.hiredCount++;
                break;
              case "POTENTIAL":
                position.interviewedCount++;
                break;
              case "NOT_SELECTED":
                position.rejectedCount++;
                break;
              case "NO_STATUS":
              default:
                position.pendingCount++;
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching responses for position ${position.id}:`, error);
      }
    }

    return positions;
  } catch (error) {
    console.error("Error fetching positions:", error);

    return [];
  }
};

const getPositionById = async (positionId: string): Promise<Position | null> => {
  try {
    // First get the interview using simple query
    const { data: interview, error: interviewError } = await supabase
      .from("interview")
      .select(`*`)
      .eq("id", positionId)
      .single();

    if (interviewError) {
      throw interviewError;
    }

    const position: Position = {
      id: interview.id,
      name: interview.name || "Unnamed Interview",
      description: interview.description || "",
      totalCandidates: 0,
      hiredCount: 0,
      interviewedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      organizationId: interview.organization_id,
      createdAt: new Date(interview.created_at),
      interviewId: interview.id,
    };

    // Now fetch response data separately
    try {
      const { data: responses, error: responseError } = await supabase
        .from("response")
        .select(`
          id,
          candidate_status,
          analytics
        `)
        .eq("interview_id", positionId)
        .eq("is_ended", true);

      if (!responseError && responses) {
        position.totalCandidates = responses.length;

        responses.forEach((response: any) => {
          const status = response.candidate_status || "NO_STATUS";
          switch (status) {
            case "SELECTED":
              position.hiredCount++;
              break;
            case "POTENTIAL":
              position.interviewedCount++;
              break;
            case "NOT_SELECTED":
              position.rejectedCount++;
              break;
            case "NO_STATUS":
            default:
              position.pendingCount++;
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching responses for position ${positionId}:`, error);
    }

    return position;
  } catch (error) {
    console.error("Error fetching position:", error);

    return null;
  }
};

const getCandidatesByPosition = async (positionId: string): Promise<PositionCandidate[]> => {
  try {
    const { data: responses, error } = await supabase
      .from("response")
      .select(`
        id,
        name,
        email,
        candidate_status,
        created_at,
        duration,
        tab_switch_count,
        call_id,
        analytics
      `)
      .eq("interview_id", positionId)
      .eq("is_ended", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return responses?.map((response: any) => {
      const analytics = response.analytics || {};
      const score = analytics.overallScore || 0;
      
      return {
        id: response.id.toString(),
        name: response.name || "Anonymous",
        email: response.email || "",
        position: "Software Engineer", // This would come from the interview objective
        score: Math.round(score),
        status: convertStatusToDisplay(response.candidate_status),
        interviewDate: new Date(response.created_at).toISOString().split('T')[0],
        experience: "Not specified", // This would need to be extracted from analytics or added to response
        skills: analytics.skills || [],
        performanceRating: score >= 90 ? "Excellent" : score >= 80 ? "Good" : score >= 70 ? "Average" : "Below Average",
        interviewId: positionId,
        callId: response.call_id,
        duration: response.duration,
        tabSwitchCount: response.tab_switch_count,
      };
    }) || [];
  } catch (error) {
    console.error("Error fetching candidates:", error);

    return [];
  }
};

const getPositionStats = async (positionId: string): Promise<PositionStats | null> => {
  try {
    const candidates = await getCandidatesByPosition(positionId);
    
    const stats: PositionStats = {
      totalCandidates: candidates.length,
      hiredCount: candidates.filter(c => c.status === "selected").length,
      interviewedCount: candidates.filter(c => c.status === "potential").length,
      pendingCount: candidates.filter(c => c.status === "no_status").length,
      rejectedCount: candidates.filter(c => c.status === "not_selected").length,
      averageScore: candidates.length > 0 ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length) : 0,
      topPerformers: candidates
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    };

    return stats;
  } catch (error) {
    console.error("Error fetching position stats:", error);

    return null;
  }
};

export const PositionService = {
  getAllPositions,
  getPositionById,
  getCandidatesByPosition,
  getPositionStats,
};
