import { aboutBlocks } from '../../data/aboutContent';
import { ResponsivePhoto } from '../../components/ResponsivePhoto';

// 3 pasos: cada paso revela una fila completa con texto e imagen simultáneos.
// Estudio (imagen izquierda + texto derecha): ambos desde arriba.
// Oficio (texto izquierda + imagen derecha): texto desde la derecha e imagen desde la izquierda.
// Método (imagen izquierda + texto derecha): ambos desde abajo.
const ROW_STEPS = [1, 2, 3];
const ROWS = [
  { imageFirst: true, hidden: '-translate-y-8' },
  { imageFirst: false, textHidden: 'translate-x-8', imageHidden: '-translate-x-8' },
  { imageFirst: true, hidden: 'translate-y-8' },
];

export function QuienesSomos({ step, isActive }) {
  const s = isActive ? step : 0;
  return (
    <div className="flex h-full items-center bg-transparent px-6 py-24 md:pb-8 md:pt-32">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          {/* Título largo aprobado por el propietario: ajuste local (tamaño,
              interlineado y anchura) sin tocar la escala global del capítulo. */}
          <h2 className="mx-auto max-w-3xl font-display text-3xl leading-[1.12] tracking-[0.035em] text-primary sm:text-4xl text-wrap-balance">Un equipo de profesionales con más de 20 años de experiencia en el sector de las reformas.</h2>
        </div>
        <div className="space-y-7">
          {aboutBlocks.map((block, index) => {
            const row = ROWS[index];
            const visible = s >= ROW_STEPS[index];
            const image = (
              <ResponsivePhoto
                photo={block.photo}
                alt={block.imageAlt}
                loading="lazy"
                decoding="async"
                className={`h-32 w-full rounded-[1.4rem] object-cover object-center transition-all duration-500 ease-out sm:h-36 lg:h-40 ${visible ? 'translate-x-0 translate-y-0 opacity-100 blur-0' : `opacity-0 ${row.imageHidden ?? row.hidden} blur-[2px]`} ${row.imageFirst ? 'lg:order-1' : 'lg:order-2'}`}
              />
            );
            const text = (
              <div className={`border-l-2 border-clay/25 pl-5 transition-all duration-500 ease-out ${row.imageFirst ? 'lg:order-2' : 'lg:order-1'} ${visible ? 'translate-x-0 translate-y-0 opacity-100 blur-0' : `opacity-0 ${row.textHidden ?? row.hidden} blur-[2px]`}`}>
                <p className="text-sm font-semibold text-clay">{block.label}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-primary sm:text-2xl">{block.title}</h3>
                <p className="mt-3 text-base leading-7 text-secondary/68">{block.copy}</p>
              </div>
            );
            return (
              <div key={block.title} className={`grid items-center gap-7 ${row.imageFirst ? 'lg:grid-cols-[0.8fr_1fr]' : 'lg:grid-cols-[1fr_0.8fr]'}`}>
                {image}
                {text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
