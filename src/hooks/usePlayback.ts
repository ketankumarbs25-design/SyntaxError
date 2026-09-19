/**
 * FLOWSHIELD — Playback Controller
 *
 * Implements a decoupled simulation playback clock:
 * - Powered by requestAnimationFrame with a fixed accumulator
 * - Target 10 simulation-steps/second (100ms per sim step)
 * - Decoupled from render loop to ensure frame stability
 * - Instant bidirectional scrubbing via direct array index lookup
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePlaybackOptions {
  totalSteps: number;
  initialStep?: number;
  targetStepsPerSec?: number;
  onStepChange?: (step: number) => void;
}

export function usePlayback({
  totalSteps,
  initialStep = 0,
  targetStepsPerSec = 10,
  onStepChange,
}: UsePlaybackOptions) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  const currentStepRef = useRef(currentStep);
  const isPlayingRef = useRef(isPlaying);
  const totalStepsRef = useRef(totalSteps);
  const speedRef = useRef(playbackSpeed);

  useEffect(() => {
    currentStepRef.current = currentStep;
    isPlayingRef.current = isPlaying;
    totalStepsRef.current = totalSteps;
    speedRef.current = playbackSpeed;
  });

  // Step duration in ms: 10 steps/sec -> 100ms base
  const baseStepInterval = 1000 / targetStepsPerSec;

  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  const setStep = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(totalStepsRef.current - 1, Math.round(step)));
      setCurrentStep(clamped);
      if (onStepChange) onStepChange(clamped);
    },
    [onStepChange]
  );

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      // If at end, loop back to start on play
      if (!prev && currentStepRef.current >= totalStepsRef.current - 1) {
        setStep(0);
      }
      return !prev;
    });
  }, [setStep]);

  const play = useCallback(() => {
    if (currentStepRef.current >= totalStepsRef.current - 1) {
      setStep(0);
    }
    setIsPlaying(true);
  }, [setStep]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setStep(0);
    accumulatorRef.current = 0;
    lastTimeRef.current = null;
  }, [setStep]);

  // Keep currentStep within bounds if totalSteps changes
  useEffect(() => {
    if (currentStep >= totalSteps && totalSteps > 0) {
      setStep(totalSteps - 1);
    }
  }, [totalSteps, currentStep, setStep]);

  // requestAnimationFrame with fixed accumulator loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const frame = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Prevent accumulator explosion on tab defocus (max 500ms)
      accumulatorRef.current += Math.min(deltaMs, 500);

      const effectiveInterval = baseStepInterval / speedRef.current;
      let stepUpdated = false;
      let nextStep = currentStepRef.current;

      while (accumulatorRef.current >= effectiveInterval) {
        accumulatorRef.current -= effectiveInterval;
        if (nextStep < totalStepsRef.current - 1) {
          nextStep += 1;
          stepUpdated = true;
        } else {
          // Reached end of simulation
          setIsPlaying(false);
          accumulatorRef.current = 0;
          break;
        }
      }

      if (stepUpdated) {
        setCurrentStep(nextStep);
        if (onStepChange) onStepChange(nextStep);
      }

      if (isPlayingRef.current && nextStep < totalStepsRef.current - 1) {
        rafIdRef.current = requestAnimationFrame(frame);
      }
    };

    rafIdRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, baseStepInterval, onStepChange]);

  return {
    currentStep,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    setStep,
    togglePlay,
    play,
    pause,
    reset,
  };
}
