import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock, User, ExternalLink } from "lucide-react";
import { PositionCandidate } from "@/types/position";
import { useRouter } from "next/navigation";

interface CandidateCardProps {
  candidate: PositionCandidate;
  onClick?: () => void;
}

function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-100 text-green-800";
      case "potential":
        return "bg-blue-100 text-blue-800";
      case "not_selected":
        return "bg-red-100 text-red-800";
      case "no_status":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return "text-green-600";
    }
    if (score >= 80) {
      return "text-blue-600";
    }
    if (score >= 70) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "text-green-600";
      case "Good":
        return "text-blue-600";
      case "Average":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to HRM position detail page with call parameter
      const callUrl = `/dashboard/hrm/${candidate.interviewId}?call=${candidate.callId}`;
      router.push(callUrl);
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case "no_status":
        return "No Status";
      case "not_selected":
        return "Not Selected";
      case "potential":
        return "Potential";
      case "selected":
        return "Selected";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group relative"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-lg font-semibold text-gray-900">
                {candidate.name}
              </CardTitle>
              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <p className="text-sm text-gray-600">{candidate.email}</p>
            <p className="text-sm font-medium text-indigo-600 mt-1">
              {candidate.position}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className={`font-bold text-lg ${getScoreColor(candidate.score)}`}>
              {candidate.score}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
              {getStatusDisplayText(candidate.status)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Interview Date:</span>
            <span className="text-sm font-semibold text-gray-900">{candidate.interviewDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration:</span>
            <span className="text-sm font-semibold text-gray-900">
              {candidate.duration ? `${Math.round(candidate.duration / 60)} min` : 'N/A'}
            </span>
          </div>

          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <span className="text-sm text-gray-600 block mb-2">Skills:</span>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {candidate.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{candidate.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Performance:</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className={`text-sm font-semibold ${getPerformanceColor(candidate.performanceRating)}`}>
                {candidate.performanceRating}
              </span>
            </div>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
            View Details
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CandidateCard;