export function AnimatedLogoMark({ className = '' }) {
  return (
    <span className={`animated-logo inline-block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 306"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-logo-svg h-full w-full overflow-visible"
        role="img"
      >
        <image
          href="/logopng.png"
          width="500"
          height="306"
          preserveAspectRatio="none"
        />
      </svg>
    </span>
  );
}
