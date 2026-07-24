import { PHONE, PHONE_INTL, ADDRESS, INSTAGRAM_URL, MAPS_URL } from '../data/business';
import { ContactIcon } from './ContactIcon';

const iconBoxMinimal = 'inline-grid h-7 w-7 place-items-center text-current';
const iconBoxCarded = 'grid h-10 w-10 place-items-center rounded-full';

export function ContactLinks({ minimal = false }) {
  if (minimal) {
    return (
      <>
        <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-3 text-ink transition hover:opacity-70">
          <span className={iconBoxMinimal}><ContactIcon channel="whatsapp" className="text-[#25D366] h-full w-full" /></span>
          <span className="font-semibold">WhatsApp {PHONE}</span>
        </a>
        <a href={`tel:+34${PHONE}`} className="group flex items-center gap-4 py-3 text-ink transition hover:opacity-70">
          <span className={iconBoxMinimal}><ContactIcon channel="phone" className="text-ink/55 h-full w-full" /></span>
          <span className="font-semibold">Llamar {PHONE}</span>
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-3 text-ink transition hover:opacity-70">
          <span className={iconBoxMinimal}><ContactIcon channel="instagram" className="text-clay h-full w-full" /></span>
          <span className="font-semibold">Instagram</span>
        </a>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-3 text-ink transition hover:opacity-70">
          <span className={iconBoxMinimal}><ContactIcon channel="map" className="text-ink/55 h-full w-full" /></span>
          <span className="font-semibold">Ver ubicación</span>
        </a>
      </>
    );
  }
  return (
    <>
      <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5">
        <span className={`${iconBoxCarded} bg-[#25D366]/15 text-[#25D366]`}><ContactIcon channel="whatsapp" className="h-6 w-6" /></span>
        <span className="font-semibold">WhatsApp {PHONE}</span>
      </a>
      <a href={`tel:+34${PHONE}`} className="group flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5">
        <span className={`${iconBoxCarded} bg-ink/8 text-ink/65`}><ContactIcon channel="phone" className="h-6 w-6" /></span>
        <span className="font-semibold">Llamar {PHONE}</span>
      </a>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5">
        <span className={`${iconBoxCarded} bg-clay/12 text-clay`}><ContactIcon channel="instagram" className="h-6 w-6" /></span>
        <span className="font-semibold">Instagram</span>
      </a>
      <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[2rem] border border-ink/8 bg-white/78 shadow-soft transition hover:-translate-y-0.5">
        <div className="grid h-32 place-items-center bg-brand-map text-center text-sm font-semibold text-ink/75">Ver ubicación</div>
      </a>
    </>
  );
}
