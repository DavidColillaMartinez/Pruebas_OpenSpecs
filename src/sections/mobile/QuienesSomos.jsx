import { aboutBlocks } from '../../data/aboutContent';
import { MobileSectionShell } from '../../components/MobileSectionShell';

export function MobileQuienesSomos() {
  return (
  <MobileSectionShell id="quienes-somos" titleId="mobile-quienes-somos-title" ariaLabel="Quiénes somos" className="py-14 sm:py-16">
    <h2 id="mobile-quienes-somos-title" className="font-display text-3xl leading-[1.1] tracking-[0.035em] text-primary sm:text-4xl text-wrap-balance">Un equipo de profesionales con más de 20 años de experiencia en el sector de las reformas.</h2>
      <div className="mt-10 space-y-10">
        {aboutBlocks.map((block) => (
          <div key={block.title} className="border-l-2 border-clay/25 pl-5">
            <p className="text-sm font-semibold text-clay">{block.label}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-primary sm:text-2xl">{block.title}</h3>
            <p className="mt-3 text-base leading-7 text-secondary/68">{block.copy}</p>
            <img
              src={block.photo.mobile.src}
              srcSet={block.photo.mobile.srcSet}
              sizes={block.photo.mobile.sizes}
              alt={block.imageAlt}
              style={{ objectPosition: block.mobileObjectPosition ?? 'center' }}
              loading="lazy"
              decoding="async"
              className="mt-5 aspect-[16/10] w-full rounded-[1.4rem] object-cover"
            />
          </div>
        ))}
      </div>
    </MobileSectionShell>
  );
}
