import { useId } from 'react';

export function AnimatedLogoMark({ className = '' }) {
  const clipId = useId().replace(/:/g, '');
  const outerClipId = `${clipId}-logo-outer`;
  const innerClipId = `${clipId}-logo-inner`;
  const lineClipId = `${clipId}-logo-line`;

  return (
    <span className={`animated-logo inline-block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 306"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-logo-svg h-full w-full overflow-visible"
        role="img"
      >
        <defs>
          <clipPath id={outerClipId}>
            <path d="M250 53 L350 252 L329 252 L250 96 L171 252 L150 252 Z" />
          </clipPath>
          <clipPath id={innerClipId}>
            <path d="M250 143 L250 180 L246 190 L236 210 L226 230 L216 250 L206 270 L196 291 H132 L141 273 H186 L197 250 L207 230 L217 210 L227 190 Z" />
            <path d="M250 143 L273 190 L283 210 L293 230 L303 250 L313 270 L324 291 H368 L359 273 H304 L294 270 L284 250 L274 230 L264 210 L254 190 L250 180 Z" />
          </clipPath>
          <clipPath id={lineClipId}>
            <rect x="98" y="232" width="304" height="8" rx="1.5" />
          </clipPath>
        </defs>

        <g className="logo-gold-line">
          <image href="/logopng.png" width="500" height="306" preserveAspectRatio="none" clipPath={`url(#${lineClipId})`} />
        </g>

        <g className="logo-outer" clipPath={`url(#${outerClipId})`}>
          <image href="/logopng.png" width="500" height="306" preserveAspectRatio="none" />
        </g>

        <g className="logo-inner" clipPath={`url(#${innerClipId})`}>
          <image href="/logopng.png" width="500" height="306" preserveAspectRatio="none" />
        </g>

        <image className="logo-exact-finish" href="/logopng.png" width="500" height="306" preserveAspectRatio="none" />
      </svg>
    </span>
  );
}
