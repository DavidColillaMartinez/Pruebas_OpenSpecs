import { useState } from 'react';
import { LogoMark } from '../../components/LogoMark';
import { MobileSectionShell } from '../../components/MobileSectionShell';
import { ContactLinks } from '../../components/ContactLinks';
import { ContactForm } from '../../components/ContactForm';
import { ADDRESS, PHONE, PHONE_INTL, MAPS_URL, INSTAGRAM_URL } from '../../data/business';

export function MobileContacto({ cardless }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });

  if (!cardless) {
    return (
      <section id="contacto" aria-labelledby="mobile-contacto-title" className="bg-transparent px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <h2 id="mobile-contacto-title" className="font-display text-3xl leading-[1.05] tracking-[0.035em] text-ink sm:text-4xl text-wrap-balance">Hablemos de tu baño.</h2>
          <p className="mt-3 text-base leading-7 text-ink/72">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
          <div className="mt-6 rounded-[2rem] border border-ink/6 bg-ink p-5 text-white shadow-lift">
            <LogoMark className="mb-5 h-14 w-14" />
            <p className="font-display text-2xl leading-tight">AREA LRMQ Tienda</p>
            <p className="mt-2 text-white/65 text-sm">{ADDRESS}</p>
          </div>
          <div className="mt-4 space-y-3">
            <a href={`https://wa.me/${PHONE_INTL}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-xs font-bold text-[#25D366]">WA</span><span className="font-semibold">WhatsApp {PHONE}</span></a>
            <a href={`tel:+34${PHONE}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-ink/8 text-xs font-bold tracking-[0.08em]">TEL</span><span className="font-semibold">Llamar {PHONE}</span></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-clay/12 text-xs font-bold text-clay">IG</span><span className="font-semibold">Instagram</span></a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[2rem] border border-ink/8 bg-white/78 shadow-soft transition hover:-translate-y-0.5">
              <div className="grid h-28 place-items-center bg-brand-map text-center text-sm font-semibold text-ink/75">Ver ubicación</div>
            </a>
          </div>
          <form className="mt-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Nombre" aria-label="Nombre" className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <input type="tel" placeholder="Teléfono" aria-label="Teléfono" className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <textarea placeholder="Medidas, estilo y plazo..." aria-label="Medidas, estilo y plazo" rows={2} className="w-full resize-none rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <a href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero información sobre una reforma.')}`} target="_blank" rel="noopener noreferrer" className="block rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar por WhatsApp</a>
          </form>
        </div>
      </section>
    );
  }
  return (
    <MobileSectionShell id="contacto" titleId="mobile-contacto-title" ariaLabel="Contacto" className="py-20 sm:py-24">
      <h2 id="mobile-contacto-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Hablemos de tu baño.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
      <div className="mt-8 border-l-2 border-clay/30 pl-5">
        <LogoMark className="mb-5 h-16 w-16" minimal />
        <p className="font-display text-2xl leading-tight text-ink sm:text-3xl">AREA LRMQ Tienda</p>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-ink/70 underline-offset-2 hover:underline sm:text-base">{ADDRESS}</a>
      </div>
      <ul className="mt-6 space-y-1 border-l-2 border-clay/15 pl-5">
        <li>
          <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366]/15 text-[10px] font-bold tracking-[0.08em] text-[#25D366]">WA</span>
            <span className="font-semibold">WhatsApp {PHONE}</span>
          </a>
        </li>
        <li>
          <a href={`tel:+34${PHONE}`} className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-[10px] font-bold tracking-[0.08em] text-ink/70">TEL</span>
            <span className="font-semibold">Llamar {PHONE}</span>
          </a>
        </li>
        <li>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-clay/12 text-[10px] font-bold text-clay">IG</span>
            <span className="font-semibold">Instagram</span>
          </a>
        </li>
        <li>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-[10px] font-bold text-ink/70">MAP</span>
            <span className="font-semibold">Ver ubicación</span>
          </a>
        </li>
      </ul>
      <ContactForm form={form} setForm={setForm} minimal />
    </MobileSectionShell>
  );
}
