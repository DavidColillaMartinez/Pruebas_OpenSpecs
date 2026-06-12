import { useId } from 'react';

export function AnimatedLogoMark({ className = '' }) {
  const clipId = useId().replace(/:/g, '');
  const thinFilterId = `${clipId}-logo-thin`;

  return (
    <span className={`animated-logo inline-block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 306"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-logo-svg h-full w-full overflow-visible"
        role="img"
      >
        <defs>
          <filter id={thinFilterId} x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="erode" radius="0.75" result="thinAlpha" />
            <feComposite in="SourceGraphic" in2="thinAlpha" operator="in" />
          </filter>
        </defs>

        <g className="logo-gold-line">
          <rect x="98" y="233" width="304" height="6" rx="1.5" fill="#c1aa67" />
        </g>

        <g className="logo-outer" filter={`url(#${thinFilterId})`}>
          <path d="M250 53 L350 252 L329 252 L250 96 L171 252 L150 252 Z" fill="#050505" />
        </g>

        <g className="logo-inner" filter={`url(#${thinFilterId})`}>
          <path d="M250 143 L250 180 L246 190 L236 210 L226 230 L216 250 L206 270 L196 291 H132 L141 273 H186 L197 250 L207 230 L217 210 L227 190 Z" fill="#050505" />
          <path d="M250 143 L273 190 L283 210 L293 230 L303 250 L313 270 L324 291 H368 L359 273 H304 L294 270 L284 250 L274 230 L264 210 L254 190 L250 180 Z" fill="#050505" />
        </g>
      </svg>
    </span>
  );
}
