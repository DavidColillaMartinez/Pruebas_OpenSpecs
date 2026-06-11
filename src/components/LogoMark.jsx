export function LogoMark({ className = '', minimal = false }) {
  if (minimal) {
    return (
      <span className={`inline-block ${className}`} aria-hidden="true">
        <img src="/logopng.png" alt="" className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span className={`inline-grid place-items-center overflow-hidden rounded-full border border-clay/25 bg-white shadow-lift ${className}`} aria-hidden="true">
      <img src="/logo-area-lrmq.jpeg" alt="" className="h-full w-full scale-[1.35] object-contain" />
    </span>
  );
}
