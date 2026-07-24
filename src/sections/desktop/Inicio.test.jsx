import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Inicio } from './Inicio';

describe('desktop landing catalog access', () => {
  it('makes the Tienda label open the product catalog', () => {
    render(<MemoryRouter><Inicio step={0} isActive /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'Abrir catálogo de productos' })).toHaveAttribute('href', '/productos');
  });
});
