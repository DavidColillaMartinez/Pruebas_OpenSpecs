export function AnimatedLogoMark({ className = '' }) {
  return (
    <span
      className={`animated-logo inline-grid place-items-center overflow-hidden rounded-full border border-clay/25 bg-white shadow-lift ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 220"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-logo-svg h-full w-full"
        role="img"
      >
        {/* Outer A: descends from the top vertex.
            The clip-path animation opens the top of the artwork downward. */}
        <g className="logo-outer">
          <path
            d="M100 28
               L42 188
               L62 188
               L72 162
               L128 162
               L138 188
               L158 188
               Z"
            fill="#151515"
          />
        </g>

        {/* Inner A: rises from the bottom vertex.
            The clip-path animation opens the bottom of the artwork upward. */}
        <g className="logo-inner">
          <path
            d="M100 70
               L70 148
               L84 148
               L100 108
               L116 148
               L130 148
               Z"
            fill="#151515"
          />
        </g>

        {/* Gold horizontal line: sweeps in from the centre outward. */}
        <g className="logo-gold-line">
          <rect x="40" y="158" width="120" height="3" fill="#b98364" />
        </g>

        {/* Lower feet: appear at the very end. */}
        <g className="logo-feet">
          <rect x="32" y="188" width="136" height="6" fill="#151515" />
        </g>
      </svg>
    </span>
  );
}
