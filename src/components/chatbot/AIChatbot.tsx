/**
* FLOWSHIELD — AI Chatbot powered by Gemini
*
* A floating chat assistant that can:
* - Answer questions about floods, weather, the simulation
* - Control the simulation (change rainfall, play/pause, presets, etc.)
* - Explain what's happening in the current state
* - Search weather for locations
*
* Uses Gemini 2.0 Flash with function calling for website control.
*/

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { API_KEYS, API_ENDPOINTS } from '../../config/api';
import type { SimConfig, SimStats } from '../../sim/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatAction {
  type:
    | 'CHANGE_RAINFALL'
    | 'CHANGE_DURATION'
    | 'CHANGE_DRAINAGE'
    | 'CHANGE_TERRAIN'
    | 'SET_PRESET'
    | 'TOGGLE_EMERGENCY'
    | 'START_DEMO'
    | 'PLAY'
    | 'PAUSE'
    | 'RESET'
    | 'SEARCH_LOCATION'
    | 'SELECT_ZONE'
    | 'OPEN_AUTH';
  payload?: any;
  description?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ChatAction[];
  timestamp: number;
}

interface SimulationContext {
  config: SimConfig;
  stats: SimStats;
  currentTime: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  isDemoMode: boolean;
  emergencyMode: boolean;
  blockedCellsCount: number;
}

interface AIChatbotProps {
  context: SimulationContext;
  onAction: (action: ChatAction) => void;
}

// ─── Gemini Function Definitions ────────────────────────────────────────────

const GEMINI_TOOLS = [
  {
    function_declarations: [
      {
        name: 'change_rainfall_intensity',
        description: 'Change the rainfall/precipitation intensity in the simulation. Range: 0-200 mm/hr. Use 20 for light rain, 80 for heavy, 160 for extreme.',
        parameters: {
          type: 'object',
          properties: {
            intensity: { type: 'number', description: 'Rainfall intensity in mm/hr (0-200)' },
          },
          required: ['intensity'],
        },
      },
      {
        name: 'change_storm_duration',
        description: 'Change how long the storm lasts in the simulation. Range: 15-180 minutes.',
        parameters: {
          type: 'object',
          properties: {
            minutes: { type: 'number', description: 'Storm duration in minutes (15-180)' },
          },
          required: ['minutes'],
        },
      },
      {
        name: 'change_drainage_quality',
        description: 'Change the drainage efficiency of the terrain. 0% = completely blocked, 100% = perfect drainage.',
        parameters: {
          type: 'object',
          properties: {
            percent: { type: 'number', description: 'Drainage quality percentage (0-100)' },
          },
          required: ['percent'],
        },
      },
      {
        name: 'change_terrain_steepness',
        description: 'Change how steep/hilly the terrain is. 0.2 = flat, 1.0 = normal, 2.5 = very steep.',
        parameters: {
          type: 'object',
          properties: {
            multiplier: { type: 'number', description: 'Terrain steepness multiplier (0.2-2.5)' },
          },
          required: ['multiplier'],
        },
      },
      {
        name: 'set_storm_preset',
        description: 'Apply a predefined storm scenario. Options: "light" (20 mm/hr), "heavy" (80 mm/hr), "extreme" (160 mm/hr).',
        parameters: {
          type: 'object',
          properties: {
            preset: { type: 'string', description: 'Preset name: light, heavy, or extreme' },
          },
          required: ['preset'],
        },
      },
      {
        name: 'toggle_emergency_mode',
        description: 'Toggle emergency mode which highlights only flooding zones and dims safe zones.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'start_demo',
        description: 'Start the 90-second automated demo that shows all flood phases from rain to recovery.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'play_simulation',
        description: 'Start or resume playing the simulation timeline.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'pause_simulation',
        description: 'Pause the simulation timeline playback.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'reset_simulation',
        description: 'Reset the simulation back to the beginning (time = 0).',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'search_location',
        description: 'Search for real-time weather data for a specific city/location. This will populate the weather panel.',
        parameters: {
          type: 'object',
          properties: {
            city: { type: 'string', description: 'City name to search for' },
          },
          required: ['city'],
        },
      },
      {
        name: 'select_zone',
        description: 'Select and highlight a specific zone on the flood map. Zones are named like A1, A2, B1, B2, etc. (A-H rows, 1-8 columns).',
        parameters: {
          type: 'object',
          properties: {
            zone: { type: 'string', description: 'Zone name like A1, B3, H8' },
          },
          required: ['zone'],
        },
      },
      {
        name: 'open_auth',
        description: 'Open the authentication sign in / sign up dialog for users to login with Google or email.',
        parameters: {
          type: 'object',
          properties: {
            mode: { type: 'string', description: 'Mode to open: "signin" for existing users or "signup" for new users' },
          },
        },
      },
    ],
  },
];

