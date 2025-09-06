"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Filter, TrendingUp, Star, X } from "lucide-react";
import { PositionService } from "@/services/positions.service";
import { Position, PositionCandidate } from "@/types/position";
import CandidateCard from "@/components/dashboard/hrm/candidateCard";
import CallInfo from "@/components/call/callInfo";

function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const positionId = params.positionId as string;
  const callId = searchParams.get('call');
  
  const [position, setPosition] = useState<Position | null>(null);
  const [candidates, setCandidates] = useState<PositionCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<PositionCandidate[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [showCallDetails, setShowCallDetails] = useState<boolean>(false);

  useEffect(() => {
    const fetchPositionData = async () => {
      if (!positionId) return;
      
      setLoading(true);
      try {
        const [positionData, candidatesData] = await Promise.all([
          PositionService.getPositionById(positionId),
          PositionService.getCandidatesByPosition(positionId)
        ]);
        
        setPosition(positionData);
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
      } catch (error) {
        console.error("Error fetching position data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositionData();
  }, [positionId]);

  useEffect(() => {
    // Show call details if call parameter is present
    if (callId) {
      setShowCallDetails(true);
    } else {
      setShowCallDetails(false);
    }
  }, [callId]);

  useEffect(() => {
    let filtered = [...candidates];

    switch (filterType) {
      case "top5":
        filtered = candidates
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        break;
      case "top10":
        filtered = candidates
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        break;
      case "selected":
        filtered = candidates.filter(c => c.status === "selected");
        break;
      case "potential":
        filtered = candidates.filter(c => c.status === "potential");
        break;
      case "not_selected":
        filtered = candidates.filter(c => c.status === "not_selected");
        break;
      case "no_status":
        filtered = candidates.filter(c => c.status === "no_status");
        break;
      default:
        // "all" - no filtering
        break;
    }

    setFilteredCandidates(filtered);
  }, [candidates, filterType]);

  const handleBackClick = () => {
    router.push("/dashboard/hrm");
  };

  const handleCloseCallDetails = () => {
    setShowCallDetails(false);
    // Remove call parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('call');
    router.replace(url.pathname);
  };

  const handleCandidateStatusChange = (callId: string, newStatus: string) => {
    // Update the candidate status in the local state
    setCandidates(prevCandidates => 
      prevCandidates.map(candidate => 
        candidate.callId === callId 
          ? { ...candidate, status: newStatus as any }
          : candidate
      )
    );
  };

  const handleDeleteResponse = (callId: string) => {
    // Remove the candidate from the local state
    setCandidates(prevCandidates => 
      prevCandidates.filter(candidate => candidate.callId !== callId)
    );
    setShowCallDetails(false);
  };

  // Helper functions for status, score, performance colors
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
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
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

  if (loading) {
    return (
      <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </main>
    );
  }

  if (!position) {
    return (
      <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Position not found</h3>
          <p className="text-gray-600">The position you're looking for doesn't exist.</p>
        </div>
      </main>
    );
  }

  // If call details should be shown, render the call details component
  if (showCallDetails && callId) {
    return (
      <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={handleCloseCallDetails} 
            variant="ghost" 
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="mt-5 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Call Details - {position.name}
            </h1>
            <p className="text-gray-600">Viewing call: {callId}</p>
          </div>
        </div>
        
        <CallInfo
          call_id={callId}
          onDeleteResponse={handleDeleteResponse}
          onCandidateStatusChange={handleCandidateStatusChange}
        />
      </main>
    );
  }

  return (
    <main className="mt-10 p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {position.name}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                {position.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 pl-12">
            <span>Created: {position.createdAt.toLocaleDateString()}</span>
            <span>•</span>
            <span>Position ID: {position.id.slice(0, 8)}...</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active Position
            </span>
          </div>
        </div>

        {/* Position Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{position.totalCandidates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Selected</p>
                  <p className="text-2xl font-bold text-green-600">{position.hiredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Potential</p>
                  <p className="text-2xl font-bold text-blue-600">{position.interviewedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Not Selected</p>
                  <p className="text-2xl font-bold text-red-600">{position.rejectedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="top5">Top 5 Performers</SelectItem>
              <SelectItem value="top10">Top 10 Performers</SelectItem>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="potential">Potential</SelectItem>
              <SelectItem value="not_selected">Not Selected</SelectItem>
              <SelectItem value="no_status">No Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
            />
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your filter criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default PositionDetailPage;