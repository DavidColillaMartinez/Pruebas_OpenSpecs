import { PHONE, PHONE_INTL, INSTAGRAM_URL, MAPS_URL } from '../data/business';
import { ContactIcon } from './ContactIcon';

const iconBoxMinimal = 'inline-grid h-7 w-7 place-items-center text-current';

export function ContactLinks() {
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
