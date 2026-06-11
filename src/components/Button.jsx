export function Button({ as: Component = 'a', href, children, className = '', onClick, target, rel, ...props }) {
  return (
    <Component
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`min-h-[44px] rounded-full px-5 py-2.5 text-sm font-semibold shadow-lift transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
