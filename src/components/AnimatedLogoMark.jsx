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
            d="M132 291 L197 291 L250 144 L303 291 L368 291 L360 273 L316 273 L250 95 L184 273 L140 273 Z"
            fill="#050505"
          />
        </g>
      </svg>
    </span>
  );
}
