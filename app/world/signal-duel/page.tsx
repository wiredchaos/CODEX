"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { emitTelemetry, calculateHemisphereScore, type HemisphereScore } from "@/lib/telemetry-bus"
import { getLayerColor, GAME_LAYERS, type GameLayer } from "@/lib/hub-config"
import { getTrinityFloorForLayer, getFloorConfig } from "@/lib/trinity-mount"
import { useTrinity } from "@/components/trinity-provider"
import { Zap, Shield, Radio, Orbit, Trophy, RotateCcw, Home, Lock, Clock, Layers } from "lucide-react"

// Constants and types from existing code, adjusted as needed
const SIGNAL_TYPES: string[] = ["ALPHA", "BETA", "GAMMA", "DELTA", "OMEGA"] // Keep existing signal types for now, will adjust later if needed
const SIGNAL_MATRIX: Record<string, string[]> = {
  ALPHA: ["BETA", "GAMMA"],
  BETA: ["GAMMA", "DELTA"],
  GAMMA: ["DELTA", "OMEGA"],
  DELTA: ["OMEGA", "ALPHA"],
  OMEGA: ["ALPHA", "BETA"],
}

// Remove unused imports
// import {
//   SIGNAL_DUEL_MOUNT,
//   canTransitionFloor,
//   validateTimelineAccess,
//   type TrinityFloor,
//   type TimelineAccess,
// } from "@/lib/trinity-mount"
// import { ArrowLeft } from 'lucide-react' // Replaced by Home
// import Link from "next/link" // Not used anymore

// Define new SignalType and GamePhase based on updates
type Signal = "PULSE" | "WAVE" | "FIELD" | "RESONANCE" | "VOID"
type GamePhase = "select" | "reveal" | "result"
type GameResult = "win" | "lose" | "draw" | null

interface SignalConfig {
  id: Signal
  description: string
}

// Layer-specific signal descriptions (from existing code, adapted for new Signal type)
const LAYER_SIGNAL_DESC: Record<GameLayer, Record<Signal, string>> = {
  arcade: {
    PULSE: "Power Strike - Beats WAVE and FIELD",
    WAVE: "Quick Jab - Beats FIELD and RESONANCE",
    FIELD: "Block - Beats RESONANCE and VOID",
    RESONANCE: "Counter - Beats VOID and PULSE",
    VOID: "Ultimate - Beats PULSE and WAVE",
  },
  business: {
    PULSE: "Market Surge - Overwhelms WAVE and FIELD positions",
    WAVE: "Trade Lock - Counters FIELD and RESONANCE strategies",
    FIELD: "Hedge Shield - Deflects RESONANCE and VOID plays",
    RESONANCE: "Insider Intel - Predicts VOID and PULSE moves",
    VOID: "Hostile Takeover - Dominates PULSE and WAVE signals",
  },
  echo: {
    PULSE: "Cosmic Pulse - Transcends WAVE and FIELD vibrations",
    WAVE: "Harmonic Wave - Aligns with FIELD and RESONANCE frequencies",
    FIELD: "Quantum Shield - Collapses RESONANCE and VOID states",
    RESONANCE: "Third Eye - Sees through VOID and PULSE illusions",
    VOID: "Source Code - Rewrites PULSE and WAVE realities",
  },
  bridge: {
    PULSE: "Unity Beam - Merges Business and Echo PULSE",
    WAVE: "Sync Wave - Bridges FIELD and RESONANCE realms",
    FIELD: "Dual Shield - Protects across both firewalls",
    RESONANCE: "Cross-Sight - Views both hemispheres",
    VOID: "Convergence - Unites all signal types",
  },
}

// Layer-specific strength modifiers (from existing code)
const LAYER_MODIFIERS: Record<GameLayer, { base: number; variance: number }> = {
  arcade: { base: 50, variance: 50 },
  business: { base: 60, variance: 30 },
  echo: { base: 40, variance: 60 },
  bridge: { base: 55, variance: 45 },
}

// Map signal IDs to icons
const SIGNAL_ICONS: Record<Signal, React.ElementType> = {
  PULSE: Zap,
  WAVE: Radio,
  FIELD: Shield,
  RESONANCE: Orbit, // Assuming Orbit is a good replacement for Eye/Swords in context of signal duel
  VOID: Trophy, // Assuming Trophy is a good replacement for Omega/Swords
}

