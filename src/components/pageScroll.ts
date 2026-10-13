// Narrow layouts have a genuine scrollport above the tools, not an overlay
// over the document. Desktop retains native window scrolling.
export function pageScrollport(): HTMLElement | null {
  const main = document.querySelector<HTMLElement>('main');
  if (!main) return null;
  return window.innerWidth < 1024 || (main.id === 'contenido' && getComputedStyle(main).overflowY === 'auto') ? main : null;
}

export function pageScrollY(): number {
  return pageScrollport()?.scrollTop ?? window.scrollY;
}

export function scrollPageTo(options: ScrollToOptions): void {
  const port = pageScrollport();
  if (port) port.scrollTo(options);
  else window.scrollTo(options);
}
