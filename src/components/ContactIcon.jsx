const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  className: 'icon-shape block h-full w-full',
};

export function ContactIcon({ channel, className = '' }) {
  const wrapperClass = `contact-icon contact-icon--${channel} ${className}`;
  return (
    <span className={wrapperClass} aria-hidden="true">
      {channel === 'whatsapp' && (
        <svg {...baseProps}>
          <path d="M4 12a8 8 0 0 1 13.65-5.65A8 8 0 0 1 12 20a7.96 7.96 0 0 1-3.6-.86L4 20l.86-4.4A7.96 7.96 0 0 1 4 12z" />
          <path className="icon-detail" d="M9 9.5c0 3 2.5 5.5 5.5 5.5" />
          <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5" />
          <path d="M9 9.5h2l1 2-1.5 1.5" />
        </svg>
      )}
      {channel === 'phone' && (
        <svg {...baseProps}>
          <path className="icon-detail" d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
          <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      )}
      {channel === 'instagram' && (
        <svg {...baseProps}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
          <rect className="icon-flash" x="0" y="0" width="24" height="24" fill="currentColor" stroke="none" />
        </svg>
      )}
      {channel === 'map' && (
        <svg {...baseProps}>
          <g className="icon-map-fold">
            <path d="M3 6.5l6-2 6 2 6-2v15l-6 2-6-2-6 2z" />
            <path d="M9 4.5v15" />
            <path d="M15 6.5v15" />
          </g>
          <g className="icon-pin">
            <path d="M12 21s-5-4.5-5-9.5a5 5 0 0 1 10 0c0 5-5 9.5-5 9.5z" />
            <circle cx="12" cy="11.5" r="1.6" fill="currentColor" stroke="none" />
          </g>
        </svg>
      )}
    </span>
  );
}
