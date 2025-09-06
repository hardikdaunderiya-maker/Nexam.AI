"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useOrganization, useClerk } from "@clerk/nextjs";
import { Position } from "@/types/position";
import { PositionService } from "@/services/positions.service";

interface PositionsContextType {
  positions: Position[];
  positionsLoading: boolean;
  refreshPositions: () => Promise<void>;
}

const PositionsContext = createContext<PositionsContextType | undefined>(undefined);

export function PositionsProvider({ children }: { children: React.ReactNode }) {
  const { organization } = useOrganization();
  const { user } = useClerk();
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = useState<boolean>(true);

  const fetchPositions = useCallback(async () => {
    if (!organization?.id && !user?.id) {
      console.log("No organization ID or user ID, setting positions to empty");
      setPositions([]);
      setPositionsLoading(false);

      return;
    }

    console.log("Fetching positions for organization:", organization?.id, "and user:", user?.id);
    setPositionsLoading(true);
    try {
      const positionsData = await PositionService.getAllPositions(organization?.id || '', user?.id);
      console.log("Fetched positions data:", positionsData.length, "positions");
      setPositions(positionsData);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setPositions([]);
    } finally {
      setPositionsLoading(false);
    }
  }, [organization?.id, user?.id]);

  const refreshPositions = async () => {
    await fetchPositions();
  };

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return (
    <PositionsContext.Provider
      value={{
        positions,
        positionsLoading,
        refreshPositions,
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
}

export function usePositions() {
  const context = useContext(PositionsContext);
  if (context === undefined) {
    throw new Error("usePositions must be used within a PositionsProvider");
  }

  return context;
}
