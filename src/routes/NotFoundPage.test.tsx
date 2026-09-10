import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

function renderNotFound() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe('NotFoundPage', () => {
  afterEach(cleanup);

  it('marks the route as noindex and offers brand recovery', () => {
    renderNotFound();

    expect(document.title).toBe('Página no encontrada · AREA LRMQ');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Explorar el catálogo' })).toHaveAttribute('href', '/productos');
  });

  it('restores the metadata of the previous route when unmounting', () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<meta name="robots" content="index, follow" /><meta name="description" content="Anterior" />',
    );
    const previousTitle = document.title;
    renderNotFound().unmount();

    expect(document.title).toBe(previousTitle);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Anterior');
  });
});
