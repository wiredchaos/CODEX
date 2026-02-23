import { useState, useEffect, useCallback } from 'react';
import { fetchJson } from '@/lib/fetchJson';
import { isRelayConfigured, relayUrl } from '@/core/relay';

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
  const [error, setError] = useState<string | null>(() =>
    isRelayConfigured() ? null : 'RELAY NOT CONFIGURED – BUILD ENV INVALID'
  );

  const fetchFlags = useCallback(async () => {
    if (!isRelayConfigured()) {
      setError('RELAY NOT CONFIGURED – BUILD ENV INVALID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchJson<RedLedgerFlags>(relayUrl(`/api/redledger/flags`));
      setFlags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flags');
      // Don't update flags on error - keep last known state
    } finally {
      setIsLoading(false);
    }
  }, []);

  const captureNode = useCallback(async (nodeId: string) => {
    if (!isRelayConfigured()) {
      setError('RELAY NOT CONFIGURED – BUILD ENV INVALID');
      throw new Error('RELAY NOT CONFIGURED – BUILD ENV INVALID');
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchJson<CaptureResponse>(relayUrl(`/api/redledger/capture`), {
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

  // Poll flags every 3 seconds (only if relay is configured)
  useEffect(() => {
    if (!isRelayConfigured()) return;

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