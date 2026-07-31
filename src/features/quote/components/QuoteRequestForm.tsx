import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CatalogApiError, createQuoteRequest } from '../../catalog/api/client';
import type { ProductDetail } from '../../catalog/model/types';
import type { SelectableUnit } from '../../catalog/model/selection';
import { buildQuoteRequestItem, validateQuoteRequest } from '../model/payload';
import type { QuoteRequestPayload } from '../model/types';

type QuoteFormState = {
  customerName: string;
  phone: string;
  email: string;
  renovationType: string;
  message: string;
  quantity: number;
  consentPrivacy: boolean;
  website: string;
};

const initialForm: QuoteFormState = {
  customerName: '',
  phone: '',
  email: '',
  renovationType: '',
  message: '',
  quantity: 1,
  consentPrivacy: false,
  website: '',
};

type QuoteRequestFormProps = {
  product: ProductDetail;
  unit: SelectableUnit | null;
};

export function QuoteRequestForm({ product, unit }: QuoteRequestFormProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);
  const selectedSummary = unit?.variantSnapshot
    ? Object.values(unit.variantSnapshot).filter((value) => value !== undefined && value !== '').map(String).join(' · ')
    : '';

  useEffect(() => {
    if (status === 'success' || status === 'error') resultRef.current?.focus();
  }, [status]);

  function updateField(key: keyof QuoteFormState, value: string | number | boolean) {
    setForm((current) => ({ ...current, [key]: value } as QuoteFormState));
    setFieldErrors((current) => ({ ...current, [key]: '' }));
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.customerName.trim()) errors.customerName = 'Escribe tu nombre.';
    if (!form.email.trim() && !form.phone.trim()) errors.contact = 'Indica un email o un teléfono.';
    if (form.customerName.length > 200) errors.customerName = 'El nombre no puede superar 200 caracteres.';
    if (form.email.length > 320) errors.email = 'El email no puede superar 320 caracteres.';
    if (form.phone.length > 80) errors.phone = 'El teléfono no puede superar 80 caracteres.';
    if (form.message.length > 5000) errors.message = 'El mensaje no puede superar 5000 caracteres.';
    if (form.quantity < 1 || form.quantity > 999 || !Number.isInteger(form.quantity)) errors.quantity = 'La cantidad debe estar entre 1 y 999.';
    if (!form.consentPrivacy) errors.consentPrivacy = 'Debes aceptar la política de privacidad.';
    if (!unit) errors.selection = 'Selecciona una variante completa antes de solicitar presupuesto.';
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus('error');
      setErrorMessage('Revisa los campos marcados.');
      return;
    }

    if (form.website) return;
    setStatus('submitting');
    setErrorMessage('');
    setFieldErrors({});

    const payload: QuoteRequestPayload = {
      customerName: form.customerName.trim(),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.renovationType.trim() ? { renovationType: form.renovationType.trim() } : {}),
      ...(form.message.trim() ? { message: form.message.trim() } : {}),
      sourcePage: window.location.pathname,
      consentPrivacy: true,
      website: '',
      items: [buildQuoteRequestItem(product, unit, form.quantity, form.message)],
    };

    const payloadErrors = validateQuoteRequest(payload);
    if (Object.keys(payloadErrors).length > 0) {
      setFieldErrors(payloadErrors);
      setStatus('error');
      setErrorMessage('Revisa los campos marcados.');
      return;
    }

    try {
      await createQuoteRequest(payload);
      setStatus('success');
      setForm(initialForm);
    } catch (error) {
      setStatus('error');
      if (error instanceof CatalogApiError && error.details && typeof error.details === 'object' && 'errors' in error.details && Array.isArray(error.details.errors)) {
        setFieldErrors(Object.fromEntries(error.details.errors.map((item) => [item.field, item.message])));
      }
      setErrorMessage(error instanceof CatalogApiError ? error.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
    }
  }

  return (
    <section aria-labelledby="quote-heading">
      <h2 id="quote-heading" className="text-2xl font-semibold text-ink">Solicitar presupuesto</h2>
      <p className="mt-2 text-sm text-graphite">Producto: {product.name}{selectedSummary ? ` · ${selectedSummary}` : ''}</p>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="quote-name" className="text-sm font-semibold text-graphite">Nombre</label>
          <input id="quote-name" value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} aria-invalid={Boolean(fieldErrors.customerName)} aria-describedby={fieldErrors.customerName ? 'quote-name-error' : undefined} className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay" />
          {fieldErrors.customerName && <p id="quote-name-error" className="mt-1 text-sm text-red-700">{fieldErrors.customerName}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quote-email" className="text-sm font-semibold text-graphite">Email</label>
            <input id="quote-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'quote-email-error' : undefined} className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay" />
            {fieldErrors.email && <p id="quote-email-error" className="mt-1 text-sm text-red-700">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="quote-phone" className="text-sm font-semibold text-graphite">Teléfono</label>
            <input id="quote-phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'quote-phone-error' : undefined} className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay" />
            {fieldErrors.phone && <p id="quote-phone-error" className="mt-1 text-sm text-red-700">{fieldErrors.phone}</p>}
          </div>
        </div>
        {fieldErrors.contact && <p className="text-sm text-red-700">{fieldErrors.contact}</p>}
        <div>
          <label htmlFor="quote-quantity" className="text-sm font-semibold text-graphite">Cantidad</label>
          <input id="quote-quantity" type="number" min="1" max="999" value={form.quantity} onChange={(event) => updateField('quantity', Number(event.target.value))} className="mt-1 w-24 rounded-lg border border-ink/20 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay" />
          {fieldErrors.quantity && <p className="mt-1 text-sm text-red-700">{fieldErrors.quantity}</p>}
        </div>
        <div>
          <label htmlFor="quote-message" className="text-sm font-semibold text-graphite">Mensaje</label>
          <textarea id="quote-message" rows={4} value={form.message} onChange={(event) => updateField('message', event.target.value)} aria-invalid={Boolean(fieldErrors.message)} aria-describedby={fieldErrors.message ? 'quote-message-error' : undefined} className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay" />
          {fieldErrors.message && <p id="quote-message-error" className="mt-1 text-sm text-red-700">{fieldErrors.message}</p>}
        </div>
        {fieldErrors.selection && <p className="text-sm text-red-700">{fieldErrors.selection}</p>}
        <label className="flex items-start gap-2 text-sm text-graphite">
          <input type="checkbox" checked={form.consentPrivacy} onChange={(event) => updateField('consentPrivacy', event.target.checked)} aria-invalid={Boolean(fieldErrors.consentPrivacy)} aria-describedby={fieldErrors.consentPrivacy ? 'quote-consent-error' : undefined} className="mt-1" />
          Acepto la política de privacidad.
        </label>
        {fieldErrors.consentPrivacy && <p id="quote-consent-error" className="text-sm text-red-700">{fieldErrors.consentPrivacy}</p>}
        <input value={form.website} onChange={(event) => updateField('website', event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px" />
        <button type="submit" disabled={status === 'submitting'} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">
          {status === 'submitting' ? 'Enviando…' : 'Solicitar presupuesto'}
        </button>
        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="text-sm">
          {status === 'success' && <p className="text-green-800">Solicitud enviada correctamente.</p>}
          {status === 'error' && <p className="text-red-700">{errorMessage}</p>}
        </div>
      </form>
    </section>
  );
}
