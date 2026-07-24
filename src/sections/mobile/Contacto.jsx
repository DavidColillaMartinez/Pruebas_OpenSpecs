import { useState } from 'react';
import { LogoMark } from '../../components/LogoMark';
import { MobileSectionShell } from '../../components/MobileSectionShell';
import { ContactForm } from '../../components/ContactForm';
import { ContactIcon } from '../../components/ContactIcon';
import { ADDRESS, PHONE, PHONE_INTL, MAPS_URL, INSTAGRAM_URL } from '../../data/business';

export function MobileContacto() {
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });

  return (
    <MobileSectionShell id="contacto" titleId="mobile-contacto-title" ariaLabel="Contacto" className="py-20 sm:py-24">
      <h2 id="mobile-contacto-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Hablemos de tu baño.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
      <div className="mt-10 border-l-2 border-clay/30 pl-5">
        <LogoMark className="mb-5 h-16 w-16" minimal />
        <p className="font-display text-2xl leading-tight text-ink sm:text-3xl">AREA LRMQ Tienda</p>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-ink/70 underline-offset-2 hover:underline sm:text-base">{ADDRESS}</a>
      </div>
      <ul className="mt-10 space-y-1 border-l-2 border-clay/15 pl-5">
        <li>
          <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="group flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]"><ContactIcon channel="whatsapp" className="h-5 w-5" /></span>
            <span className="font-semibold">WhatsApp {PHONE}</span>
          </a>
        </li>
        <li>
          <a href={`tel:+34${PHONE}`} className="group flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-ink/70"><ContactIcon channel="phone" className="h-5 w-5" /></span>
            <span className="font-semibold">Llamar {PHONE}</span>
          </a>
        </li>
        <li>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-clay/12 text-clay"><ContactIcon channel="instagram" className="h-5 w-5" /></span>
            <span className="font-semibold">Instagram</span>
          </a>
        </li>
        <li>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-ink/70"><ContactIcon channel="map" className="h-5 w-5" /></span>
            <span className="font-semibold">Ver ubicación</span>
          </a>
        </li>
      </ul>
      <ContactForm form={form} setForm={setForm} />
    </MobileSectionShell>
  );
}
