import { PHONE, PHONE_INTL, ADDRESS, INSTAGRAM_URL, MAPS_URL } from '../data/business';

export function ContactLinks({ minimal = false }) {
  if (minimal) {
    return (
      <>
        <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 text-ink transition hover:opacity-70"><span className="text-[#25D366] text-sm font-bold">WA</span><span className="font-semibold">WhatsApp {PHONE}</span></a>
        <a href={`tel:+34${PHONE}`} className="flex items-center gap-4 py-3 text-ink transition hover:opacity-70"><span className="text-xs font-bold text-ink/50 tracking-[0.08em]">TEL</span><span className="font-semibold">Llamar {PHONE}</span></a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 text-ink transition hover:opacity-70"><span className="text-sm font-bold text-clay">IG</span><span className="font-semibold">Instagram</span></a>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block py-3 text-ink transition hover:opacity-70"><span className="font-semibold">Ver ubicación</span></a>
      </>
    );
  }
  return (
    <>
      <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">WA</span><span className="font-semibold">WhatsApp {PHONE}</span></a>
      <a href={`tel:+34${PHONE}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-ink/8 text-xs font-bold tracking-[0.08em]">TEL</span><span className="font-semibold">Llamar {PHONE}</span></a>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-clay/12 text-clay">IG</span><span className="font-semibold">Instagram</span></a>
      <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[2rem] border border-ink/8 bg-white/78 shadow-soft transition hover:-translate-y-0.5">
        <div className="grid h-32 place-items-center bg-[linear-gradient(135deg,#d8d0c2,#f8f6f1_45%,#b98364_160%)] text-center text-sm font-semibold text-ink/75">Ver ubicación</div>
      </a>
    </>
  );
}
