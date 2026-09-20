/**
 * FLOWSHIELD — AI Chatbot & Command Navigator (Component Only)
 *
 * Full-featured Flood Intelligence Assistant and Command Palette:
 * - Global Ctrl+K / Cmd+K keyboard shortcut activation
 * - Natural-language flood intelligence queries (CWC standards, emergency SOS, NDMA protocols)
 * - Seamless page routing via react-router-dom
 * - Interactive arrow-key navigation (ArrowUp/Down + Enter)
 * - Gemini API integration with offline local intelligence fallback
 *
 * NOTE: All non-component exports (types, routes, logic) live in ./chatbotData.ts
 * to maintain React Fast Refresh compatibility.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Navigation,
  ArrowRight,
  Command,
  Search,
  CheckCircle2,
  CornerDownLeft,
} from 'lucide-react';
import { API_KEYS, API_ENDPOINTS } from '../../config/api';
import type { SimConfig, SimStats } from '../../sim/types';
import {
  APP_NAV_ROUTES,
  findCommandNavigationIntent,
  findDirectRouteMatch,
  answerQueryWithKnowledgeBase,
  type NavRoute,
  type ChatAction,
  type SimulationContext,
  type AIChatbotProps,
} from './chatbotData';

// ─── Internal Types ─────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ChatAction[];
  suggestedRoute?: NavRoute;
  navigated?: boolean;
  timestamp: number;
}

// ─── Default Context ─────────────────────────────────────────────────────────

const DEFAULT_SIM_CONTEXT: SimulationContext = {
  config: {
    rainfallIntensity: 40,
    rainfallDuration: 60,
    drainageEfficiency: 0.75,
    elevationMultiplier: 1.0,
    rows: 8,
    cols: 8,
  } as SimConfig,
  stats: {
    safeCells: 58,
    warningCells: 4,
    criticalCells: 2,
    maxWater: 1.25,
    avgWater: 0.18,
    affectedPopulation: 14500,
  } as SimStats,
  currentTime: 15,
  totalSteps: 120,
  isPlaying: false,
  playbackSpeed: 1,
  isDemoMode: false,
  emergencyMode: false,
  blockedCellsCount: 0,
};

// ─── Gemini Tools Declaration ────────────────────────────────────────────────

const GEMINI_TOOLS = [
  {
    function_declarations: [
      {
        name: 'navigate_to_page',
        description:
          'Navigate the application to a specific section or page. Use "/", "/stations", "/basins", "/bulletins", "/disasters", "/watchlist", "/report-incident", "/contact", "/export", "/help", or "globe".',
        parameters: {
          type: 'object',
          properties: {
            route: {
              type: 'string',
              description: 'Target route path or "globe"',
            },
          },
          required: ['route'],
        },
      },
    ],
  },
];

function buildSystemPrompt(_ctx: SimulationContext): string {
  return `You are FlowShield AI — the national flood intelligence assistant and command navigator for FlowShield India.
You monitor 1,500 Central Water Commission stations across 20 river basins in India.
CRITICAL INSTRUCTIONS:
1. When the user asks to go to, open, see, or navigate to a page, call "navigate_to_page" with the route ("/", "/stations", "/basins", "/bulletins", "/disasters", "/watchlist", "/report-incident", "/contact", "/export", "/help", "globe").
2. For questions about water levels, explain Warning Level vs Danger Level vs HFL.
3. For emergencies, give 112, 1070, 1077, and NDRF 011-24363260.
4. Keep responses concise, authoritative, and formatted in clean markdown.`;
}

// ─── Component ───────────────────────────────────────────────────────────────

const AIChatbot: React.FC<AIChatbotProps> = ({ context = DEFAULT_SIM_CONTEXT }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 **Welcome to FlowShield AI Navigator!**\n\nI can navigate to any section or answer queries about flood telemetry and emergency helplines.\n\n⌨️ **Shortcuts:** Press **Ctrl+K** or **Cmd+K** anywhere to open/close.\n\n**Quick Commands:**\n• `/stations` or *"Go to stations"*\n• `/basins` or *"River basins status"*\n• `/contact` or *"Emergency helplines"*\n• `/globe` or *"3D Satellite Earth"*',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K (Capture phase) + Escape to close
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isOpen]);

  // Custom event listener to open chatbot from external buttons
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('fs-open-chatbot', handleOpen);
    return () => window.removeEventListener('fs-open-chatbot', handleOpen);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Focus & select input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Execute route navigation
  const executeNavigation = useCallback(
    (targetPath: string) => {
      if (targetPath === 'globe' || targetPath.includes('globe')) {
        window.dispatchEvent(new CustomEvent('fs-replay-intro'));
        setIsOpen(false);
        return;
      }
      navigate(targetPath);
      if (window.innerWidth < 768) setIsOpen(false);
    },
    [navigate]
  );

  // Filter routes matching user input for command suggestions
  const matchingRoutes = useMemo(() => {
    const cleanInput = input.trim().toLowerCase().replace(/^\/+/, '');
    if (!cleanInput) return APP_NAV_ROUTES.slice(0, 4);
    return APP_NAV_ROUTES.filter(
      (r) =>
        r.label.toLowerCase().includes(cleanInput) ||
        r.path.toLowerCase().replace(/^\/+/, '').includes(cleanInput) ||
        r.keywords.some((kw) => kw.includes(cleanInput))
    ).slice(0, 5);
  }, [input]);

  // Reset selected index when matching routes change
  useEffect(() => {
    setSelectedIndex(0);
  }, [matchingRoutes]);

  // Send message or execute command
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

      // 1. Check for direct navigation command
      const navTarget = findCommandNavigationIntent(text);
      if (navTarget) {
        executeNavigation(navTarget.path);
        const confirmMsg =
          navTarget.path === 'globe'
            ? `🌍 **Launching 3D Satellite Earth Globe...**\n\nCentered on Survey of India coordinates. Press **Esc** or click **Exit 3D View** to return.`
            : `🚀 **Navigated to ${navTarget.label}** (\`${navTarget.path}\`)\n\n${navTarget.description}. Click below to revisit anytime.`;

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: confirmMsg,
              suggestedRoute: navTarget,
              navigated: true,
              timestamp: Date.now(),
            },
          ]);
          setIsThinking(false);
        }, 150);
        return;
      }

      // 2. Gemini API call if configured
      if (API_KEYS.GEMINI && API_KEYS.GEMINI.trim().length > 5) {
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
              system_instruction: { parts: [{ text: buildSystemPrompt(context) }] },
              contents,
              tools: GEMINI_TOOLS,
              generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const candidate = data.candidates?.[0];
            const parts = candidate?.content?.parts || [];

            let responseText = '';
            let targetRoute: NavRoute | undefined;

            for (const part of parts) {
              if (part.text && !part.thought) responseText += part.text;
              if (part.functionCall) {
                const { name, args } = part.functionCall;
                if (name === 'navigate_to_page' && args?.route) {
                  const matched =
                    findDirectRouteMatch(args.route) ||
                    APP_NAV_ROUTES.find(
                      (r) => r.path === args.route || r.keywords.includes(args.route.toLowerCase())
                    );
                  if (matched) {
                    targetRoute = matched;
                    executeNavigation(matched.path);
                    responseText = `🚀 **Navigated to ${matched.label}** (\`${matched.path}\`)\n\n${responseText || matched.description}`;
                  }
                }
              }
            }

            if (responseText) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-${Date.now()}`,
                  role: 'assistant',
                  content: responseText,
                  suggestedRoute: targetRoute,
                  timestamp: Date.now(),
                },
              ]);
              setIsThinking(false);
              return;
            }
          }
        } catch {
          // Fall through to offline knowledge engine
        }
      }

      // 3. Offline knowledge engine fallback
      setTimeout(() => {
        const { text: responseText, route } = answerQueryWithKnowledgeBase(text);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: responseText,
            suggestedRoute: route,
            timestamp: Date.now(),
          },
        ]);
        setIsThinking(false);
      }, 250);
    },
    [input, isThinking, messages, context, executeNavigation]
  );

  // Keyboard navigation inside input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (matchingRoutes.length > 0) setSelectedIndex((prev) => (prev + 1) % matchingRoutes.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (matchingRoutes.length > 0) setSelectedIndex((prev) => (prev - 1 + matchingRoutes.length) % matchingRoutes.length);
      return;
    }
    if (e.key === 'Tab' && matchingRoutes.length > 0) {
      e.preventDefault();
      const target = matchingRoutes[selectedIndex] || matchingRoutes[0];
      setInput(target.path);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const clean = input.trim().toLowerCase();
      if (clean.startsWith('/') || clean.length < 20) {
        const direct = findDirectRouteMatch(clean);
        if (direct) {
          executeNavigation(direct.path);
          sendMessage(clean);
          return;
        }
      }
      if (matchingRoutes.length > 0 && clean.startsWith('/')) {
        const target = matchingRoutes[selectedIndex] || matchingRoutes[0];
        executeNavigation(target.path);
        sendMessage(`Go to ${target.label}`);
        return;
      }
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 px-3.5 py-3 rounded-full bg-[var(--primary)] hover:brightness-110 text-white shadow-xl border border-[var(--border)] cursor-pointer group active:scale-95 transition-transform select-none"
            title="Open FlowShield AI Navigator (Ctrl+K / ⌘K)"
            aria-label="Open Flood Intelligence Assistant"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--live)] animate-ping" />
            </div>
            <span className="hidden sm:inline font-semibold text-xs text-white pr-1">
              AI Navigator
            </span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/25 text-white/90 border border-white/20">
              ⌘K
            </kbd>
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
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[460px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-2xl overflow-hidden backdrop-blur-md"
            role="dialog"
            aria-label="FlowShield AI Navigator Dialog"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--live)]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm text-[var(--text)]">
                      FlowShield AI Navigator
                    </h3>
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                      Ctrl+K / ⌘K
                    </kbd>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse" />
                    <span>Live Page Navigation & Flood Telemetry</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Close dialog (Esc)"
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
                    className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap select-text ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary)] text-white rounded-br-xs'
                        : 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-bl-xs'
                    }`}
                  >
                    {msg.content}

                    {/* Suggested Navigation Link */}
                    {msg.suggestedRoute && (
                      <div className="mt-2.5 pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => executeNavigation(msg.suggestedRoute!.path)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[var(--live)]" />
                          <span>Open {msg.suggestedRoute.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        {msg.navigated && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--live)] font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Navigated
                          </span>
                        )}
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
                    <span>Analyzing flood intelligence & routes...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Route Suggestions */}
            {matchingRoutes.length > 0 && (
              <div className="px-3 py-2 bg-[var(--surface-2)] border-t border-[var(--border)] flex flex-col gap-1.5 text-xs shrink-0">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Command className="w-3 h-3 text-[var(--live)]" /> Quick Routes (↑↓ Enter):
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {matchingRoutes.length} options
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {matchingRoutes.map((route, idx) => {
                    const Icon = route.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={route.path}
                        type="button"
                        onClick={() => {
                          executeNavigation(route.path);
                          sendMessage(`Go to ${route.label}`);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium text-xs text-left ${
                          isSelected
                            ? 'bg-[var(--primary)] text-white border-transparent shadow-xs'
                            : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--live)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[var(--primary)]'}`}
                          />
                          <span className="truncate">{route.label}</span>
                          <span
                            className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'}`}
                          >
                            `{route.path}`
                          </span>
                        </div>
                        <CornerDownLeft
                          className={`w-3 h-3 shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-[var(--text-muted)]'}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Action Chips */}
            <div className="px-3 py-1.5 bg-[var(--surface-2)] border-t border-[var(--border)] flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {[
                { label: 'Stations', prompt: 'Take me to stations', icon: '🌊' },
                { label: 'Basins', prompt: 'Go to basins', icon: '🏞️' },
                { label: '3D Globe', prompt: 'Launch 3D globe', icon: '🌍' },
                { label: 'SOS Helplines', prompt: 'Emergency helpline numbers', icon: '🚨' },
                { label: 'Warning vs Danger', prompt: 'What is Warning Level vs Danger Level?', icon: '⚠️' },
                { label: 'Disasters', prompt: 'Open disaster history', icon: '📜' },
                { label: 'Bulletins', prompt: 'Show flood bulletins', icon: '📋' },
              ].map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => sendMessage(qp.prompt)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1"
                >
                  <span>{qp.icon}</span>
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type /stations, a page name, or ask a flood question..."
                    disabled={isThinking}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isThinking || !input.trim()}
                  className="p-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs shrink-0"
                  title="Send message or navigate"
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

export { AIChatbot };
export default AIChatbot;
