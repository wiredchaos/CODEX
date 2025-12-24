"use client"

import useSWR from "swr"
import { HUB_CONFIG, type PatchConfig, type RealmType } from "@/lib/hub-config"
import { emitTelemetry, getRecentEvents, calculateHemisphereScore, startSession } from "@/lib/telemetry-bus"
import { useEffect, useCallback, useMemo } from "react"

// Hub state fetcher
const hubStateFetcher = () => {
  return {
    config: HUB_CONFIG,
    patches: HUB_CONFIG.patches,
    timestamp: Date.now(),
  }
}

// Telemetry fetcher
const telemetryFetcher = () => {
  return {
    events: getRecentEvents(20),
    hemisphereScore: calculateHemisphereScore(),
    timestamp: Date.now(),
  }
}

export function useHubConfig() {
  const { data, error, isLoading, mutate } = useSWR("hub-config", hubStateFetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  return {
    config: data?.config ?? HUB_CONFIG,
    patches: data?.patches ?? HUB_CONFIG.patches,
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useTelemetry() {
  const { data, mutate } = useSWR("telemetry", telemetryFetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
    revalidateOnFocus: false,
  })

  const trackPatchAccess = useCallback(
    (patch: PatchConfig) => {
      emitTelemetry("patch_access", {
        patchId: patch.id,
        realm: patch.realm,
        metadata: { mount: patch.mount },
      })
      mutate()
    },
    [mutate],
  )

  const trackRealmTransition = useCallback(
    (fromRealm: RealmType, toRealm: RealmType) => {
      emitTelemetry("realm_transition", {
        realm: toRealm,
        metadata: { from: fromRealm, to: toRealm },
      })
      mutate()
    },
    [mutate],
  )

  const trackFirewallCheck = useCallback(
    (patchId: string, realm: RealmType, allowed: boolean) => {
      emitTelemetry("firewall_check", {
        patchId,
        realm,
        metadata: { allowed },
      })
      mutate()
    },
    [mutate],
  )

  return {
    events: data?.events ?? [],
    hemisphereScore: data?.hemisphereScore ?? { business: 0, akashic: 0, bridge: 0, total: 0, balance: 0 },
    trackPatchAccess,
    trackRealmTransition,
    trackFirewallCheck,
    refresh: mutate,
  }
}

export function useSession() {
  useEffect(() => {
    const sessionId = startSession()
    console.log(`[HUB] Session started: ${sessionId}`)

    return () => {
      console.log(`[HUB] Session cleanup`)
    }
  }, [])
}

export function usePatchesByRealm() {
  const { patches } = useHubConfig()

  return useMemo(() => {
    const byRealm: Record<RealmType, PatchConfig[]> = {
      business: [],
      akashic: [],
      bridge: [],
    }

    patches.forEach((patch) => {
      if (patch.realm in byRealm) {
        byRealm[patch.realm].push(patch)
      }
    })

    return byRealm
  }, [patches])
}
