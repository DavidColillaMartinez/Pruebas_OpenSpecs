export function MobileSectionShell({ id, label, titleId, children, ariaLabel }) {
  return (
    <section id={id} aria-labelledby={titleId} aria-label={ariaLabel} className="px-5 py-20 sm:px-8 sm:py-24">
      {label && <p className="mx-auto max-w-2xl text-xs font-semibold uppercase tracking-[0.22em] text-clay">{label}</p>}
      <div className="mx-auto max-w-2xl pt-3">{children}</div>
    </section>
  );
}
