import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import alba from '../../catalog/api/fixtures/product-detail.mt-espejos-alba.json';
import { normalizeProductDetail } from '../../catalog/model/normalize';
import { getSelectableUnits, selectInitialUnit } from '../../catalog/model/selection';
import { QuoteRequestForm } from './QuoteRequestForm';

const product = normalizeProductDetail(alba);
const unit = selectInitialUnit(getSelectableUnits(product));

function renderForm() {
  return render(<MemoryRouter><QuoteRequestForm product={product} unit={unit} /></MemoryRouter>);
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
  fireEvent.click(screen.getByRole('checkbox'));
}

afterEach(() => vi.unstubAllGlobals());

describe('QuoteRequestForm', () => {
  it('blocks submission without contact or privacy consent', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar presupuesto' }));

    expect(await screen.findByText('Indica un email o un teléfono.')).toBeInTheDocument();
    expect(screen.getByText('Debes aceptar la política de privacidad.')).toBeInTheDocument();
  });

  it('sends the canonical public payload and clears fields only after 201', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'quote-1', status: 'received', created_at: '2026-07-23T00:00:00Z', item_count: 1 }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar presupuesto' }));

    expect(await screen.findByText('Solicitud enviada correctamente.')).toBeInTheDocument();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/catalog/quote-requests');
    expect(url).not.toContain('webhook');
    expect(JSON.parse(options.body)).toMatchObject({ customerName: 'Ana', email: 'ana@example.com', consentPrivacy: true, website: '' });
    expect(JSON.parse(options.body).items[0]).toMatchObject({ productId: 'mt-espejos-alba', variantId: 'mt-espejos-alba--v0001', quantity: 1 });
    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue(''));
  });

  it('keeps entered values and associates server validation errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'VALIDATION_ERROR',
      errors: [{ field: 'email', message: 'Email no válido.' }],
    }), { status: 400 })));

    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar presupuesto' }));

    expect(await screen.findByText('Email no válido.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps entered values and shows the server rate-limit message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'RATE_LIMITED',
      message: 'Espera unos minutos antes de enviar otra solicitud.',
    }), { status: 429 })));

    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar presupuesto' }));

    expect(await screen.findByText('Espera unos minutos antes de enviar otra solicitud.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
  });

  it('keeps entered values after a network failure so the user can retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar presupuesto' }));

    expect(await screen.findByText('No se pudo conectar con el catálogo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
  });

  it('prevents duplicate submissions while pending', async () => {
    let resolveRequest: (value: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => { resolveRequest = resolve; });
    const fetchMock = vi.fn().mockReturnValue(pending);
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fillRequiredFields();
    const submit = screen.getByRole('button', { name: 'Solicitar presupuesto' });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
    resolveRequest(new Response(JSON.stringify({ id: 'quote-1', status: 'received' }), { status: 201 }));
    await waitFor(() => expect(screen.getByText('Solicitud enviada correctamente.')).toBeInTheDocument());
  });
});