// Function to get signals for a given layer
function getLayerSignals(layer: GameLayer): SignalConfig[] {
  // In a real app, this might fetch from an API or a more complex config
  // For now, we'll just map all signals available to each layer and use descriptions
  const allSignals: Signal[] = ["PULSE", "WAVE", "FIELD", "RESONANCE", "VOID"]
  return allSignals.map((signalId) => ({
    id: signalId,
    description: LAYER_SIGNAL_DESC[layer][signalId],
  }))
}

// Remove TrinityMountState and related logic from this component
// interface TrinityMountState {
//   currentFloor: TrinityFloor
//   timelineAccess: TimelineAccess
//   isTransitioning: boolean
//   mountedAt: number
// }

// Update TrinityMountPanel to use useTrinity hook and layer context
function TrinityMountPanel({ layer }: { layer: GameLayer }) {
  const { core, currentFloor, timelineAccess, isTransitioning, requestFloorChange } = useTrinity()
  const targetFloor = getTrinityFloorForLayer(layer)
  const floorConfig = getFloorConfig(currentFloor)

  useEffect(() => {
    // Only request change if we are not already transitioning and the floor is different
    if (currentFloor !== targetFloor && !isTransitioning) {
      requestFloorChange(targetFloor)
    }
  }, [layer, targetFloor, currentFloor, isTransitioning, requestFloorChange])

  return (
    <div className="p-3 border border-white/10 rounded bg-black/50 text-xs font-mono">
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        <Lock className="w-3 h-3" />
        TRINITY MOUNT STATUS
      </div>
      <div className="grid grid-cols-2 gap-2 text-gray-300">
        <div>
          <div className="text-gray-500 mb-1">CORE</div>
          <div className="text-cyan-400">{core.version}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">OWNER</div>
          <div className="text-cyan-400">{core.owner}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">FLOOR</div>
          <div style={{ color: floorConfig.color }}>
            {isTransitioning ? "TRANSITIONING..." : currentFloor.replace("FLOOR_", "")}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">TIMELINE</div>
          <div className={timelineAccess === "granted" ? "text-green-400" : "text-red-400"}>
            {timelineAccess.toUpperCase()}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">INFRASTRUCTURE</div>
          <div className="text-amber-400">{core.infrastructure.toUpperCase()}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">GOVERNOR</div>
          <div className="font-mono text-cyan-400">AKIRA</div>
        </div>
      </div>

      <div className="text-[10px] text-gray-600 border-t border-white/5 pt-2 mt-2">
        Patch consumes Trinity Core. No 3D generation.
      </div>
    </div>
  )
}

