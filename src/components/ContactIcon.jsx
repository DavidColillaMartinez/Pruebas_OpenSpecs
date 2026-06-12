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
          <path className="icon-shape-bubble" d="M12 3.2a8.8 8.8 0 0 0-7.7 13.06L3.2 20.8l4.66-1.22A8.8 8.8 0 1 0 12 3.2Z" />
          <path className="icon-detail icon-shape-phone" d="M8.6 9.4c.5 1.6 1.6 2.7 2.6 3.6 1 .9 2.2 1.7 3.5 1.9.7.1 1 0 1.4-.4l.6-.7c.3-.3.3-.7 0-1l-1.3-1.3c-.3-.3-.7-.3-1 0l-.5.5c-.2.2-.5.3-.8.2-.8-.3-1.7-1-2.3-1.7-.5-.7-.9-1.4-1-2.1 0-.2 0-.5.2-.6l.5-.6c.3-.3.3-.7 0-1L9.1 4.9c-.3-.3-.7-.3-1 0l-.7.7c-.4.4-.5.7-.4 1.3.1.5.2 1 .4 1.5Z" />
        </svg>
      )}
      {channel === 'phone' && (
        <svg {...baseProps}>
          <path d="M5 4.5h3.2c.4 0 .7.2.8.6l1 2.7c.1.4 0 .8-.3 1L8 10.2a11 11 0 0 0 5.8 5.8l1.4-1.7c.2-.3.6-.4 1-.3l2.7 1c.4.1.6.4.6.8v3.2c0 .8-.6 1.4-1.4 1.4C9.6 20.4 3.6 14.4 3.6 6.4 3.6 5.6 4.2 5 5 5Z" />
        </svg>
      )}
      {channel === 'instagram' && (
        <svg {...baseProps}>
          <rect className="icon-shape-frame" x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle className="icon-shape-lens" cx="12" cy="12" r="3.6" />
          <circle cx="17.2" cy="6.8" r="0.7" fill="currentColor" stroke="none" />
          <rect className="icon-flash" x="0" y="0" width="24" height="24" fill="currentColor" stroke="none" />
        </svg>
      )}
      {channel === 'map' && (
        <svg {...baseProps}>
          <g className="icon-map-fold">
            <path d="M3.5 6.4l5.4-1.9 6.2 1.9 5.4-1.9v13.6l-5.4 1.9-6.2-1.9-5.4 1.9z" />
            <path d="M8.9 4.5v13.6" />
            <path d="M15.1 6.4v13.6" />
          </g>
          <g className="icon-pin">
            <path d="M17.2 9.5a2.6 2.6 0 0 0-5.2 0c0 1.9 2.6 4.5 2.6 4.5s2.6-2.6 2.6-4.5Z" />
            <circle cx="14.6" cy="9.4" r="1" fill="currentColor" stroke="none" />
          </g>
        </svg>
      )}
    </span>
  );
}
