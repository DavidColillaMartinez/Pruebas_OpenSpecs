import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { applyRouteMeta } from '../../routes/routeMeta';
import { LegalPage } from './LegalPage';
import { LEGAL_BUSINESS, PRIVACY_SUMMARIES } from './business';
import { BROWSER_STORAGE, LEGAL_DOCUMENTS, PROVIDER_PRIVACY_LINKS } from './content';
import { PrivacyNotice } from './PrivacyNotice';

function CatalogStub() {
  useEffect(() => applyRouteMeta({ title: 'Catálogo', description: 'Catálogo de prueba', canonicalPath: '/productos' }), []);
  return <h1>Catálogo de prueba</h1>;
}

beforeEach(() => {
  document.head.innerHTML = '<meta name="description" content="Portada"><meta name="robots" content="index, follow"><link rel="canonical" href="https://arealrmq.es/"><meta property="og:title" content="Portada social"><meta property="og:url" content="https://arealrmq.es/">';
  document.title = 'Portada';
});

const internalDetails = /Vercel|n8n|Neon|Resend|Hostalia|Gmail(?!\.com)|\/api\/|webhook|assets\.colilladavid\.es|Reply-To|presupuestos@|lrmq:(?:theme|quote|assistant)|catalog:return-state|\bSQL\b|outbox|reintentos|backups?|workflows?|endpoints?|backend|credenciales|cabeceras|regi[oó]n de funciones|revisi[oó]n local|auditor[ií]a|\b(?:pruebas|pendientes?|propuest[ao]s?)\b/i;

describe('Public legal information', () => {
  it('keeps internal architecture out of public content modules and provider links', () => {
    const publicContent = JSON.stringify({ LEGAL_BUSINESS, PRIVACY_SUMMARIES, LEGAL_DOCUMENTS, BROWSER_STORAGE, PROVIDER_PRIVACY_LINKS });
    expect(publicContent.match(internalDetails)).toBeNull();
    expect(PROVIDER_PRIVACY_LINKS.map(({ label }) => label)).toEqual(['WhatsApp']);
  });

  it.each(['/aviso-legal', '/privacidad', '/cookies'])('renders user-facing information without internal details at %s', (path) => {
    const { container } = renderRoutes(path);
    expect(container.textContent).not.toMatch(internalDetails);
    expect(container.textContent).toContain(LEGAL_BUSINESS.email);
    expect(container.querySelector('article')?.innerHTML).not.toMatch(internalDetails);
  });

  it.each(['quote', 'whatsapp', 'assistant'] as const)('renders the reused %s notice with identity, rights and a privacy link', (flow) => {
    const { container } = render(<PrivacyNotice flow={flow} />);
    expect(container.textContent).not.toMatch(internalDetails);
    expect(container.textContent).toContain(LEGAL_BUSINESS.company);
    expect(container.textContent).toContain(LEGAL_BUSINESS.email);
    expect(screen.getByRole('link', { name: /Política de privacidad/ })).toHaveAttribute('target', '_blank');
  });

  it('retains data categories, purposes, rights and explicit international processing without promising unverified guarantees', () => {
    const { container } = renderRoutes('/privacidad');
    const text = container.textContent ?? '';
    for (const disclosure of ['NIF B19932607', LEGAL_BUSINESS.address, 'artículo 6.1.b', 'artículo 6.1.f', 'inteligencia artificial', 'término de búsqueda', 'WhatsApp', 'fuera del Espacio Económico Europeo', 'Estados Unidos', 'actualmente no aplica un plazo de borrado', 'supresión', 'portabilidad', 'un mes']) {
      expect(text.toLowerCase()).toContain(disclosure.toLowerCase());
    }
    expect(text).not.toMatch(/cláusulas contractuales tipo|Marco de Privacidad de Datos|garantizamos|todos tus datos permanecen en Europa/i);
    expect(screen.getByRole('link', { name: 'Privacidad de WhatsApp' })).toHaveAttribute('href', 'https://www.whatsapp.com/legal/privacy-policy-eea');
  });

  it('presents functional storage with understandable names and actual technology and duration', () => {
    renderRoutes('/cookies');
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Función y tecnología');
    for (const label of ['Preferencia de tema', 'Selección de productos', 'Bienvenida del asistente', 'Retorno al catálogo', 'localStorage', 'sessionStorage', 'Sin caducidad programada', 'Sesión de la pestaña', 'se elimina al recuperar el retorno']) {
      expect(table).toHaveTextContent(label);
    }
    expect(table.textContent).not.toMatch(internalDetails);
  });
});
afterEach(cleanup);

function renderRoutes(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/" element={<><h1>Portada</h1><Link to="/privacidad">Privacidad</Link></>} />
    <Route path="/productos" element={<CatalogStub />} />
    <Route path="/aviso-legal" element={<LegalPage kind="notice" />} />
    <Route path="/privacidad" element={<LegalPage kind="privacy" />} />
    <Route path="/cookies" element={<LegalPage kind="cookies" />} />
  </Routes></MemoryRouter>);
}

describe('Legal pages metadata isolation', () => {
  it.each(['/aviso-legal', '/privacidad', '/cookies'])('provides its own heading, canonical and noindex at %s', (path) => {
    renderRoutes(path);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `https://arealrmq.es${path}`);
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  });

  it('restores homepage metadata and social tags on return and can re-enter privacy', async () => {
    renderRoutes('/privacidad');
    fireEvent.click(screen.getByRole('link', { name: 'Inicio' }));
    await waitFor(() => expect(document.title).toBe('Portada'));
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Portada');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://arealrmq.es/');
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Portada social');
    fireEvent.click(screen.getByRole('link', { name: 'Privacidad' }));
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  });

  it('allows catalog to replace legal metadata without inheriting noindex', async () => {
    renderRoutes('/cookies');
    fireEvent.click(screen.getByRole('link', { name: 'Catálogo' }));
    await waitFor(() => expect(document.title).toBe('Catálogo'));
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://arealrmq.es/productos');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Catálogo de prueba');
  });

  it('updates metadata between legal variants without leaking the first variant on exit', () => {
    renderRoutes('/aviso-legal');
    fireEvent.click(screen.getByRole('link', { name: 'Cookies y almacenamiento' }));
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://arealrmq.es/cookies');
    fireEvent.click(screen.getByRole('link', { name: 'Inicio' }));
    expect(document.title).toBe('Portada');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  });
});
