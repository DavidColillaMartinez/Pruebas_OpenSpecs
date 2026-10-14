import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { applyRouteMeta } from '../../routes/routeMeta';
import { LegalPage } from './LegalPage';

function CatalogStub() {
  useEffect(() => applyRouteMeta({ title: 'Catálogo', description: 'Catálogo de prueba', canonicalPath: '/productos/' }), []);
  return <h1>Catálogo de prueba</h1>;
}

beforeEach(() => {
  document.head.innerHTML = '<meta name="description" content="Portada"><meta name="robots" content="index, follow"><link rel="canonical" href="https://arealrmq.es/"><meta property="og:title" content="Portada social"><meta property="og:url" content="https://arealrmq.es/">';
  document.title = 'Portada';
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
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://arealrmq.es/productos/');
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
