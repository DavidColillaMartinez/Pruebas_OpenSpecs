import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CatalogApiError, createQuoteRequest } from '../../catalog/api/client';
import { getQuoteSelectionKey, useQuoteSelection } from '../model/selectionStore';
import { validateQuoteRequest } from '../model/payload';
import type { QuoteRequestPayload } from '../model/types';

const attributeLabels: Record<string, string> = {
  dimension: 'Medida',
  finish: 'Acabado',
  version: 'Versión',
  has_led: 'LED',
  lighting_type: 'Tipo de iluminación',
  lighting_technology: 'Tecnología LED',
  light_temp: 'Temperatura de luz',
  distribution: 'Distribución',
};

export function QuoteSelectionPage() {
  const { lines, updateQuantity, removeLine, clear } = useQuoteSelection();
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', message: '', consent: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const updateField = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;
    const payload: QuoteRequestPayload = {
      customerName: form.customerName.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.message.trim() ? { message: form.message.trim() } : {}),
      sourcePage: window.location.pathname,
      consentPrivacy: true,
      items: lines,
    };
    const errors = validateQuoteRequest(payload);
    if (!form.email.trim() && !form.phone.trim()) errors.contact = 'Indica un email o un teléfono.';
    if (lines.length === 0) errors.items = 'Añade al menos una variante.';
    if (!form.consent) errors.consentPrivacy = 'Debes aceptar la política de privacidad.';
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError('');
    try {
      await createQuoteRequest(payload);
      clear();
      setStatus('success');
      setForm({ customerName: '', email: '', phone: '', message: '', consent: false });
    } catch (requestError) {
      setStatus('error');
      setError(requestError instanceof CatalogApiError ? requestError.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
    }
  }

  return (
    <main className="min-h-screen bg-porcelain px-5 py-10 text-ink sm:px-8" id="quote-selection-content">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Migas de pan" className="text-sm text-graphite"><Link to="/" className="underline-offset-4 hover:underline">Inicio</Link><span aria-hidden="true"> / </span><Link to="/productos" className="underline-offset-4 hover:underline">Catálogo</Link><span aria-hidden="true"> / </span><span aria-current="page">Presupuesto</span></nav>
        <div className="mt-10 flex flex-col gap-3 border-b border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold text-clay">Selección de producto</p><h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Mi presupuesto</h1><p className="mt-4 max-w-xl text-graphite">Revisa las variantes elegidas y envía una sola solicitud con todas sus características.</p></div>
          <Link to="/productos" className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/20 px-4 text-sm font-semibold hover:border-ink/50">Volver al catálogo</Link>
        </div>

        {lines.length === 0 ? (
          <section className="py-20 text-center" aria-labelledby="empty-selection-heading">{status === 'success' ? <p role="status" className="text-green-800">Solicitud enviada correctamente.</p> : <><h2 id="empty-selection-heading" className="font-display text-3xl">Aún no hay selecciones</h2><p className="mx-auto mt-3 max-w-md text-graphite">Añade una variante desde su ficha para construir tu presupuesto.</p></>}<Link to="/productos" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white">Explorar espejos</Link></section>
        ) : (
          <div className="grid gap-14 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section aria-labelledby="selection-lines-heading"><div className="flex items-baseline justify-between gap-4"><h2 id="selection-lines-heading" className="font-display text-3xl">Variantes elegidas</h2><button type="button" onClick={clear} className="text-sm text-graphite underline-offset-4 hover:underline">Vaciar</button></div><ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">{lines.map((line) => { const key = getQuoteSelectionKey(line); return <li key={key} className="py-6"><div className="flex items-start justify-between gap-5"><div><h3 className="text-lg font-semibold">{line.productName}</h3><p className="mt-1 text-sm text-graphite">Referencia {line.reference}</p><dl className="mt-4 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">{Object.entries(line.selectedAttributes || {}).map(([attribute, value]) => <div key={attribute}><dt className="text-graphite">{attributeLabels[attribute] || attribute}</dt><dd className="font-semibold">{String(value)}</dd></div>)}</dl></div><button type="button" onClick={() => removeLine(key)} aria-label={`Eliminar ${line.productName} ${line.reference}`} className="text-sm text-graphite underline-offset-4 hover:text-ink hover:underline">Eliminar</button></div><div className="mt-5 flex items-center gap-3"><label htmlFor={`quantity-${key}`} className="text-sm font-semibold">Cantidad</label><input id={`quantity-${key}`} type="number" min="1" max="999" value={line.quantity} onChange={(event) => updateQuantity(key, Number(event.target.value))} className="h-10 w-20 border-b border-ink/30 bg-transparent px-1 text-center focus:border-ink focus:outline-none" /></div></li>; })}</ul></section>
            <section aria-labelledby="joint-quote-heading"><h2 id="joint-quote-heading" className="font-display text-3xl">Solicitar presupuesto</h2><form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate><div><label htmlFor="joint-name" className="text-sm font-semibold">Nombre</label><input id="joint-name" value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} className="mt-1 w-full border-b border-ink/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="joint-email" className="text-sm font-semibold">Email</label><input id="joint-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className="mt-1 w-full border-b border-ink/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none" /></div><div><label htmlFor="joint-phone" className="text-sm font-semibold">Teléfono</label><input id="joint-phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="mt-1 w-full border-b border-ink/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none" /></div></div><div><label htmlFor="joint-message" className="text-sm font-semibold">Mensaje</label><textarea id="joint-message" rows={4} value={form.message} onChange={(event) => updateField('message', event.target.value)} className="mt-1 w-full border-b border-ink/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none" /></div><label className="flex items-start gap-2 text-sm text-graphite"><input type="checkbox" checked={form.consent} onChange={(event) => updateField('consent', event.target.checked)} className="mt-1" />Acepto la política de privacidad.</label>{(status === 'error' || status === 'success') && <p role={status === 'error' ? 'alert' : 'status'} className={status === 'error' ? 'text-sm text-red-700' : 'text-sm text-green-800'}>{status === 'success' ? 'Solicitud enviada correctamente.' : error}</p>}<button type="submit" disabled={status === 'submitting'} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-graphite disabled:opacity-60">{status === 'submitting' ? 'Enviando…' : `Enviar ${lines.length} ${lines.length === 1 ? 'selección' : 'selecciones'}`}</button></form></section>
          </div>
        )}
      </div>
    </main>
  );
}
