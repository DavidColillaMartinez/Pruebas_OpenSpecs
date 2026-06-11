import { PHONE_INTL } from '../data/business';

export function ContactForm({ form, setForm, minimal = false }) {
  const whatsappText = encodeURIComponent(`Hola AREA LRMQ, quiero información sobre una reforma. Nombre: ${form.nombre}. Teléfono: ${form.telefono}. Mensaje: ${form.mensaje}`);

  if (minimal) {
    return (
      <form className="mt-10 space-y-5 border-l-2 border-clay/15 pl-5" onSubmit={(e) => e.preventDefault()}>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Nombre</span>
          <input type="text" required aria-label="Nombre" aria-required="true" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-2 w-full border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Teléfono</span>
          <input type="tel" required aria-label="Teléfono" aria-required="true" placeholder="6XX XX XX XX" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="mt-2 w-full border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Mensaje</span>
          <textarea required aria-label="Mensaje" aria-required="true" placeholder="Medidas, estilo y plazo..." rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="mt-2 w-full resize-none border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <a href={`https://wa.me/${PHONE_INTL}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Enviar por WhatsApp</a>
      </form>
    );
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
      <input type="text" placeholder="Nombre" aria-label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
      <input type="tel" placeholder="Teléfono" aria-label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
      <textarea placeholder="Medidas, estilo y plazo..." aria-label="Medidas, estilo y plazo" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} rows={3} className="w-full resize-none rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
      <a href={`https://wa.me/${PHONE_INTL}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="block rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar por WhatsApp</a>
    </form>
  );
}
