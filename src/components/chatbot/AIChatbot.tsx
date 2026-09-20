/**
 * FLOWSHIELD — AI Chatbot powered by Gemini
 *
 * A floating flood intelligence assistant that can:
 * - Answer questions about floods, weather, and disaster safety
 * - Provide instant emergency helplines & CWC telemetry updates
 * - Control the simulation when active
 * - Fallback gracefully with curated disaster intelligence if offline
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send } from 'lucide-react';
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

export interface SimulationContext {
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

export interface AIChatbotProps {
  context?: SimulationContext;
  onAction?: (action: ChatAction) => void;
}

const DEFAULT_SIM_CONTEXT: SimulationContext = {
  config: {
    rainfallIntensity: 40,
    rainfallDuration: 60,
    drainageEfficiency: 0.75,
    elevationMultiplier: 1.0,
    rows: 8,
    cols: 8,
  } as any,
  stats: {
    safeCells: 58,
    warningCells: 4,
    criticalCells: 2,
    maxWater: 1.25,
    avgWater: 0.18,
    affectedPopulation: 14500,
  } as any,
  currentTime: 15,
  totalSteps: 120,
  isPlaying: false,
  playbackSpeed: 1,
  isDemoMode: false,
  emergencyMode: false,
  blockedCellsCount: 0,
};

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
        description: 'Search for real-time weather data for a specific city/location.',
        parameters: {
          type: 'object',
          properties: {
            city: { type: 'string', description: 'City name to search for' },
          },
          required: ['city'],
        },
      },
    ],
  },
];

function buildSystemPrompt(_ctx: SimulationContext): string {
  return `You are FlowShield AI — the flood intelligence and disaster assistant for FlowShield India (monitoring 1,500 Central Water Commission stations).
## Your Capabilities:
- Answer questions on flood warnings, flood preparedness, river basin telemetry, emergency numbers (NDRF: 011-24363260, State: 1070, District: 1077, National: 112).
- Help citizens and operators interpret water stage levels, warning thresholds, and dam discharges.
- Be concise, calm, actionable, and authoritative.`;
}

function getLocalKnowledgeResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('help') && (q.includes('number') || q.includes('line') || q.includes('contact') || q.includes('sos') || q.includes('emergency'))) {
    return `🚨 **National Emergency Flood Helplines (India):**\n\n• **112** — Single National Emergency Number\n• **1070** — State Disaster Management Authority (Toll-Free)\n• **1077** — District Disaster Management Control Room\n• **011-24363260** — National Disaster Response Force (NDRF HQ)\n• **1072** — Indian Railways Disaster Relief Helpline\n\nFor real-time local contacts by state, navigate to the **Contact & SOS** tab.`;
  }

  if (q.includes('safety') || q.includes('precaution') || q.includes('what to do') || q.includes('advice')) {
    return `🛡️ **Official Flood Safety Guidelines (NDMA):**\n\n1. **High Ground:** Move immediately to elevated structures or designated relief shelters.\n2. **Avoid Moving Water:** Never walk, swim, or drive through flood waters (just 15 cm of moving water can knock an adult down; 30 cm can float a vehicle).\n3. **Power Isolation:** Switch off all electricity main breakers and LPG gas regulators before leaving.\n4. **Emergency Kit:** Keep drinking water, battery torch, first-aid kit, ORS, dry rations, and ID documents wrapped in waterproof bags.\n5. **Boil Water:** Drink only boiled or chlorinated water to prevent waterborne epidemics.`;
  }

  if (q.includes('station') || q.includes('gauge') || q.includes('cwc') || q.includes('telemetry') || q.includes('basin')) {
    return `🌊 **CWC Hydrographic Network Telemetry:**\n\n• FlowShield tracks **1,500 active hydrological telemetry stations** across India's 20 major river basins.\n• Stations measure stage level (in meters) and reservoir storage inflow (in cusecs / cumecs).\n• Flood alert tiers: **Normal** (below warning), **Above Normal** (within 0.5m of warning), **Severe** (breached warning stage), and **Extreme** (surpassed Highest Flood Level / HFL).\n• Check the live **Stations** or **Basins** page for real-time stage hydrographs.`;
  }

  if (q.includes('disaster') || q.includes('history') || q.includes('kedarnath') || q.includes('kerala') || q.includes('wayanad')) {
    return `📜 **Indian Natural Disaster Archives:**\n\nFlowShield provides verified documentation on landmark events including:\n• **2024 Wayanad Catastrophe** (Kerala mudslides & flash deluge)\n• **2024 Assam & Brahmaputra Floods** (2.4M people affected)\n• **2023 Yamuna Historic Breach** (208.66m all-time record in Delhi)\n• **2018 Great Kerala Floods** (Centennial deluge, 35 dams opened)\n• **2013 Kedarnath Himalayan Deluge** (Chorabari moraine outburst)\n\nView complete situation reports under the **Disasters** tab.`;
  }

  if (q.includes('globe') || q.includes('3d') || q.includes('satellite') || q.includes('earth')) {
    return `🌍 **3D Satellite Earth Globe:**\n\nYou can launch the 3D Satellite Earth Globe anytime by clicking the **3D Globe** button in the top navigation bar or the **3D Earth** button in the map controls! It renders a 60fps orbital perspective centered on the Survey of India boundary.`;
  }

  return `FlowShield monitors real-time flood telemetry across 1,500 Central Water Commission stations in India.\n\nHow can I assist you today?\n• Check **emergency helplines (112 / 1070)**\n• Review **flood safety & evacuation guidelines**\n• Understand **CWC station warning thresholds**\n• Explore **landmark disaster archives**`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const AIChatbot: React.FC<AIChatbotProps> = ({
  context = DEFAULT_SIM_CONTEXT,
  onAction = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am FlowShield AI — your national flood intelligence assistant.\n\nI can answer questions on flood warnings, CWC telemetry, NDMA safety protocols, and emergency contacts.\n\nHow can I help you today?",
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
  }, [messages, isThinking]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  const executeFunctionCall = useCallback(
    (name: string, args: Record<string, any>): { result: string; action?: ChatAction } => {
      switch (name) {
        case 'change_rainfall_intensity':
          return {
            result: `Rainfall intensity set to ${args.intensity} mm/hr.`,
            action: { type: 'CHANGE_RAINFALL', payload: args.intensity },
          };
        case 'change_storm_duration':
          return {
            result: `Storm duration updated to ${args.minutes} minutes.`,
            action: { type: 'CHANGE_DURATION', payload: args.minutes },
          };
        case 'change_drainage_quality':
          return {
            result: `Drainage efficiency adjusted to ${args.percent}%.`,
            action: { type: 'CHANGE_DRAINAGE', payload: args.percent / 100 },
          };
        case 'set_storm_preset':
          return {
            result: `Storm scenario preset "${args.preset}" applied.`,
            action: { type: 'SET_PRESET', payload: args.preset },
          };
        case 'play_simulation':
          return { result: 'Simulation playback started.', action: { type: 'PLAY' } };
        case 'pause_simulation':
          return { result: 'Simulation playback paused.', action: { type: 'PAUSE' } };
        case 'reset_simulation':
          return { result: 'Simulation reset to t=0.', action: { type: 'RESET' } };
        case 'search_location':
          return {
            result: `Searching meteorological conditions for ${args.city}...`,
            action: { type: 'SEARCH_LOCATION', payload: args.city },
          };
        default:
          return { result: `Command accepted: ${name}` };
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride || input).trim();
      if (!text || isThinking) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!textOverride) setInput('');
      setIsThinking(true);

      // If Gemini API key is configured, invoke Gemini 2.0 Flash
      if (API_KEYS.GEMINI) {
        try {
          const recentMessages = [...messages.slice(-8), userMsg];
          const contents = recentMessages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }));

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
                temperature: 0.6,
                maxOutputTokens: 800,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const candidate = data.candidates?.[0];
            const parts = candidate?.content?.parts || [];

            let responseText = '';
            const allActions: ChatAction[] = [];

            for (const part of parts) {
              if (part.text && !part.thought) responseText += part.text;
              if (part.functionCall) {
                const { name, args } = part.functionCall;
                const { result, action } = executeFunctionCall(name, args || {});
                if (action) {
                  action.description = action.description || result;
                  allActions.push(action);
                  onAction(action);
                }
              }
            }

            if (!responseText && allActions.length > 0) {
              responseText = `Operation completed: ${allActions.map((a) => a.description).join(', ')}`;
            }

            if (responseText) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-${Date.now()}`,
                  role: 'assistant',
                  content: responseText,
                  actions: allActions.length > 0 ? allActions : undefined,
                  timestamp: Date.now(),
                },
              ]);
              setIsThinking(false);
              return;
            }
          }
        } catch (e) {
          console.info('[AIChatbot] Gemini service offline, using verified fallback:', e);
        }
      }

      // Offline / Instant Curated Knowledge Fallback
      setTimeout(() => {
        const responseText = getLocalKnowledgeResponse(text);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: responseText,
            timestamp: Date.now(),
          },
        ]);
        setIsThinking(false);
      }, 350);
    },
    [input, isThinking, messages, context, onAction, executeFunctionCall]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Launcher Button (Bottom-Right, Clears Mobile Nav) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 px-3.5 py-3 rounded-full bg-[var(--primary)] hover:brightness-110 text-white shadow-xl border border-[var(--border)] cursor-pointer group active:scale-95 transition-transform select-none"
            title="Open FlowShield Flood Intelligence Assistant"
            aria-label="Open Flood Intelligence Assistant"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--live)] animate-ping" />
            </div>
            <span className="hidden sm:inline font-semibold text-xs text-white pr-1">
              AI Assistant
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="FlowShield AI Assistant Dialog"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--live)]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-[var(--text)]">
                    FlowShield AI
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse" />
                    <span>Hydrological Intelligence</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap select-text ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary)] text-white rounded-br-xs'
                        : 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-bl-xs'
                    }`}
                  >
                    {msg.content}

                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[var(--border)]">
                        {msg.actions.map((act, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--live)]/15 text-[var(--live)] font-mono"
                          >
                            {act.description || act.type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-xs bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span>Analyzing hydrological intelligence...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-1.5 bg-[var(--surface-2)] border-t border-[var(--border)] flex gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { label: 'Emergency Helplines', prompt: 'What are the emergency flood helpline numbers in India?' },
                { label: 'Safety Checklist', prompt: 'What are the official flood safety precautions from NDMA?' },
                { label: 'CWC Telemetry', prompt: 'How does CWC monitor flood stages across river basins?' },
                { label: 'Historical Deluges', prompt: 'Tell me about the major historical floods in India' },
              ].map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => sendMessage(qp.prompt)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] transition-all cursor-pointer whitespace-nowrap"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about flood stages, safety, or helplines..."
                  disabled={isThinking}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isThinking || !input.trim()}
                  className="p-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs shrink-0"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
