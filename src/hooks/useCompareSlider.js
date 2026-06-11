import { useState, useRef, useEffect, useCallback } from 'react';

export function useCompareSlider() {
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const [sliderX, setSliderX] = useState(0.5);

  const setFromClientX = useCallback((clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    setSliderX(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    draggingRef.current = true;
    setFromClientX(e.clientX);
  }, [setFromClientX]);

  useEffect(() => {
    const move = (e) => { if (draggingRef.current) setFromClientX(e.clientX); };
    const up = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, [setFromClientX]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05));
    if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05));
  }, []);

  return { sliderRef, sliderX, onPointerDown, handleKeyDown };
}