export default function SignalDuelPage() {
  const { currentFloor, timelineAccess, requestFloorChange, readTimeline } = useTrinity()

  // Adjust state variables to match new types and game flow
  const [selectedLayer, setSelectedLayer] = useState<GameLayer>("arcade")
  const [gamePhase, setGamePhase] = useState<GamePhase>("select")
  const [playerSignal, setPlayerSignal] = useState<Signal | null>(null)
  const [opponentSignal, setOpponentSignal] = useState<Signal | null>(null)
  const [result, setResult] = useState<GameResult>(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [round, setRound] = useState(1)
  const [hemisphereScore, setHemisphereScore] = useState<HemisphereScore | null>(null)
  const [layerStats, setLayerStats] = useState<Record<GameLayer, { wins: number; losses: number }>>({
    arcade: { wins: 0, losses: 0 },
    business: { wins: 0, losses: 0 },
    echo: { wins: 0, losses: 0 },
    bridge: { wins: 0, losses: 0 },
  })

  const MAX_ROUNDS = 5

  useEffect(() => {
    setHemisphereScore(calculateHemisphereScore())

    emitTelemetry("patch_mount", {
      patchId: "SIGNAL_DUEL", // Hardcoded for this patch
      realm: "hybrid",
      metadata: {
        mount: "/world/signal-duel",
        type: "game",
        source: "v0_project_chat",
        trinityFloor: currentFloor,
        trinityReadOnly: true,
        timelineGovernor: "AKIRA_CODEX",
        timelineAccess,
      },
    })
  }, [currentFloor, timelineAccess]) // Dependencies updated to include Trinity context values

  const handleLayerChange = useCallback(
    async (layer: GameLayer) => {
      const targetFloor = getTrinityFloorForLayer(layer)
      // Request floor change and wait for success before updating layer and emitting telemetry
      const success = await requestFloorChange(targetFloor)

      if (success) {
        setSelectedLayer(layer)
        setGamePhase("select") // Reset phase to select when layer changes
        setPlayerSignal(null)
        setOpponentSignal(null)
        setResult(null)
        setRound(1)
        setPlayerScore(0)
        setOpponentScore(0)

        emitTelemetry("layer_switch", {
          patchId: "SIGNAL_DUEL",
          realm: "hybrid",
          metadata: { from: selectedLayer, to: layer, floor: targetFloor },
        })
      }
    },
    [selectedLayer, requestFloorChange], // Add selectedLayer as dependency
  )

  // startGame function adapted for new game flow
  const startGame = useCallback(() => {
    setGamePhase("select") // Start in select phase to choose signals
    setPlayerSignal(null)
    setOpponentSignal(null)
    setResult(null)
    setRound(1)
    setPlayerScore(0)
    setOpponentScore(0)

    emitTelemetry("game_start", {
      patchId: "SIGNAL_DUEL",
      realm: "hybrid",
      metadata: { layer: selectedLayer, floor: currentFloor },
    })
  }, [selectedLayer, currentFloor])

  // sendSignal logic adapted for new Signal type and game flow
  const sendSignal = useCallback(
    (signalId: Signal) => {
      if (gamePhase !== "select" || !selectedLayer || playerSignal) return

      const mod = LAYER_MODIFIERS[selectedLayer]
      const playerSignalData: SignalConfig = {
        id: signalId,
        // Strength calculation remains the same
        description: LAYER_SIGNAL_DESC[selectedLayer][signalId], // Get description for telemetry
      }

      // Generate opponent signal
      const signalsForLayer = getLayerSignals(selectedLayer)
      const randomSignalConfig = signalsForLayer[Math.floor(Math.random() * signalsForLayer.length)]
      const opponentSignalData: SignalConfig = {
        id: randomSignalConfig.id,
        description: randomSignalConfig.description,
      }

      setPlayerSignal(playerSignalData.id)
      setOpponentSignal(opponentSignalData.id)
      setGamePhase("reveal") // Move to reveal phase

      emitTelemetry("signal_sent", {
        patchId: "SIGNAL_DUEL",
        realm: "hybrid",
        metadata: { signalType: playerSignalData.id, layer: selectedLayer },
      })

      // Simulate reveal delay
      setTimeout(() => {
        setGamePhase("result")
        let currentRoundResult: GameResult

        // Determine winner based on SIGNAL_MATRIX and strength (adapted from original logic)
        const playerBeats = SIGNAL_MATRIX[signalId] // Assuming SIGNAL_MATRIX can be mapped to new signals
        const opponentBeats = SIGNAL_MATRIX[opponentSignalData.id]

        // Check if SIGNAL_MATRIX can handle the new Signal type. If not, this logic needs adjustment.
        // For now, assuming a direct mapping or a fallback to strength comparison.
        // NOTE: The original SIGNAL_MATRIX used ALPHA, BETA, etc. The new Signals are PULSE, WAVE, etc.
        // This mapping needs to be defined or a new matrix created.
        // For demonstration, we'll use strength as the primary decider if matrix comparison is not explicit.

        // Placeholder for matrix comparison, if not directly mappable, use strength
        let matrixWin = false
        if (playerBeats && playerBeats.includes(opponentSignalData.id)) {
          currentRoundResult = "win"
          setPlayerScore((s) => s + 1)
          matrixWin = true
        } else if (opponentBeats && opponentBeats.includes(signalId)) {
          currentRoundResult = "lose"
          setOpponentScore((s) => s + 1)
        }

        // Fallback to strength if matrix comparison is inconclusive or not defined for these signals
        if (!matrixWin && !currentRoundResult) {
          const playerStrength = Math.floor(Math.random() * mod.variance) + mod.base
          const opponentStrength = Math.floor(Math.random() * mod.variance) + mod.base

          if (playerStrength > opponentStrength) {
            currentRoundResult = "win"
            setPlayerScore((s) => s + 1)
          } else if (opponentStrength > playerStrength) {
            currentRoundResult = "lose"
            setOpponentScore((s) => s + 1)
          } else {
            currentRoundResult = "draw"
          }
        }

        setResult(currentRoundResult)

        // Update layer stats
        setLayerStats((prev) => ({
          ...prev,
          [selectedLayer]: {
            wins: prev[selectedLayer].wins + (currentRoundResult === "win" ? 1 : 0),
            losses: prev[selectedLayer].losses + (currentRoundResult === "lose" ? 1 : 0),
          },
        }))

        emitTelemetry(
          currentRoundResult === "win" ? "duel_won" : currentRoundResult === "lose" ? "duel_lost" : "signal_draw",
          {
            patchId: "SIGNAL_DUEL",
            realm: "hybrid",
            metadata: { round, winner: currentRoundResult, layer: selectedLayer },
          },
        )

        // Check if game is over
        if (round >= MAX_ROUNDS) {
          // Game over logic handled in the next effect
        } else {
          // Prepare for next round after a delay
          setTimeout(() => {
            setRound((r) => r + 1)
            setGamePhase("select")
            setPlayerSignal(null)
            setOpponentSignal(null)
            setResult(null)
          }, 2000) // Delay before next round
        }
      }, 1000) // Reveal delay
    },
    [gamePhase, selectedLayer, playerSignal, round, MAX_ROUNDS], // Added dependencies
  )

  // Effect to handle game end and round progression
  useEffect(() => {
    if (gamePhase === "result") {
      if (round >= MAX_ROUNDS) {
        // Game finished, handle final result
        emitTelemetry("game_end", {
          patchId: "SIGNAL_DUEL",
          realm: "hybrid",
          metadata: {
            playerScore,
            opponentScore,
            winner: playerScore > opponentScore ? "win" : "lose",
            layer: selectedLayer,
          },
        })
        setHemisphereScore(calculateHemisphereScore()) // Recalculate scores after game end
      } else {
        // Round finished, prepare for next round (handled within sendSignal for now)
      }
    }
  }, [gamePhase, round, MAX_ROUNDS, playerScore, opponentScore, selectedLayer])

  // Removed unused switchLayer and resetGame, integrated into handleLayerChange and startGame

  const layerColor = getLayerColor(selectedLayer)
  const currentFloorConfig = getFloorConfig(currentFloor)
  const signals = getLayerSignals(selectedLayer) // Get signals for the current layer

  // Re-implementing the UI structure based on the updates
  return (
    <div
      className="min-h-screen text-white p-4 md:p-8 font-mono"
      style={{ backgroundColor: "#0a0a0a" }} // Dark background as per update
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs text-gray-500 mb-1">PATCH.GAME</div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: layerColor }}>
              SIGNAL DUEL
            </h1>
            <div className="text-xs text-gray-600 mt-1">4-LAYER HYBRID REALM GAME</div>
          </div>

        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            HUB
          </a>
        </div>
      </div>

        {/* Trinity Declaration Banner */}
        <div className="mb-6 p-4 border border-cyan-500/20 rounded-lg bg-cyan-950/10">
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
            <Lock className="w-3 h-3" />
            TRINITY FLOOR / TIMELINE MOUNT (DECLARATIVE)
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>This patch consumes the existing WIRED CHAOS Trinity 3D Core.</div>
            <div className="text-gray-500">
              No new 3D generation. No new galaxy creation. Trinity is read-only infrastructure.
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>
                Timeline access governed by <span className="text-cyan-400">AKIRA_CODEX</span>
              </span>
            </div>
          </div>
        </div>

        {/* Layer Selection with Floor Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {(Object.keys(GAME_LAYERS) as GameLayer[]).map((layer) => {
            const config = GAME_LAYERS[layer]
            const floor = getTrinityFloorForLayer(layer)
            const floorConfig = getFloorConfig(floor)
            const isSelected = selectedLayer === layer

            return (
              <button
                key={layer}
                onClick={() => handleLayerChange(layer)}
                className={`p-3 rounded border transition-all ${
                  isSelected ? "border-white/30 bg-white/10" : "border-white/10 bg-black/50 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold" style={{ color: config.color }}>
                    {layer.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" style={{ color: floorConfig.color }} />
                    <span className="text-[10px]" style={{ color: floorConfig.color }}>
                      L{floorConfig.elevation}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500">{config.description}</div>
                <div className="text-[10px] text-gray-600 mt-1">
                  W:{layerStats[layer].wins} L:{layerStats[layer].losses}
                </div>
              </button>
            )
          })}
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Panel */}
          <div className="lg:col-span-2 border border-white/10 rounded-lg p-6 bg-black/50">
            {/* Score Bar */}
            <div className="text-center mb-6">
              <div className="text-xs text-gray-500 mb-1">
                ROUND {round} OF {MAX_ROUNDS}
              </div>
              <div className="flex justify-center gap-8 text-lg">
                <div>
                  <span className="text-gray-500">YOU:</span> <span className="text-green-400">{playerScore}</span>
                </div>
                <div>
                  <span className="text-gray-500">OPP:</span> <span className="text-red-400">{opponentScore}</span>
                </div>
              </div>
            </div>

            {/* Signal Selection */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {signals.map((signal) => {
                const Icon = SIGNAL_ICONS[signal.id]
                const isSelected = playerSignal === signal.id
                return (
                  <button
                    key={signal.id}
                    onClick={() => gamePhase === "select" && setPlayerSignal(signal.id)}
                    disabled={gamePhase !== "select"}
                    className={`p-4 rounded border transition-all ${
                      isSelected
                        ? "border-white/50 bg-white/20"
                        : gamePhase === "select"
                          ? "border-white/10 hover:border-white/30 bg-black/30"
                          : "border-white/5 bg-black/20 opacity-50"
                    }`}
                    style={{ borderColor: isSelected ? layerColor : undefined }}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: isSelected ? layerColor : "#666" }} />
                    <div className="text-[10px] text-center" style={{ color: isSelected ? layerColor : "#666" }}>
                      {signal.id}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Game Phase Display */}
            <div className="text-center text-sm text-gray-400">
              {gamePhase === "select" && "Select your signal to begin"}
              {gamePhase === "reveal" && "Revealing opponent signal..."}
              {gamePhase === "result" && result && (
                <span
                  className={
                    result === "win" ? "text-green-400" : result === "lose" ? "text-red-400" : "text-yellow-400"
                  }
                >
                  {result.toUpperCase()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            {gamePhase === "select" && playerSignal && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => sendSignal(playerSignal)}
                  className="px-8 py-3 font-mono text-sm text-black"
                  style={{ backgroundColor: layerColor }}
                >
                  SEND SIGNAL
                </Button>
              </div>
            )}
            {gamePhase === "result" && (
              <div className="text-center mt-8 flex justify-center gap-4">
                <Button
                  onClick={() => {
                    // Reset for rematch
                    setPlayerScore(0)
                    setOpponentScore(0)
                    setRound(1)
                    setGamePhase("select")
                    setPlayerSignal(null)
                    setOpponentSignal(null)
                    setResult(null)
                    emitTelemetry("rematch", {
                      patchId: "SIGNAL_DUEL",
                      realm: "hybrid",
                      metadata: { layer: selectedLayer },
                    })
                  }}
                  className="px-8 py-3 font-mono text-sm text-black"
                  style={{ backgroundColor: layerColor }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  REMATCH
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleLayerChange("arcade")} // Default back to arcade or allow selection
                  className="px-8 py-3 font-mono text-sm border-gray-600 text-gray-400 hover:text-white bg-transparent"
                >
                  CHANGE LAYER
                </Button>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Trinity Mount Panel */}
            <TrinityMountPanel layer={selectedLayer} />

            {/* Hemisphere Score */}
            {hemisphereScore && (
              <div className="p-3 border border-white/10 rounded bg-black/50 text-xs font-mono">
                <div className="text-gray-400 mb-2">HEMISPHERE SCORE</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-gray-500">BUSINESS</div>
                    <div className="text-green-400">{hemisphereScore.business}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">AKASHIC</div>
                    <div className="text-cyan-400">{hemisphereScore.akashic}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">BRIDGE</div>
                    <div className="text-amber-400">{hemisphereScore.bridge}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">BALANCE</div>
                    <div className="text-white">{hemisphereScore.balance.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
