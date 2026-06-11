import { useCallback, useEffect, useRef, useState } from 'react';
import { sectionIds, chapterSteps, chapterType, TOTAL_CHAPTERS, DESKTOP_MIN_WIDTH, DESKTOP_MIN_HEIGHT } from '../data/copy';

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
  const blockedRef = useRef(false);
  const cooldownRef = useRef(false);
  const accumulatedRef = useRef(0);
  const targetRef = useRef(0);

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

  const setBlocked = useCallback((value) => { blockedRef.current = value; }, []);

  const navigateTo = useCallback((index, startStep = 0) => {
    if (index < 0 || index >= TOTAL_CHAPTERS) return;
    activeRef.current = index;
    stepRef.current = startStep;
    accumulatedRef.current = 0;
    targetRef.current = 0;
    setActiveChapter(index);
    setStep(startStep);
    setSmoothProgress(0);
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
    if (!isDesktop) return;
    const onWheel = (e) => {
      if (blockedRef.current || cooldownRef.current) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      const current = activeRef.current;

      if (chapterType[current] === 'step') {
        const nextStep = stepRef.current + direction;
        if (nextStep < 0 && current > 0) {
          navigateTo(current - 1, chapterSteps[current - 1]);
        } else if (nextStep > chapterSteps[current] && current < TOTAL_CHAPTERS - 1) {
          navigateTo(current + 1, 0);
        } else if (nextStep >= 0 && nextStep <= chapterSteps[current]) {
          stepRef.current = nextStep;
          setStep(nextStep);
          cooldownRef.current = true;
          setTimeout(() => { cooldownRef.current = false; }, reducedMotion ? 100 : 420);
        }
        return;
      }

      accumulatedRef.current = Math.max(0, accumulatedRef.current + e.deltaY * 0.62);
      const raw = accumulatedRef.current / 2100;
      if (raw >= 0.92 && direction > 0 && current < TOTAL_CHAPTERS - 1) {
        navigateTo(current + 1, 0);
      } else if (accumulatedRef.current <= 20 && direction < 0 && current > 0) {
        navigateTo(current - 1, chapterSteps[current - 1]);
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
      if (blockedRef.current) { blockedRef.current = false; return; }
      if (chapterType[current] === 'continuous') {
        navigateTo(Math.max(0, Math.min(TOTAL_CHAPTERS - 1, current + direction)));
        return;
      }
      const nextStep = stepRef.current + direction;
      if (nextStep < 0 && current > 0) navigateTo(current - 1, chapterSteps[current - 1]);
      else if (nextStep > chapterSteps[current] && current < TOTAL_CHAPTERS - 1) navigateTo(current + 1);
      else if (nextStep >= 0 && nextStep <= chapterSteps[current]) { stepRef.current = nextStep; setStep(nextStep); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDesktop, navigateTo]);

  return { activeChapter, step, smoothProgress, setBlocked, isDesktop, reducedMotion, activeSectionId: sectionIds[activeChapter], navigateTo };
}