function buildSystemPrompt(ctx: SimulationContext): string {
  const statusEmoji =
    ctx.stats.criticalCells > 0
      ? '🚨 FLOODING'
      : ctx.stats.warningCells > 0
        ? '⚠️ AT RISK'
        : '✅ ALL SAFE';

  return `You are FlowShield AI — a friendly, helpful assistant for the FlowShield flood simulation system.

## Your Role
- Help users understand flood risks and what the simulation shows
- Answer questions about floods, weather, drainage, and water management
- Control the simulation when users ask (use the provided functions)
- Give clear, simple explanations — avoid technical jargon
- Be conversational and friendly, use emojis when appropriate
- Keep responses concise (2-4 sentences usually)

## Current Simulation State
- Status: ${statusEmoji}
- Simulation Time: ${ctx.currentTime.toFixed(0)} minutes (of ${ctx.totalSteps - 1} total)
- Rainfall: ${ctx.config.rainfallIntensity} mm/hr for ${ctx.config.rainfallDuration} minutes
- ${ctx.currentTime < ctx.config.rainfallDuration ? '🌧️ Currently raining' : '☀️ Rain has stopped'}
- Safe Zones: ${ctx.stats.safeCells} | At Risk: ${ctx.stats.warningCells} | Flooding: ${ctx.stats.criticalCells}
- Deepest Water: ${ctx.stats.maxWater.toFixed(2)}m | Average: ${ctx.stats.avgWater.toFixed(3)}m
- People Affected: ${ctx.stats.affectedPopulation.toLocaleString()}
- Grid: ${ctx.config.rows}×${ctx.config.cols} (zones A1 through H8)
- Drainage Quality: ${Math.round(ctx.config.drainageEfficiency * 100)}%
- Terrain Steepness: ${ctx.config.elevationMultiplier.toFixed(1)}x
- Playback: ${ctx.isPlaying ? 'Playing' : 'Paused'} at ${ctx.playbackSpeed}x speed
- Emergency Mode: ${ctx.emergencyMode ? 'ON' : 'OFF'}
- Demo Mode: ${ctx.isDemoMode ? 'Active' : 'OFF'}
- Blocked Zones: ${ctx.blockedCellsCount}

## About FlowShield
FlowShield is a flood simulation that models rainfall, water flow between terrain zones, and drainage. It uses an 8×8 grid where each zone has different elevation, drainage, and population. Users can:
- Adjust storm settings (intensity, duration)
- Watch the simulation play over time
- See real-time weather for any city
- Compare light/heavy/extreme storm scenarios
- Click zones to inspect details
- Block drainage channels to test scenarios

## Important Rules
- If the user asks to do something, use the appropriate function — don't just describe what to do
- If asked about a specific zone, explain its status based on the simulation data
- If asked for recommendations, consider the current flood status
- Always be helpful and action-oriented`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const AIChatbot: React.FC<AIChatbotProps> = ({ context, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm FlowShield AI. I can answer your questions about floods and control the simulation for you.\n\nTry asking:\n• \"Set extreme storm\"\n• \"What's happening right now?\"\n• \"Check weather in Mumbai\"\n• \"Start the demo\"",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const executeFunctionCall = useCallback(
    (name: string, args: any): { result: string; action?: ChatAction } => {
      switch (name) {
        case 'change_rainfall_intensity': {
          const intensity = Math.min(200, Math.max(0, args.intensity));
          return {
            result: `Rainfall intensity set to ${intensity} mm/hr.`,
            action: { type: 'CHANGE_RAINFALL', payload: intensity },
          };
        }
        case 'change_storm_duration': {
          const mins = Math.min(180, Math.max(15, args.minutes));
          return {
            result: `Storm duration set to ${mins} minutes.`,
            action: { type: 'CHANGE_DURATION', payload: mins },
          };
        }
        case 'change_drainage_quality': {
          const pct = Math.min(100, Math.max(0, args.percent));
          return {
            result: `Drainage quality set to ${pct}%.`,
            action: { type: 'CHANGE_DRAINAGE', payload: pct },
          };
        }
        case 'change_terrain_steepness': {
          const mult = Math.min(2.5, Math.max(0.2, args.multiplier));
          return {
            result: `Terrain steepness set to ${mult}x.`,
            action: { type: 'CHANGE_TERRAIN', payload: mult },
          };
        }
        case 'set_storm_preset': {
          const presetMap: Record<string, number> = { light: 20, heavy: 80, extreme: 160 };
          const intensity = presetMap[args.preset?.toLowerCase()] || 80;
          return {
            result: `Applied ${args.preset} storm preset (${intensity} mm/hr).`,
            action: { type: 'SET_PRESET', payload: intensity },
          };
        }
        case 'toggle_emergency_mode':
          return {
            result: `Emergency mode toggled.`,
            action: { type: 'TOGGLE_EMERGENCY' },
          };
        case 'start_demo':
          return {
            result: `Starting 90-second flood demo.`,
            action: { type: 'START_DEMO' },
          };
        case 'play_simulation':
          return {
            result: 'Simulation playback started.',
            action: { type: 'PLAY' },
          };
        case 'pause_simulation':
          return {
            result: 'Simulation paused.',
            action: { type: 'PAUSE' },
          };
        case 'reset_simulation':
          return {
            result: 'Simulation reset to beginning.',
            action: { type: 'RESET' },
          };
        case 'search_location':
          return {
            result: `Searching weather for "${args.city}"...`,
            action: { type: 'SEARCH_LOCATION', payload: args.city },
          };
        case 'select_zone':
          return {
            result: `Selected zone ${args.zone}.`,
            action: { type: 'SELECT_ZONE', payload: args.zone },
          };
        case 'open_auth':
          return {
            result: 'Opening authentication dialog...',
            action: { type: 'OPEN_AUTH', payload: args.mode === 'signup' ? 'signup' : 'signin' },
          };
        default:
          return { result: `Unknown function: ${name}` };
      }
    },
    []
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      // Build conversation history (last 10 messages for context window)
      const recentMessages = [...messages.slice(-10), userMsg];
      const contents = recentMessages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      // Call Gemini API
      const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${API_KEYS.GEMINI}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: buildSystemPrompt(context) }],
          },
          contents,
          tools: GEMINI_TOOLS,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];

      if (!candidate?.content?.parts) {
        throw new Error('No response from AI');
      }

      const parts = candidate.content.parts;
      const allActions: ChatAction[] = [];
      const functionResponses: any[] = [];
      let responseText = '';

      // Process parts — may contain text and/or function calls
      for (const part of parts) {
        if (part.text && !part.thought) {
          responseText += part.text;
        }
        if (part.functionCall) {
          const { name, args } = part.functionCall;
          const { result, action } = executeFunctionCall(name, args || {});

          if (action) {
            action.description = action.description || result;
            allActions.push(action);
            onAction(action);
          }

          functionResponses.push({
            functionResponse: {
              name,
              response: { result },
            },
          });
        }
      }

      // If there were function calls and no text response was generated yet,
      // send the follow-up call with the exact model parts (preserving thought_signature for Gemini 3.6)
      if (functionResponses.length > 0 && !responseText) {
        try {
          const followUp = await fetch(`${API_ENDPOINTS.GEMINI}?key=${API_KEYS.GEMINI}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: buildSystemPrompt(context) }],
              },
              contents: [
                ...contents,
                {
                  role: 'model',
                  parts: candidate.content.parts,
                },
                {
                  role: 'user',
                  parts: functionResponses,
                },
              ],
              tools: GEMINI_TOOLS,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 512,
              },
            }),
          });

          if (followUp.ok) {
            const followData = await followUp.json();
            const followParts = followData.candidates?.[0]?.content?.parts;
            if (followParts) {
              for (const fp of followParts) {
                if (fp.text && !fp.thought) responseText += fp.text;
              }
            }
          }
        } catch {
          // If follow-up fails, fallback to action descriptions below
        }
      }

      if (!responseText) {
        if (allActions.length > 0) {
          responseText = `✅ Completed: ${allActions.map((a) => a.description || a.type).join(', ')}`;
        } else {
          responseText = "I'm not sure how to help with that. Try asking about the simulation or flood risks!";
        }
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        actions: allActions.length > 0 ? allActions : undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Sorry, I ran into an issue: ${err.message || 'Unknown error'}. Please try again!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, messages, context, onAction, executeFunctionCall]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            title="Chat with FlowShield AI"
          >
            🤖
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl bg-slate-950 border border-slate-700/60 shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="font-bold text-sm text-white">FlowShield AI</h3>
                  <p className="text-[10px] text-cyan-400">Powered by Gemini • Can control simulation</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-cyan-600/20 border border-cyan-500/30 text-white rounded-br-md'
                        : 'bg-slate-800/60 border border-slate-700/40 text-slate-200 rounded-bl-md'
                      }`}
                  >
                    {/* Render text with newlines */}
                    {msg.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}

                    {/* Action badges */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.actions.map((action, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                          >
                            ⚡ {action.type.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-800/60 border border-slate-700/40">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-slate-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto">
              {[
                { label: '▶ Play', action: () => { onAction({ type: 'PLAY' }); setMessages(prev => [...prev, { id: `qa-${Date.now()}`, role: 'assistant', content: '▶ Playing simulation!', timestamp: Date.now() }]); } },
                { label: '⏸ Pause', action: () => { onAction({ type: 'PAUSE' }); setMessages(prev => [...prev, { id: `qa-${Date.now()}`, role: 'assistant', content: '⏸ Paused!', timestamp: Date.now() }]); } },
                { label: '⛈️ Extreme', action: () => { onAction({ type: 'SET_PRESET', payload: 160 }); setMessages(prev => [...prev, { id: `qa-${Date.now()}`, role: 'assistant', content: '⛈️ Set to extreme storm (160 mm/hr)!', timestamp: Date.now() }]); } },
                { label: '🎬 Demo', action: () => { onAction({ type: 'START_DEMO' }); setMessages(prev => [...prev, { id: `qa-${Date.now()}`, role: 'assistant', content: '🎬 Starting demo mode!', timestamp: Date.now() }]); } },
              ].map((qa) => (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  className="flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/40 transition-colors"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-800/60">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything or give a command..."
                  disabled={isThinking}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={isThinking || !input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                >
                  {isThinking ? '...' : '→'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
