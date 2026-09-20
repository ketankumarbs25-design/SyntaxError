import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, Children } from "react";
// Importing class-variance-authority for the built-in button component
import { cva } from "class-variance-authority";
// Importing icons from lucide-react
import { ArrowRight, Mail, Gem, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader } from "lucide-react";
// Importing animation components from framer-motion
import { AnimatePresence, motion, useInView, type Variants, type Transition } from "framer-motion";

// --- CONFETTI LOGIC ---
import type { GlobalOptions as ConfettiGlobalOptions, CreateTypes as ConfettiInstance, Options as ConfettiOptions } from "canvas-confetti";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";

type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithRef<"canvas"> & { options?: ConfettiOptions; globalOptions?: ConfettiGlobalOptions; manualstart?: boolean }>((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, [globalOptions]);
  const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

// --- TEXT LOOP ANIMATION COMPONENT ---
type TextLoopProps = { children: React.ReactNode[]; className?: string; interval?: number; transition?: Transition; variants?: Variants; onIndexChange?: (index: number) => void; stopOnEnd?: boolean; };
export function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };
  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- BUILT-IN BLUR FADE ANIMATION COMPONENT ---
interface BlurFadeProps { children: React.ReactNode; className?: string; variant?: { hidden: { y: number }; visible: { y: number } }; duration?: number; delay?: number; yOffset?: number; inView?: boolean; inViewMargin?: string; blur?: string; }
function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px" }: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// --- BUILT-IN GLASS BUTTON COMPONENT (WITH CLICK FIX) ---
const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", { variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } }, defaultVariants: { size: "default" } });
const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", { variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } }, defaultVariants: { size: "default" } });
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg' | 'icon' | null;
  contentClassName?: string;
}
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector('button');
      if (button && e.target !== button) button.click();
    };
    return (
      <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
        <button className={cn("glass-button relative z-10", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
          <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
        </button>
        <div className="glass-button-shadow rounded-full pointer-events-none"></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

// --- THEME-AWARE SVG GRADIENT BACKGROUND WITH SUBTLE ANIMATION ---
const GradientBackground = () => (
    <>
        <style>
            {` @keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } } `}
        </style>
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
            <defs>
                <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-primary)', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-3)', stopOpacity:0.6}} /></linearGradient>
                <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-chart-4)', stopOpacity:0.9}} /><stop offset="50%" style={{stopColor: 'var(--color-secondary)', stopOpacity:0.7}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-1)', stopOpacity:0.6}} /></linearGradient>
                <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%"><stop offset="0%" style={{stopColor: 'var(--color-destructive)', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-5)', stopOpacity:0.4}} /></radialGradient>
                <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="35"/></filter>
                <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="25"/></filter>
                <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45"/></filter>
            </defs>
            <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
                <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#rev_grad1)" filter="url(#rev_blur1)" transform="rotate(-30 200 500)"/>
                <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#rev_grad2)" filter="url(#rev_blur2)" transform="rotate(15 650 225)"/>
            </g>
            <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
                <circle cx="650" cy="450" r="150" fill="url(#rev_grad3)" filter="url(#rev_blur3)" opacity="0.7"/>
                <ellipse cx="50" cy="150" rx="180" ry="120" fill="var(--color-accent)" filter="url(#rev_blur2)" opacity="0.8"/>
            </g>
        </svg>
    </>
);

// --- CHILD COMPONENTS ---
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-6 h-6"> <g fillRule="evenodd" fill="none"> <g fillRule="nonzero" transform="translate(3, 2)"> <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"></path> <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"></path> <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"></path> <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"></path> </g> </g></svg> );
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-6 h-6"> <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/> </svg> );

const DefaultLogo = () => ( <div className="bg-primary text-primary-foreground rounded-md p-1.5"> <Gem className="h-4 w-4" /> </div> );

export interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AuthComponent = ({
  logo = <DefaultLogo />,
  brandName = "EaseMize",
  onClose,
  onSuccess,
}: AuthComponentProps) => {
  const { loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState<"email" | "password" | "confirmPassword">("email");
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [modalStatus, setModalStatus] = useState<'closed' | 'loading' | 'error' | 'success'>('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Authenticating...');
  const confettiRef = useRef<ConfettiRef>(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length >= 6;
  
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  
  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
        const particleCount = 50;
        fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
        fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  // 1-Click Google OAuth
  const handleGoogleAuth = async () => {
    setLoadingMessage('Connecting to Google SSO...');
    setModalStatus('loading');
    const res = await loginWithGoogle({
      name: 'Gaurav Kumar',
      email: 'gaurav.kumar@flowshield.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });
    if (res.success) {
      fireSideCanons();
      setModalStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1000);
    } else {
      setModalErrorMessage(res.error || 'Google login failed.');
      setModalStatus('error');
    }
  };

  // 1-Click GitHub OAuth
  const handleGithubAuth = async () => {
    setLoadingMessage('Authorizing with GitHub OAuth...');
    setModalStatus('loading');
    const res = await loginWithGithub({
      name: 'Ketan Kumar (GitHub)',
      email: 'ketan.developer@github.com',
      avatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    });
    if (res.success) {
      fireSideCanons();
      setModalStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1000);
    } else {
      setModalErrorMessage(res.error || 'GitHub OAuth failed.');
      setModalStatus('error');
    }
  };

  // Quick Demo Account Auto-Fill & Login
  const handleDemoLogin = async (type: 'admin' | 'analyst') => {
    setLoadingMessage(type === 'admin' ? 'Logging in as Chief Hydrologist...' : 'Logging in as Response Analyst...');
    setModalStatus('loading');
    const emailToUse = type === 'admin' ? 'admin@flowshield.io' : 'gaurav@flowshield.io';
    const res = await loginWithEmail(emailToUse, 'password123');
    if (res.success) {
      fireSideCanons();
      setModalStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1000);
    } else {
      setModalErrorMessage(res.error || 'Login failed.');
      setModalStatus('error');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalStatus !== 'closed') return;

    if (isLoginMode) {
      // Direct Email & Password Sign In
      setLoadingMessage('Verifying credentials...');
      setModalStatus('loading');
      const res = await loginWithEmail(email, password);
      if (res.success) {
        fireSideCanons();
        setModalStatus('success');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 1000);
      } else {
        setModalErrorMessage(res.error || 'Invalid email or password.');
        setModalStatus('error');
      }
      return;
    }

    // Sign Up Registration Flow
    if (authStep === 'confirmPassword') {
      if (password !== confirmPassword) {
        setModalErrorMessage("Passwords do not match!");
        setModalStatus('error');
        return;
      }
      setLoadingMessage('Creating secure account...');
      setModalStatus('loading');
      const name = email.split('@')[0];
      const res = await registerWithEmail(name, email, password);
      if (res.success) {
        fireSideCanons();
        setModalStatus('success');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 1000);
      } else {
        setModalErrorMessage(res.error || 'Registration failed.');
        setModalStatus('error');
      }
    }
  };

  const handleProgressStep = () => {
    if (authStep === 'email') {
      if (isEmailValid) setAuthStep("password");
    } else if (authStep === 'password') {
      if (isLoginMode) {
        // In login mode, pressing enter or clicking proceed on password submits form
        handleFinalSubmit({ preventDefault: () => {} } as React.FormEvent);
      } else if (isPasswordValid) {
        setAuthStep("confirmPassword");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProgressStep();
    }
  };

  const handleGoBack = () => {
    if (authStep === 'confirmPassword') {
      setAuthStep('password');
      setConfirmPassword('');
    } else if (authStep === 'password') {
      setAuthStep('email');
    }
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  useEffect(() => {
    if (authStep === 'password') setTimeout(() => passwordInputRef.current?.focus(), 500);
    else if (authStep === 'confirmPassword') setTimeout(() => confirmPasswordInputRef.current?.focus(), 500);
  }, [authStep]);

  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== 'closed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-slate-900 border-2 border-slate-700 text-white rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-4 shadow-2xl">
            {(modalStatus === 'error' || modalStatus === 'success') && (
              <button onClick={closeModal} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            )}
            {modalStatus === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-sm font-medium text-center text-slate-200">{modalErrorMessage}</p>
                <GlassButton onClick={closeModal} size="sm" className="mt-2">Try Again</GlassButton>
              </>
            )}
            {modalStatus === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <Loader className="w-12 h-12 text-blue-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-200">{loadingMessage}</p>
                <p className="text-xs text-slate-400">Verifying secure telemetry credentials...</p>
              </div>
            )}
            {modalStatus === 'success' && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <PartyPopper className="w-12 h-12 text-emerald-400 animate-bounce" />
                <p className="text-base font-bold text-white">Authenticated Successfully!</p>
                <p className="text-xs text-slate-300">Granting access to CWC telemetry and emergency services...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-background min-h-screen w-screen flex flex-col">
      <style>{`
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; }
        input[type="password"]::-webkit-credentials-auto-fill-button, input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px transparent inset !important;
          -webkit-text-fill-color: var(--foreground) !important;
          background-color: transparent !important;
          background-clip: content-box !important;
          transition: background-color 5000s ease-in-out 0s !important;
          color: var(--foreground) !important;
          caret-color: var(--foreground) !important;
        }
        @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
        @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
        .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); }
        .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); }
        .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15)); border: 1px solid rgba(255,255,255,0.12); }
        .glass-button:hover { transform: scale(0.98); }
        .glass-input-wrap { position: relative; z-index: 2; border-radius: 9999px; }
        .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); }
      `}</style>

      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
      <Modal />

      <div className={cn("fixed top-4 left-4 z-20 flex items-center gap-2", "md:left-1/2 md:-translate-x-1/2")}>
        {logo}
        <h1 className="text-base font-bold text-foreground">{brandName}</h1>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication screen"
          className="fixed top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className={cn("flex w-full flex-1 h-full items-center justify-center bg-card", "relative overflow-hidden")}>
        <div className="absolute inset-0 z-0"><GradientBackground /></div>
        
        <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-6 w-[340px] max-w-full mx-auto p-4">
          {/* Header Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-full border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(false);
                setAuthStep('email');
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                !isLoginMode ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(true);
                setAuthStep('email');
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                isLoginMode ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authStep === "email" && (
              <motion.div key="email-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center gap-3">
                <BlurFade delay={0.1} className="w-full text-center">
                  <p className="font-serif font-light text-3xl sm:text-4xl tracking-tight text-foreground whitespace-nowrap">
                    {isLoginMode ? 'Welcome Back' : 'Get Started with Us'}
                  </p>
                </BlurFade>
                <BlurFade delay={0.2}>
                  <p className="text-xs font-medium text-muted-foreground">
                    Continue with instant OAuth
                  </p>
                </BlurFade>
                
                {/* 1-Click OAuth Buttons */}
                <BlurFade delay={0.25} className="w-full">
                  <div className="flex items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-xs font-bold text-white transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                    >
                      <GoogleIcon />
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGithubAuth}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-xs font-bold text-white transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                    >
                      <GitHubIcon />
                      <span>GitHub</span>
                    </button>
                  </div>
                </BlurFade>

                {/* 1-Click Demo Accounts */}
                <BlurFade delay={0.3} className="w-full">
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-center text-[11px] text-blue-200">
                    <p className="font-semibold mb-1.5 text-blue-300">⚡ 1-Click Fast Evaluator Accounts:</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('admin')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium cursor-pointer transition-colors"
                      >
                        Chief Hydrologist
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('analyst')}
                        className="px-2.5 py-1 rounded-lg bg-slate-700/90 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer transition-colors"
                      >
                        Field Officer
                      </button>
                    </div>
                  </div>
                </BlurFade>

                <BlurFade delay={0.35} className="w-full">
                  <div className="flex items-center w-full gap-2 py-1">
                    <hr className="w-full border-border"/>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Or with Email</span>
                    <hr className="w-full border-border"/>
                  </div>
                </BlurFade>
              </motion.div>
            )}

            {authStep === "password" && (
              <motion.div key="password-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-2">
                <BlurFade delay={0} className="w-full">
                  <p className="font-serif font-light text-2xl sm:text-3xl tracking-tight text-foreground">
                    {isLoginMode ? 'Enter Password' : 'Create Your Password'}
                  </p>
                </BlurFade>
                <BlurFade delay={0.1}>
                  <p className="text-xs text-muted-foreground">
                    {isLoginMode ? `Signing in as ${email}` : 'Must be at least 6 characters.'}
                  </p>
                </BlurFade>
              </motion.div>
            )}

            {authStep === "confirmPassword" && (
              <motion.div key="confirm-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-2">
                <BlurFade delay={0} className="w-full">
                  <p className="font-serif font-light text-2xl sm:text-3xl tracking-tight text-foreground">
                    One Last Step
                  </p>
                </BlurFade>
                <BlurFade delay={0.1}>
                  <p className="text-xs text-muted-foreground">
                    Confirm your password to create account
                  </p>
                </BlurFade>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleFinalSubmit} className="w-full space-y-4">
            <AnimatePresence>
              {authStep !== 'confirmPassword' && (
                <motion.div key="email-password-fields" exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full space-y-4">
                  <BlurFade delay={authStep === 'email' ? 0.4 : 0} inView={true} className="w-full">
                    <div className="relative w-full">
                      <div className="glass-input-wrap w-full">
                        <div className="glass-input">
                          <div className={cn("relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out", email.length > 20 && authStep === 'email' ? "w-0 px-0" : "w-10 pl-2")}>
                            <Mail className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                          </div>
                          <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={cn("relative z-10 h-10 w-0 flex-grow bg-transparent text-sm text-foreground placeholder:text-foreground/60 focus:outline-none transition-[padding-right] duration-300 ease-in-out delay-300", isEmailValid && authStep === 'email' ? "pr-2" : "pr-0")}
                          />
                          <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isEmailValid && authStep === 'email' ? "w-10 pr-1" : "w-0")}>
                            <GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Continue with email" contentClassName="text-foreground/80 hover:text-foreground">
                              <ArrowRight className="w-4 h-4" />
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BlurFade>

                  <AnimatePresence>
                    {authStep === "password" && (
                      <BlurFade key="password-field" className="w-full">
                        <div className="relative w-full">
                          <div className="glass-input-wrap w-full">
                            <div className="glass-input">
                              <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                {isPasswordValid ? (
                                  <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="text-foreground/80 hover:text-foreground transition-colors p-2 rounded-full cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                ) : (
                                  <Lock className="h-4 w-4 text-foreground/80 flex-shrink-0" />
                                )}
                              </div>
                              <input
                                ref={passwordInputRef}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="relative z-10 h-10 w-0 flex-grow bg-transparent text-sm text-foreground placeholder:text-foreground/60 focus:outline-none"
                              />
                              <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isPasswordValid ? "w-10 pr-1" : "w-0")}>
                                <GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Submit password" contentClassName="text-foreground/80 hover:text-foreground">
                                  <ArrowRight className="w-4 h-4" />
                                </GlassButton>
                              </div>
                            </div>
                          </div>
                        </div>
                        <BlurFade inView delay={0.1}>
                          <button type="button" onClick={handleGoBack} className="mt-3 flex items-center gap-1.5 text-xs text-foreground/70 hover:text-foreground transition-colors cursor-pointer">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to email
                          </button>
                        </BlurFade>
                      </BlurFade>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {authStep === 'confirmPassword' && (
                <BlurFade key="confirm-password-field" className="w-full">
                  <div className="relative w-full">
                    <div className="glass-input-wrap w-full">
                      <div className="glass-input">
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                          {isConfirmPasswordValid ? (
                            <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-foreground/80 hover:text-foreground transition-colors p-2 rounded-full cursor-pointer">
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          ) : (
                            <Lock className="h-4 w-4 text-foreground/80 flex-shrink-0" />
                          )}
                        </div>
                        <input
                          ref={confirmPasswordInputRef}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="relative z-10 h-10 w-0 flex-grow bg-transparent text-sm text-foreground placeholder:text-foreground/60 focus:outline-none"
                        />
                        <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isConfirmPasswordValid ? "w-10 pr-1" : "w-0")}>
                          <GlassButton type="submit" size="icon" aria-label="Finish sign-up" contentClassName="text-foreground/80 hover:text-foreground">
                            <ArrowRight className="w-4 h-4" />
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </div>
                  <BlurFade inView delay={0.1}>
                    <button type="button" onClick={handleGoBack} className="mt-3 flex items-center gap-1.5 text-xs text-foreground/70 hover:text-foreground transition-colors cursor-pointer">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to password
                    </button>
                  </BlurFade>
                </BlurFade>
              )}
            </AnimatePresence>
          </form>
        </fieldset>
      </div>
    </div>
  );
};

export default AuthComponent;
