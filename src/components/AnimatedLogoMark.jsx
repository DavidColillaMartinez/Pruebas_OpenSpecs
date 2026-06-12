export function AnimatedLogoMark({ className = '' }) {
  return (
    <span className={`animated-logo inline-block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 299"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-logo-svg h-full w-full overflow-visible"
        role="img"
      >
        <g className="logo-gold-line">
          <rect x="98" y="232" width="304" height="8" rx="1.5" fill="#c1aa67" />
        </g>

        <g className="logo-outer">
          <path
            d="M250 53 L350 252 L329 252 L250 96 L171 252 L150 252 Z"
            fill="#050505"
          />
        </g>

        <g className="logo-inner">
          <path
            d="M145 291 L198 291 L250 132 L302 291 L355 291 L346 273 L315 273 L250 174 L185 273 L154 273 Z"
            fill="#050505"
          />
        </g>
      </svg>
    </span>
  );
}
