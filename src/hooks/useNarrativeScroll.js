import { useCallback, useEffect, useRef, useState } from 'react';
import { sectionIds, chapterLabels, chapterSteps, chapterType, TOTAL_CHAPTERS, DESKTOP_MIN_WIDTH, DESKTOP_MIN_HEIGHT } from '../data/copy';

const CASCADE_INITIAL_DELAY_MS = 1000;
const CASCADE_STEP_MS = 800;
const CASCADE_SETTLE_MS = 1600;
const WHEEL_COOLDOWN_MS = 420;

const labelIndex = (label) => chapterLabels.indexOf(label);
const VISION_INDEX = labelIndex('Visión');
// Chapters whose cascade must wait for an external ready signal (logo draw, boceto video).
const INITIAL_HELD_LABELS = ['Inicio', 'Visión'];
// These chapters re-run their cascade on every re-entry, like Visión's headline beat.
const REPLAY_ON_ENTRY_LABELS = ['Quiénes somos', 'Colección', 'Visión'];

function getDesktopGate() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= DESKTOP_MIN_WIDTH && window.innerHeight >= DESKTOP_MIN_HEIGHT;
}

export function useNarrativeScroll() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [step, setStep] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(getDesktopGate);
  const [reducedMotion, setReducedMotion] = useState(typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);
  const activeRef = useRef(0);
  const stepRef = useRef(0);
  const cooldownRef = useRef(false);
  const accumulatedRef = useRef(0);
  const targetRef = useRef(0);
  const completedRef = useRef({});
  const enteredRef = useRef({});
  const timersRef = useRef([]);
  const pendingStartRef = useRef({});
  const holdsRef = useRef(Object.fromEntries(INITIAL_HELD_LABELS.map((label) => [labelIndex(label), true])));

  const clearCascadeTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const beginCascade = useCallback((index) => {
    const max = chapterSteps[index];
    const complete = () => { completedRef.current[index] = true; };
    let nextStep = 1;
    const tick = () => {
      stepRef.current = nextStep;
      setStep(nextStep);
      if (nextStep >= max) {
        timersRef.current.push(window.setTimeout(complete, CASCADE_SETTLE_MS));
        return;
      }
      nextStep += 1;
      timersRef.current.push(window.setTimeout(tick, CASCADE_STEP_MS));
    };
    tick();
  }, []);

  const scheduleCascade = useCallback((index) => {
    if (chapterType[index] !== 'step') return;
    if (completedRef.current[index]) return;
    if (index !== activeRef.current) return;
    clearCascadeTimers();
    const max = chapterSteps[index];
    if (!isDesktop || reducedMotion) {
      stepRef.current = max;
      setStep(max);
      completedRef.current[index] = true;
      return;
    }
    const start = () => {
      if (holdsRef.current[index]) {
        pendingStartRef.current[index] = true;
        return;
      }
      pendingStartRef.current[index] = false;
      beginCascade(index);
    };
    timersRef.current.push(window.setTimeout(start, CASCADE_INITIAL_DELAY_MS));
  }, [beginCascade, clearCascadeTimers, isDesktop, reducedMotion]);

  const navigateTo = useCallback((index) => {
    if (index < 0 || index >= TOTAL_CHAPTERS) return;
    clearCascadeTimers();
    pendingStartRef.current[index] = false;
    activeRef.current = index;
    stepRef.current = 0;
    accumulatedRef.current = 0;
    targetRef.current = 0;
    setActiveChapter(index);
    setStep(0);
    setSmoothProgress(0);
    enteredRef.current[index] = true;
    if (chapterType[index] !== 'step') return;
    const max = chapterSteps[index];
    const replay = REPLAY_ON_ENTRY_LABELS.includes(chapterLabels[index]);
    if (completedRef.current[index] && !replay) {
      stepRef.current = max;
      setStep(max);
      return;
    }
    completedRef.current[index] = false;
    scheduleCascade(index);
  }, [clearCascadeTimers, scheduleCascade]);

  // Gated chapters (Inicio logo, Visión boceto) call this when they are ready
  // for their cascade. If the entry timer already fired while held, start now;
  // otherwise the scheduled entry cascade (1 s headline pause) keeps its timing.
  const setChapterHold = useCallback((index, held) => {
    holdsRef.current[index] = held;
    if (!held && pendingStartRef.current[index] && index === activeRef.current && chapterType[index] === 'step' && !completedRef.current[index]) {
      pendingStartRef.current[index] = false;
      beginCascade(index);
    }
  }, [beginCascade]);

  useEffect(() => {
    const onResize = () => setIsDesktop(getDesktopGate());
    window.addEventListener('resize', onResize);
    const m = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const h = () => setIsDesktop(getDesktopGate());
    m.addEventListener('change', h);
    return () => { window.removeEventListener('resize', onResize); m.removeEventListener('change', h); };
  }, []);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(m.matches);
    const h = (e) => setReducedMotion(e.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;
    let raf;
    const loop = () => {
      const target = targetRef.current;
      setSmoothProgress((prev) => {
        const next = prev + (target - prev) * 0.18;
        return Math.abs(next - target) < 0.001 ? target : next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isDesktop, reducedMotion]);

  useEffect(() => {
    if (isDesktop) scheduleCascade(activeRef.current);
  }, [isDesktop, scheduleCascade]);

  useEffect(() => {
    if (!isDesktop) return;
    const isChapterBusy = (index) => chapterType[index] === 'step' && (!completedRef.current[index] || holdsRef.current[index]);
    const onWheel = (e) => {
      if (cooldownRef.current) return;
      const direction = e.deltaY > 0 ? 1 : -1;
      const current = activeRef.current;

      if (chapterType[current] === 'step') {
        if (isChapterBusy(current)) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        const next = current + direction;
        if (next < 0 || next >= TOTAL_CHAPTERS) return;
        navigateTo(next);
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, reducedMotion ? 100 : WHEEL_COOLDOWN_MS);
        return;
      }

      if (isChapterBusy(current)) return;
      accumulatedRef.current = Math.max(0, accumulatedRef.current + e.deltaY * 0.62);
      const raw = accumulatedRef.current / 2100;
      if (raw >= 0.92 && direction > 0 && current < TOTAL_CHAPTERS - 1) {
        navigateTo(current + 1);
      } else if (accumulatedRef.current <= 20 && direction < 0 && current > 0) {
        navigateTo(current - 1);
        accumulatedRef.current = 1950;
        targetRef.current = 0.93;
      } else {
        if (reducedMotion) {
          setSmoothProgress(Math.min(0.999, raw));
        } else {
          targetRef.current = Math.min(0.999, raw);
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isDesktop, navigateTo, reducedMotion]);

  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e) => {
      if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(e.key)) return;
      e.preventDefault();
      const current = activeRef.current;
      const direction = e.key === 'ArrowDown' || e.key === 'PageDown' ? 1 : -1;
      if (chapterType[current] === 'step' && (!completedRef.current[current] || holdsRef.current[current])) return;
      navigateTo(Math.max(0, Math.min(TOTAL_CHAPTERS - 1, current + direction)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDesktop, navigateTo]);

  return { activeChapter, step, smoothProgress, isDesktop, reducedMotion, activeSectionId: sectionIds[activeChapter], navigateTo, setChapterHold };
}
