import { aboutBlocks } from '../../data/aboutContent';

// Revelado por pasos igual que Coleccion: s>=1..3 activan los tres bloques.
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
            const visible = s >= index + 1;
            const flipped = index === 1;
            return (
              <div
                key={block.title}
                className={`grid items-center gap-7 lg:grid-cols-[1fr_0.8fr] transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[2px]'}`}
              >
                <div className={`border-l-2 border-clay/25 pl-5 ${flipped ? 'lg:order-2 lg:border-l-0 lg:border-r-2 lg:pl-5 lg:pr-5 lg:text-right' : ''}`}>
                  <p className="text-sm font-semibold text-clay">{block.label}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{block.title}</h3>
                  <p className="mt-3 text-base leading-7 text-ink/68">{block.copy}</p>
                </div>
                <img src={block.image} alt={block.imageAlt} loading="lazy" className={`h-32 w-full rounded-[1.4rem] object-cover sm:h-36 lg:h-40 ${flipped ? 'lg:order-1' : ''}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
