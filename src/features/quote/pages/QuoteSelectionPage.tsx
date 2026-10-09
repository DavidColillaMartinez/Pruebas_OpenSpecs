import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { applyRouteMeta } from '../../../routes/routeMeta';
import { CatalogApiError, createQuoteRequest } from '../../catalog/api/client';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { getQuoteSelectionKey, useQuoteSelection } from '../model/selectionStore';
import { getQuoteSummaryAttributes, formatQuoteLineReference } from '../model/summary';
import { validateQuoteRequest } from '../model/payload';
import type { QuoteRequestPayload } from '../model/types';

export function QuoteSelectionPage() {
  const { lines, updateQuantity, removeLine, clear, removeLines } = useQuoteSelection();
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', message: '', consent: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [lineErrors, setLineErrors] = useState<Record<number, string>>({});
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const updateField = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const submitting = status === 'submitting';

  useEffect(() => applyRouteMeta({
    title: 'Mi presupuesto · AREA LRMQ',
    description: 'Revisa las variantes seleccionadas y envía una solicitud única de presupuesto para tu reforma con AREA LRMQ.',
    canonicalPath: '/presupuesto/',
    noindex: true,
  }), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    // Capture exactly the lines being sent BEFORE any cleanup: the confirmation
    // must be validated against them (id, success status, item_count).
    const sentLines = [...lines];
    const payload: QuoteRequestPayload = {
      customerName: form.customerName.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.message.trim() ? { message: form.message.trim() } : {}),
      sourcePage: window.location.pathname,
      consentPrivacy: true,
      items: sentLines,
    };
    const errors = validateQuoteRequest(payload);
    if (!form.email.trim() && !form.phone.trim()) errors.contact = 'Indica un email o un teléfono.';
    if (sentLines.length === 0) errors.items = 'Añade al menos una variante.';
    if (!form.consent) errors.consentPrivacy = 'Debes aceptar la política de privacidad.';
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError('');
    setLineErrors({});
    try {
      const confirmation = await createQuoteRequest(payload);
      // Only the sent lines leave the basket; anything changed after the
      // submit (despite the controls being blocked) stays for the user.
      removeLines(sentLines.map(getQuoteSelectionKey));
      setConfirmedId(confirmation.id);
      setStatus('success');
      setForm({ customerName: '', email: '', phone: '', message: '', consent: false });
    } catch (requestError) {
      setStatus('error');
      setConfirmedId(null);
      setLineErrors(collectLineErrors(requestError));
      setError(requestError instanceof CatalogApiError ? requestError.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
    }
  }

  return (
    <main className="min-h-screen bg-surface px-5 py-10 text-primary sm:px-8" id="quote-selection-content">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-secondary">
          <nav aria-label="Migas de pan" className="text-secondary"><Link to="/" className="underline-offset-4 hover:underline">Inicio</Link><span aria-hidden="true"> / </span><Link to="/productos" className="underline-offset-4 hover:underline">Catálogo</Link><span aria-hidden="true"> / </span><span aria-current="page">Presupuesto</span></nav>
          <ThemeToggle />
        </div>
        <div className="mt-10 flex flex-col gap-3 border-b border-border-hairline/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0"><p className="text-sm font-semibold text-clay">Selección de producto</p><h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.75rem)] leading-none">Mi presupuesto</h1><p className="mt-4 max-w-xl text-secondary">Revisa las variantes elegidas y envía una sola solicitud con todas sus características.</p></div>
          <Link to="/productos" className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-hairline/20 px-4 text-sm font-semibold hover:border-border-hairline/50">Volver al catálogo</Link>
        </div>

        {lines.length === 0 ? (
          <section className="py-20 text-center" aria-labelledby="empty-selection-heading">
            {status === 'success' ? <p role="status" className="text-green-800">Solicitud registrada con el identificador {confirmedId ?? '—'}.</p> : <><h2 id="empty-selection-heading" className="font-display text-3xl">Aún no hay selecciones</h2><p className="mx-auto mt-3 max-w-md text-secondary">Añade una variante desde su ficha para construir tu presupuesto.</p></>}
            <Link to="/productos" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white">Explorar catálogo</Link>
          </section>
        ) : (
          <div className="grid gap-14 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="min-w-0" aria-labelledby="selection-lines-heading">
              <div className="flex flex-wrap items-baseline justify-between gap-4"><h2 id="selection-lines-heading" className="font-display text-3xl">Variantes elegidas</h2><button type="button" onClick={clear} disabled={submitting} className="min-h-11 text-sm text-secondary underline-offset-4 hover:underline disabled:opacity-50">Vaciar</button></div>
              <ul className="mt-6 divide-y divide-ink/10 border-y border-border-hairline/10">
                {lines.map((line, index) => {
                  const key = getQuoteSelectionKey(line);
                  return (
                    <li key={key} className="py-6">
                      <div className="flex flex-col items-start gap-4 sm:flex-row">
                        {line.imageUrl ? <img src={line.imageUrl} alt="" className="h-24 w-20 lrmq-soften-quote shrink-0 object-contain" loading="lazy" decoding="async" /> : <span className="grid h-24 w-20 shrink-0 place-items-center border border-border-hairline/10 text-center text-xs text-secondary">Sin imagen</span>}
                        <div className="min-w-0 flex-1">
                           <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-lg font-semibold">{line.productName}</h3><p className="mt-1 break-words text-sm text-secondary">{line.supplier || line.category || 'Producto'} · {formatQuoteLineReference(line.reference)}</p></div><button type="button" onClick={() => removeLine(key)} disabled={submitting} aria-label={`Eliminar ${line.productName}${line.reference ? ` ${line.reference}` : ''}`} className="min-h-11 shrink-0 text-sm text-secondary underline-offset-4 hover:text-primary hover:underline disabled:opacity-50">Eliminar</button></div>
                          <dl className="mt-4 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">{getQuoteSummaryAttributes(line).map((attribute, attributeIndex) => <div key={`${attribute.label}-${attributeIndex}`}><dt className="text-secondary">{attribute.label}</dt><dd className="font-semibold">{attribute.value}</dd></div>)}</dl>
                          {lineErrors[index] && <p role="alert" className="mt-2 text-sm text-red-700">Esta línea: {lineErrors[index]}</p>}
                          <div className="mt-5 flex flex-wrap items-center gap-3"><label htmlFor={`quantity-${key}`} className="text-sm font-semibold">Cantidad</label><input id={`quantity-${key}`} type="number" min="1" max="999" disabled={submitting} value={line.quantity} onChange={(event) => updateQuantity(key, Number(event.target.value))} className="h-10 w-20 border-b border-border-hairline/30 bg-transparent px-1 text-center focus:border-ink focus:outline-none disabled:opacity-60" /></div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section aria-labelledby="joint-quote-heading">
              <h2 id="joint-quote-heading" className="font-display text-3xl">Solicitar presupuesto</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div><label htmlFor="joint-name" className="text-sm font-semibold">Nombre</label><input id="joint-name" disabled={submitting} value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} className="mt-1 w-full border-b border-border-hairline/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none disabled:opacity-60" /></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="joint-email" className="text-sm font-semibold">Email</label><input id="joint-email" type="email" disabled={submitting} value={form.email} onChange={(event) => updateField('email', event.target.value)} className="mt-1 w-full border-b border-border-hairline/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none disabled:opacity-60" /></div><div><label htmlFor="joint-phone" className="text-sm font-semibold">Teléfono</label><input id="joint-phone" disabled={submitting} value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="mt-1 w-full border-b border-border-hairline/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none disabled:opacity-60" /></div></div>
                <div><label htmlFor="joint-message" className="text-sm font-semibold">Mensaje</label><textarea id="joint-message" rows={4} disabled={submitting} value={form.message} onChange={(event) => updateField('message', event.target.value)} className="mt-1 w-full border-b border-border-hairline/20 bg-transparent px-1 py-3 focus:border-ink focus:outline-none disabled:opacity-60" /></div>
                <label className="flex items-start gap-2 text-sm text-secondary"><input type="checkbox" disabled={submitting} checked={form.consent} onChange={(event) => updateField('consent', event.target.checked)} className="mt-1" />Acepto la política de privacidad.</label>
                {status === 'error' && <p role="alert" className="text-sm text-red-700">{error}</p>}
                {status === 'success' && <p role="status" className="text-sm text-green-800">Solicitud registrada con el identificador {confirmedId ?? '—'}.</p>}
                <button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-graphite disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">{submitting ? 'Enviando…' : `Enviar ${lines.length} ${lines.length === 1 ? 'selección' : 'selecciones'}`}</button>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function collectLineErrors(requestError: unknown): Record<number, string> {
  if (!(requestError instanceof CatalogApiError) || !requestError.details || typeof requestError.details !== 'object') return {};
  const record = requestError.details as Record<string, unknown>;
  const lineErrors: Record<number, string> = {};
  const mapField = (field: string, message: string) => {
    const match = /^items\.(\d+)(?:\.([A-Za-z0-9_]+))?$/.exec(field);
    if (!match) return;
    lineErrors[Number(match[1])] = message || (match[2] ? `Revisa ${match[2].replaceAll('_', ' ')} de esta línea.` : 'Revisa esta línea.');
  };
  if (Array.isArray(record.errors)) {
    record.errors.forEach((item) => {
      if (item && typeof item === 'object') {
        const entry = item as Record<string, unknown>;
        if (typeof entry.field === 'string') mapField(entry.field, typeof entry.message === 'string' ? entry.message : '');
      }
    });
  }
  if (Array.isArray(record.fields)) {
    record.fields.forEach((field) => {
      if (typeof field === 'string') mapField(field, '');
    });
  }
  return lineErrors;
}
