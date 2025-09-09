export interface Position {
  id: string;
  name: string;
  description: string;
  totalCandidates: number;
  hiredCount: number;
  interviewedCount: number;
  pendingCount: number;
  rejectedCount: number;
  organizationId: string;
  createdAt: Date;
  interviewId: string;
}

export interface PositionCandidate {
  id: string;
  name: string;
  email: string;
  position: string;
  score: number;
  status: "selected" | "potential" | "not_selected" | "no_status";
  interviewDate: string;
  experience: string;
  skills: string[];
  performanceRating: string;
  interviewId: string;
  callId: string;
  duration?: number;
  tabSwitchCount?: number;
}

export interface PositionStats {
  totalCandidates: number;
  hiredCount: number;
  interviewedCount: number;
  pendingCount: number;
  rejectedCount: number;
  averageScore: number;
  topPerformers: PositionCandidate[];
}
