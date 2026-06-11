import { PHONE_INTL } from '../data/business';

export function ContactForm({ form, setForm, minimal = false }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = encodeURIComponent(`Hola AREA LRMQ, quiero información sobre una reforma. Nombre: ${form.nombre}. Teléfono: ${form.telefono}. Mensaje: ${form.mensaje}`);
    window.open(`https://wa.me/${PHONE_INTL}?text=${text}`, '_blank', 'noopener');
  };

  if (minimal) {
    return (
      <form className="mt-10 space-y-5 border-l-2 border-clay/15 pl-5" onSubmit={handleSubmit}>
        <label className="block" htmlFor="contact-name">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Nombre</span>
          <input id="contact-name" type="text" required aria-label="Nombre" aria-required="true" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-2 w-full border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <label className="block" htmlFor="contact-phone">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Teléfono</span>
          <input id="contact-phone" type="tel" required aria-label="Teléfono" aria-required="true" placeholder="6XX XX XX XX" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="mt-2 w-full border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <label className="block" htmlFor="contact-msg">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Mensaje</span>
          <textarea id="contact-msg" required aria-label="Mensaje" aria-required="true" placeholder="Medidas, estilo y plazo..." rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="mt-2 w-full resize-none border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <button type="submit" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Enviar por WhatsApp</button>
      </form>
    );
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <label className="block" htmlFor="contact-name-card">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Nombre</span>
        <input id="contact-name-card" type="text" required aria-label="Nombre" aria-required="true" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
      </label>
      <label className="block" htmlFor="contact-phone-card">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Teléfono</span>
        <input id="contact-phone-card" type="tel" required aria-label="Teléfono" aria-required="true" placeholder="6XX XX XX XX" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
      </label>
      <label className="block" htmlFor="contact-msg-card">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Mensaje</span>
        <textarea id="contact-msg-card" required aria-label="Mensaje" aria-required="true" placeholder="Medidas, estilo y plazo..." rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
      </label>
      <button type="submit" className="block w-full rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar por WhatsApp</button>
    </form>
  );
}
