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

  it('shows the Opiniones slogan and an honest empty state without verified reviews', () => {
    render(
      <MemoryRouter>
        <MobileOpiniones />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'Juzga tú mismo.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Juzga tú mismo.' })).toBeInTheDocument();
    expect(screen.getByText(/Pronto mostraremos aquí las reseñas verificadas de Google/)).toBeInTheDocument();
  });
});
