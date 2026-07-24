import { useState } from 'react';
import { LogoMark } from '../../components/LogoMark';
import { ContactLinks } from '../../components/ContactLinks';
import { ContactForm } from '../../components/ContactForm';
import { ADDRESS } from '../../data/business';

export function Contacto({ step, isActive }) {
  const s = isActive ? step : 0;
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h2 className="font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Hablemos de tu baño.</h2>
          <p className="mt-4 text-lg leading-8 text-ink/72">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
            <ContactForm form={form} setForm={setForm} />
        </div>
        <div className={`space-y-10 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          <div>
            <LogoMark className="mb-6 h-[7.5rem] w-[7.5rem]" minimal />
            <p className="font-display text-3xl leading-tight text-ink">AREA LRMQ Tienda</p>
            <p className="mt-3 text-ink/65">{ADDRESS}</p>
          </div>
          <ContactLinks />
        </div>
      </div>
    </div>
  );
}
