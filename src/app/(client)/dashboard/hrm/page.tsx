"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { usePositions } from "@/contexts/positions.context";
import { Position } from "@/types/position";
import PositionCard from "@/components/dashboard/hrm/positionCard";

function HRMPage() {
  const router = useRouter();
  const { positions, positionsLoading } = usePositions();

  const handlePositionClick = (position: Position) => {
    router.push(`/dashboard/hrm/${position.id}`);
  };


  if (positionsLoading) {
    return (
      <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="mt-10 flex flex-col items-left">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="h-8 w-8 text-indigo-600" />
          <h2 className="text-2xl font-semibold tracking-tight">
            HRM - Positions
          </h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Manage your hiring positions and track candidate progress
        </p>

        <div className="relative flex items-center mt-1 flex-wrap">
          {positions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              onClick={() => handlePositionClick(position)}
            />
          ))}
        </div>

        {positions.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No positions found</h3>
            <p className="text-gray-600">Create interviews in the Interviews section to see them here as positions.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default HRMPage;
