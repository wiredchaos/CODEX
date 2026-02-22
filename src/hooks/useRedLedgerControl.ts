import { useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_BASE44_DOMAIN || '';

export interface RedLedgerFlags {
  skyTint: string;
  volatility: number;
  spawnRateMultiplier: number;
}

export interface CaptureResponse {
  success: boolean;
  flags?: RedLedgerFlags;
}

export function useRedLedgerControl() {
  const [flags, setFlags] = useState<RedLedgerFlags>({
    skyTint: '#0a0a0f',
    volatility: 1,
    spawnRateMultiplier: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/redledger/flags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch flags: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFlags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flags');
      // Don't update flags on error - keep last known state
    } finally {
      setIsLoading(false);
    }
  }, [BASE_URL]);

  const captureNode = useCallback(async (nodeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/redledger/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId,
          faction: 'SOVEREIGN',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to capture node: ${response.statusText}`);
      }

      const data: CaptureResponse = await response.json();
      
      // Refetch flags after successful capture
      if (data.success) {
        await fetchFlags();
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture node');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [BASE_URL, fetchFlags]);

  // Poll flags every 3 seconds
  useEffect(() => {
    fetchFlags();
    
    const intervalId = setInterval(() => {
      fetchFlags();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [fetchFlags]);

  return {
    flags,
    isLoading,
    error,
    captureNode,
    refetchFlags: fetchFlags,
  };
}
