import { googleReviews } from '../../data/reviewsContent';
import { MobileSectionShell } from '../../components/MobileSectionShell';

function StarRow({ rating }) {
  return (
    <span role="img" aria-label={`${rating} de 5 estrellas`} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <svg key={value} viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill={value <= rating ? '#c1aa67' : 'none'} stroke={value <= rating ? '#c1aa67' : 'rgba(5,5,5,0.25)'} strokeWidth="1.5">
          <path d="M10 1.8l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export function MobileOpiniones() {
  return (
    <MobileSectionShell id="opiniones" titleId="mobile-opiniones-title" ariaLabel="Opiniones" className="py-14 sm:py-16">
      <h2 id="mobile-opiniones-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Juzga tú mismo.</h2>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-clay">Reseñas de Google</p>
      {googleReviews.length === 0 ? (
        <p className="mt-6 max-w-xl text-base leading-7 text-ink/68">Pronto mostraremos aquí las reseñas verificadas de Google.</p>
      ) : (
        <ul className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
          {googleReviews.map((review, index) => (
            <li key={`${review.author}-${index}`} className="w-[85%] max-w-sm shrink-0 snap-center rounded-[1.4rem] border border-ink/8 bg-white/85 px-5 py-6 shadow-soft">
              <StarRow rating={review.rating} />
              {review.text ? (
                <blockquote className="mt-4 max-h-56 overflow-y-auto text-base leading-7 text-ink/78">«{review.text}»</blockquote>
              ) : (
                <p className="mt-4 text-base leading-7 text-ink/45">Reseña sin comentario de texto.</p>
              )}
              <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                {review.image ? <img src={review.image} alt="" aria-hidden="true" loading="lazy" className="h-8 w-8 rounded-full border border-ink/10 object-cover" /> : null}
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">{review.author}</span>
                {review.date ? <span className="text-xs uppercase tracking-[0.14em] text-ink/40">{review.date}</span> : null}
              </figcaption>
              <a href={review.googleUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-clay underline-offset-4 hover:underline">Ver en Google</a>
            </li>
          ))}
        </ul>
      )}
    </MobileSectionShell>
  );
}
