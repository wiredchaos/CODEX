import { useState, useEffect, useCallback } from 'react';
import { fetchJson } from '@/lib/fetchJson';

// IMPORTANT: Never fall back to relative URLs in production.
// If this is empty, relay calls are disabled (prevents HTML-as-JSON on Vercel SPA fallback).
const RELAY_BASE_URL = String(import.meta.env.VITE_RELAY_URL || '').replace(/\/$/, '');

if (!RELAY_BASE_URL) {
  console.warn('No VITE_RELAY_URL defined. Relay calls disabled.');
}

export interface RedLedgerFlags {
  skyTint: string;
  volatility: number;
  spawnRateMultiplier: number;
}

const DEFAULT_FLAGS: RedLedgerFlags = {
  skyTint: '#0a0a0f',
  volatility: 1,
  spawnRateMultiplier: 1,
};

export interface CaptureResponse {
  success: boolean;
  flags?: RedLedgerFlags;
}

export function useRedLedgerControl() {
  const [flags, setFlags] = useState<RedLedgerFlags>(DEFAULT_FLAGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    if (!RELAY_BASE_URL) {
      setError('Relay URL not configured (VITE_RELAY_URL).');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchJson<RedLedgerFlags>(`${RELAY_BASE_URL}/api/redledger/flags`);
      setFlags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flags');
      // Don't update flags on error - keep last known state
    } finally {
      setIsLoading(false);
    }
  }, []);

  const captureNode = useCallback(async (nodeId: string) => {
    if (!RELAY_BASE_URL) {
      setError('Relay URL not configured (VITE_RELAY_URL).');
      throw new Error('Relay URL not configured');
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchJson<CaptureResponse>(`${RELAY_BASE_URL}/api/redledger/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId,
          faction: 'SOVEREIGN',
        }),
      });

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
  }, [fetchFlags]);

  // Poll flags every 3 seconds (only if relay URL is configured)
  useEffect(() => {
    if (!RELAY_BASE_URL) return;

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