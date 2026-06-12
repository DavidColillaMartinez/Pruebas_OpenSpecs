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
            d="M250 53 L350 252 L329 252 L250 95 L171 252 L150 252 Z"
            fill="#050505"
          />
        </g>

        <g className="logo-middle">
          <path
            d="M250 143 L318 291 L296 291 L250 184 L204 291 L182 291 Z"
            fill="#050505"
          />
        </g>

        <g className="logo-inner">
          <path
            d="M250 184 L302 291 L282 291 L250 222 L218 291 L198 291 Z"
            fill="#050505"
          />
        </g>

        <g className="logo-feet">
          <path d="M140 253 H198 L184 291 H132 Z" fill="#050505" />
          <path d="M302 253 H360 L368 291 H316 Z" fill="#050505" />
        </g>
      </svg>
    </span>
  );
}
