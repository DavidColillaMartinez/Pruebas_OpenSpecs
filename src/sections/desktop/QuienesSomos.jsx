import { aboutBlocks } from '../../data/aboutContent';

// Cascada coreografiada como Coleccion: cada paso trae un elemento desde un lado.
// paso 1 texto 1 (desde arriba) · paso 2 imagen 1 (desde arriba) ·
// paso 3 imagen 2 desde la izquierda + texto 2 desde la derecha ·
// paso 4 texto 3 (desde abajo) · paso 5 imagen 3 (desde abajo, desfasada).
const TEXT_STEPS = [1, 3, 4];
const IMAGE_STEPS = [2, 3, 5];
const TEXT_HIDDEN = ['-translate-y-8', 'translate-x-8', 'translate-y-8'];
const IMAGE_HIDDEN = ['-translate-y-8', '-translate-x-8', 'translate-y-8'];

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
            const flipped = index === 1;
            const textVisible = s >= TEXT_STEPS[index];
            const imageVisible = s >= IMAGE_STEPS[index];
            return (
              <div key={block.title} className="grid items-center gap-7 lg:grid-cols-[1fr_0.8fr]">
                <div className={`border-l-2 border-clay/25 pl-5 transition-all duration-500 ease-out ${textVisible ? 'translate-x-0 translate-y-0 opacity-100 blur-0' : `opacity-0 ${TEXT_HIDDEN[index]} blur-[2px]`} ${flipped ? 'lg:border-l-0 lg:border-r-2 lg:pr-5 lg:text-right lg:pl-5' : ''}`}>
                  <p className="text-sm font-semibold text-clay">{block.label}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{block.title}</h3>
                  <p className="mt-3 text-base leading-7 text-ink/68">{block.copy}</p>
                </div>
                <img
                  src={block.image}
                  alt={block.imageAlt}
                  loading="lazy"
                  style={index === 2 ? { transitionDelay: imageVisible ? '180ms' : '0ms' } : undefined}
                  className={`h-32 w-full rounded-[1.4rem] object-cover transition-all duration-500 ease-out sm:h-36 lg:h-40 ${imageVisible ? 'translate-x-0 translate-y-0 opacity-100 blur-0' : `opacity-0 ${IMAGE_HIDDEN[index]} blur-[2px]`} ${flipped ? 'lg:order-1' : ''}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
