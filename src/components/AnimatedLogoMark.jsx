import { useEffect, useId, useRef } from 'react';

// Geometry extracted from public/logopng.png (500x306) via scanline measurement:
// every edge is a straight segment with slope |dx/dy| = 0.5 (legs) or horizontal.
// Baseline: the full mark drew in LOGO_DRAW_MS at 100% speed.
export const LOGO_DRAW_MS = 2500;
export const LOGO_BASE_DELAY_MS = 250;
export const LOGO_LETTER_SPEED = 0.4;

// Both A letters draw at the same time from opposite ends:
//   outer A: left foot -> apex -> right foot
//   inner A: right toe -> apex -> left toe
// Within a letter the reveal front is continuous: each stroke starts exactly on
// the perpendicular where the previous one ended, so no stroke restarts at a
// vertex. The gold bar then sweeps left -> right after the last letter stroke.
export const WIPE_STROKES = [
  { chain: 'outer', from: [151, 251.5], to: [250, 53.5], axisLength: 221.4, transform: 'translate(151 251.5) rotate(-63.435)', y: -1.5, height: 21 },
  { chain: 'outer', from: [250, 53.5], to: [349, 251.5], axisLength: 221.4, transform: 'translate(250 53.5) rotate(63.435)', y: -1.5, height: 21 },
  { chain: 'inner', from: [368, 290.5], to: [250, 142.5], axisLength: 185.2, transform: 'translate(368 290.5) rotate(-116.565)', y: -59.5, height: 61 },
  { chain: 'inner', from: [250, 142.5], to: [132, 290.5], axisLength: 185.2, transform: 'translate(250 142.5) rotate(116.565)', y: -19.8, height: 61 },
  { chain: 'gold', from: [98.5, 236], to: [400.5, 236], axisLength: 302 },
];

export function logoWipeTimings() {
  const totalLength = WIPE_STROKES.reduce((sum, stroke) => sum + stroke.axisLength, 0);
  const baseUnitMs = LOGO_DRAW_MS / totalLength;
  const letterUnitMs = baseUnitMs / LOGO_LETTER_SPEED;
  const next = { outer: LOGO_BASE_DELAY_MS, inner: LOGO_BASE_DELAY_MS };
  return WIPE_STROKES.map((stroke) => {
    const delay = stroke.chain === 'gold' ? Math.max(next.outer, next.inner) : next[stroke.chain];
    const duration = Math.round(stroke.axisLength * (stroke.chain === 'gold' ? baseUnitMs : letterUnitMs));
    if (stroke.chain !== 'gold') next[stroke.chain] = delay + duration;
    return { delay, duration };
  });
}

function wipeStyle({ delay, duration }) {
  return { '--logo-wipe-delay': `${delay}ms`, '--logo-wipe-duration': `${duration}ms` };
}

export function AnimatedLogoMark({ className = '', onAnimationEnd }) {
  const uid = useId().replace(/:/g, '');
  const outerMaskId = `${uid}-logo-outer-mask`;
  const innerMaskId = `${uid}-logo-inner-mask`;
  const timings = logoWipeTimings();
  const callbackRef = useRef(onAnimationEnd);
  callbackRef.current = onAnimationEnd;
  useEffect(() => {
    const finish = () => callbackRef.current?.();
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const id = window.setTimeout(finish, 0);
      return () => window.clearTimeout(id);
    }
    const currentTimings = logoWipeTimings();
    const total = Math.max(...currentTimings.map(({ delay, duration }) => delay + duration));
    const id = window.setTimeout(finish, total + 50);
    return () => window.clearTimeout(id);
  }, []);
  const wipeRect = (stroke, index) => (
    <g key={`${stroke.from.join('-')}-${index}`} transform={stroke.transform}>
      <rect className="logo-wipe-rect" fill="white" x="0" y={stroke.y} width={stroke.axisLength + 0.1} height={stroke.height} style={wipeStyle(timings[index])} />
    </g>
  );

  return (
    <span className={`animated-logo inline-block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 306"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-logo-svg h-full w-full"
        role="img"
      >
        <defs>
          <mask id={outerMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="306">
            <rect width="500" height="306" fill="black" />
            {WIPE_STROKES.slice(0, 2).map((stroke, index) => wipeRect(stroke, index))}
          </mask>
          <mask id={innerMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="306">
            <rect width="500" height="306" fill="black" />
            {WIPE_STROKES.slice(2, 4).map((stroke, index) => wipeRect(stroke, index + 2))}
          </mask>
        </defs>

        <rect className="logo-gold-bar" x="98.5" y="232.5" width="302" height="7" fill="#c1aa67" style={wipeStyle(timings[4])} />
        <path d="M250 53.5 L349 251.5 L329 251.5 L250 93.5 L171 251.5 L151 251.5 Z" fill="#050505" mask={`url(#${outerMaskId})`} />
        <path d="M250 142.5 L185.5 271.5 L141.5 271.5 L132 290.5 L196.5 290.5 L250 182.5 L303.5 290.5 L368 290.5 L358.5 271.5 L314.5 271.5 Z" fill="#050505" mask={`url(#${innerMaskId})`} />
      </svg>
    </span>
  );
}
