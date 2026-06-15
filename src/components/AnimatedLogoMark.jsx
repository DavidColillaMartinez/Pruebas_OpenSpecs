import { useId } from 'react';

export function AnimatedLogoMark({ className = '' }) {
  const uid = useId().replace(/:/g, '');
  const outerMaskId = `${uid}-logo-outer-mask`;
  const innerMaskId = `${uid}-logo-inner-mask`;

  return (
    <span className={`animated-logo inline-block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 306"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-logo-svg h-full w-full overflow-visible"
        role="img"
      >
        <defs>
          <mask id={outerMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="306">
            <rect width="500" height="306" fill="black" />
            <path
              className="logo-outer-draw"
              d="M150 252 L250 53 L350 252"
              fill="none"
              stroke="white"
              strokeWidth="140"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              pathLength="1"
            />
          </mask>
          <mask id={innerMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="306">
            <rect width="500" height="306" fill="black" />
            <path
              className="logo-inner-draw"
              d="M368 291 L304 291 L250 143 L196 291 L132 291"
              fill="none"
              stroke="white"
              strokeWidth="80"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              pathLength="1"
            />
          </mask>
        </defs>

        <g className="logo-gold-line">
          <rect x="98" y="232" width="304" height="8" rx="1.5" fill="#c1aa67" />
        </g>

        <g className="logo-outer" mask={`url(#${outerMaskId})`}>
          <path d="M250 53 L350 252 L329 252 L250 96 L171 252 L150 252 Z" fill="#050505" />
        </g>

        <g className="logo-inner" mask={`url(#${innerMaskId})`}>
          <path d="M250 143 L250 180 L246 190 L236 210 L226 230 L216 250 L206 270 L196 291 H132 L141 273 H186 L197 250 L207 230 L217 210 L227 190 Z" fill="#050505" />
          <path d="M250 143 L273 190 L283 210 L293 230 L303 250 L313 270 L324 291 H368 L359 273 H304 L294 270 L284 250 L274 230 L264 210 L254 190 L250 180 Z" fill="#050505" />
        </g>
      </svg>
    </span>
  );
}
