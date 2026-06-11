export function GoldLabel({ number, text, className = '' }) {
  return (
    <p className={`flex items-start gap-3 ${className}`}>
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{number}</span>
      <span className="text-ink/72">{text}</span>
    </p>
  );
}
