import { aboutBlocks } from '../../data/aboutContent';

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
          <h2 className="font-display text-4xl leading-[0.96] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Qué hay detrás de cada baño.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/74 sm:text-lg sm:leading-8">Un estudio que mide, compone y prepara antes de instalar.</p>
        </div>
        <div className="space-y-7">
          {aboutBlocks.map((block, index) => {
            const row = ROWS[index];
            const visible = s >= ROW_STEPS[index];
            const image = (
              <img
                src={block.image}
                alt={block.imageAlt}
                loading="lazy"
                className={`h-32 w-full rounded-[1.4rem] object-cover transition-all duration-500 ease-out sm:h-36 lg:h-40 ${visible ? 'translate-x-0 translate-y-0 opacity-100 blur-0' : `opacity-0 ${row.imageHidden ?? row.hidden} blur-[2px]`} ${row.imageFirst ? 'lg:order-1' : 'lg:order-2'}`}
              />
            );
            const text = (
              <div className={`border-l-2 border-clay/25 pl-5 transition-all duration-500 ease-out ${row.imageFirst ? 'lg:order-2' : 'lg:order-1'} ${visible ? 'translate-x-0 translate-y-0 opacity-100 blur-0' : `opacity-0 ${row.textHidden ?? row.hidden} blur-[2px]`}`}>
                <p className="text-sm font-semibold text-clay">{block.label}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{block.title}</h3>
                <p className="mt-3 text-base leading-7 text-ink/68">{block.copy}</p>
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
