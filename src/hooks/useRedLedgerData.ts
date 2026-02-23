import { useState, useEffect, useCallback, useRef } from 'react';
import { RedLedgerState, RedLedgerEvents, Faction } from '@/types/redledger';
import { fetchJson } from '@/lib/fetchJson';
import { getAppId, isRelayConfigured, relayUrl } from '@/core/relay';

interface RedLedgerData {
  state: RedLedgerState | null;
  events: RedLedgerEvents | null;
  factions: Faction[] | null;
  isLoading: boolean;
  error: string | null;
  connected: boolean;
}

export function useRedLedgerData() {
  const [data, setData] = useState<RedLedgerData>({
    state: null,
    events: null,
    factions: null,
    isLoading: true,
    error: null,
    connected: false,
  });

  const sseRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const isSSEAvailable = useRef<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!isRelayConfigured()) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: 'RELAY NOT CONFIGURED – BUILD ENV INVALID',
        connected: false,
      }));
      return;
    }

    try {
      const appId = getAppId();
      const q = `?appId=${encodeURIComponent(appId)}`;

      const [state, events, factions] = await Promise.all([
        fetchJson<RedLedgerState>(relayUrl(`/api/redledger/state${q}`)),
        fetchJson<RedLedgerEvents>(relayUrl(`/api/redledger/events${q}`)),
        fetchJson<Faction[]>(relayUrl(`/api/redledger/factions${q}`)),
      ]);

      setData((prev) => ({
        ...prev,
        state,
        events,
        factions,
        isLoading: false,
        error: null,
        connected: true,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to relay';
      setData((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
        connected: false,
      }));
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    fetchData();
    pollIntervalRef.current = window.setInterval(fetchData, 4000);
  }, [fetchData]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const cleanupSSE = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
  }, []);

  const setupSSE = useCallback(() => {
    if (!isRelayConfigured() || !isSSEAvailable.current) return;

    const appId = getAppId();
    const streamUrl = relayUrl(`/api/redledger/stream?appId=${encodeURIComponent(appId)}`);

    sseRef.current = new EventSource(streamUrl);

    sseRef.current.onopen = () => {
      console.log('SSE connection established');
      setData((prev) => ({ ...prev, connected: true }));
    };

    sseRef.current.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setData((prev) => {
          if (update.state) prev.state = update.state;
          if (update.events) prev.events = update.events;
          if (update.factions) prev.factions = update.factions;
          return { ...prev };
        });
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    sseRef.current.onerror = (err) => {
      console.error('SSE connection error:', err);
      isSSEAvailable.current = false;
      sseRef.current?.close();
      sseRef.current = null;
      // Fallback to polling
      startPolling();
    };
  }, [startPolling]);

  useEffect(() => {
    // Hard disable when not configured.
    if (!isRelayConfigured()) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: 'RELAY NOT CONFIGURED – BUILD ENV INVALID',
        connected: false,
      }));
      return;
    }

    isSSEAvailable.current = true;
    setupSSE();
    startPolling();

    return () => {
      cleanupSSE();
      stopPolling();
    };
  }, [setupSSE, startPolling, stopPolling, cleanupSSE]);

  return data;
}