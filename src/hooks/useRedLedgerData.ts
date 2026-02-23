import { useState, useEffect, useCallback, useRef } from 'react';
import { RedLedgerState, RedLedgerEvents, Faction } from '@/types/redledger';
import { fetchJson } from '@/lib/fetchJson';

interface RedLedgerData {
  state: RedLedgerState | null;
  events: RedLedgerEvents | null;
  factions: Faction[] | null;
  isLoading: boolean;
  error: string | null;
  connected: boolean;
}

interface Config {
  relayBaseUrl: string;
  appId: string;
}

export function useRedLedgerData(config: Config | null) {
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
    if (!config) return;

    try {
      const { relayBaseUrl, appId } = config;
      const baseUrl = relayBaseUrl.replace(/\/$/, '');

      const [state, events, factions] = await Promise.all([
        fetchJson<RedLedgerState>(`${baseUrl}/api/redledger/state?appId=${encodeURIComponent(appId)}`),
        fetchJson<RedLedgerEvents>(`${baseUrl}/api/redledger/events?appId=${encodeURIComponent(appId)}`),
        fetchJson<Faction[]>(`${baseUrl}/api/redledger/factions?appId=${encodeURIComponent(appId)}`),
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
  }, [config]);

  const setupSSE = useCallback(() => {
    if (!config || !isSSEAvailable.current) return;

    const { relayBaseUrl, appId } = config;
    const baseUrl = relayBaseUrl.replace(/\/$/, '');
    const streamUrl = `${baseUrl}/api/redledger/stream?appId=${encodeURIComponent(appId)}`;

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
  }, [config]);

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

  useEffect(() => {
    if (!config) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
        connected: false,
      }));
      return;
    }

    // Try SSE first
    isSSEAvailable.current = true;
    setupSSE();

    // Start polling immediately (will be stopped if SSE works)
    startPolling();

    return () => {
      cleanupSSE();
      stopPolling();
    };
  }, [config, setupSSE, startPolling, stopPolling, cleanupSSE]);

  return data;
}