export const navItems = [
  { label: 'Quiénes somos', href: '#quienes-somos' },
  { label: 'Servicios', href: '#coleccion' },
  { label: 'Reformas', href: '#reformas' },
  { label: 'Visión', href: '#vision' },
  { label: 'Opiniones', href: '#opiniones' },
  { label: 'Contacto', href: '#contacto' },
];

export const sectionIds = ['inicio', 'quienes-somos', 'coleccion', 'reformas', 'vision', 'opiniones', 'contacto'];
export const chapterSteps = [1, 3, 3, 0, 1, 2, 1];
export const chapterType = ['step', 'step', 'step', 'continuous', 'step', 'step', 'step'];
export const TOTAL_CHAPTERS = sectionIds.length;
export const DESKTOP_MIN_WIDTH = 1024;
// A laptop with wide viewport and short height still gets the desktop
// narrative; content compacts proportionally instead of falling back to the
// narrow layout.
export const DESKTOP_MIN_HEIGHT = 560;
export function isNarrativeViewport(width, height) {
  return width >= DESKTOP_MIN_WIDTH && height >= DESKTOP_MIN_HEIGHT;
}
export const chapterLabels = ['Inicio', 'Quiénes somos', 'Servicios', 'Reformas', 'Visión', 'Opiniones', 'Contacto'];
