import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileQuienesSomos } from './QuienesSomos';
import { MobileOpiniones } from './Opiniones';

describe('mobile new chapters', () => {
  it('stacks Quiénes somos with its three blocks in order', () => {
    render(
      <MemoryRouter>
        <MobileQuienesSomos />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'Qué hay detrás de cada baño.' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(3);
  });

  it('shows the Opiniones slogan with the real Google reviews', () => {
    render(
      <MemoryRouter>
        <MobileOpiniones />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'Juzga tú mismo.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Juzga tú mismo.' })).toBeInTheDocument();
    expect(screen.queryByText(/Pronto mostraremos aquí las reseñas verificadas de Google/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Ver en Google')).toHaveLength(13);
    expect(screen.getByText('Raul Parra')).toBeInTheDocument();
    expect(screen.getByText('Reseña sin comentario de texto.')).toBeInTheDocument();
  });
});
