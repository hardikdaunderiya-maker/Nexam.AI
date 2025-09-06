import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Clock, XCircle, TrendingUp } from "lucide-react";
import { Position } from "@/types/position";

interface PositionCardProps {
  position: Position;
  onClick: () => void;
}

function PositionCard({ position, onClick }: PositionCardProps) {
  const getStatusColor = (count: number, total: number) => {
    if (total === 0) {
      return "text-gray-500";
    }
    const percentage = (count / total) * 100;
    if (percentage >= 50) {
      return "text-green-600";
    }
    if (percentage >= 25) {
      return "text-blue-600";
    }

    return "text-yellow-600";
  };

  return (
    <Card 
      className="relative p-0 mt-6 inline-block cursor-pointer h-64 w-56 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="w-full h-32 overflow-hidden bg-indigo-600 flex items-center text-center px-4 py-4">
          <CardTitle className="w-full text-white text-lg leading-tight">
            {position.name}
          </CardTitle>
        </div>
        
        <div className="flex flex-row items-center mx-4 py-4">
          <div className="w-full overflow-hidden space-y-2">
            <div className="text-black text-sm font-semibold whitespace-nowrap">
              Total:{" "}
              <span className="font-normal">
                {position.totalCandidates}
              </span>
            </div>
            <div className="text-black text-sm font-semibold whitespace-nowrap">
              Selected:{" "}
              <span className={`font-normal ${getStatusColor(position.hiredCount, position.totalCandidates)}`}>
                {position.hiredCount}
              </span>
            </div>
            <div className="text-black text-sm font-semibold whitespace-nowrap">
              Potential:{" "}
              <span className="font-normal text-blue-600">
                {position.interviewedCount}
              </span>
            </div>
            <div className="text-black text-sm font-semibold whitespace-nowrap">
              Not Selected:{" "}
              <span className="font-normal text-red-600">
                {position.rejectedCount}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PositionCard;