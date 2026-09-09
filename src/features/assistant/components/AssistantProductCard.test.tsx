import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AssistantProductCard } from './AssistantProductCard';

const product = {
  productId: 'mt-espejos-alba',
  slug: 'mt-espejos-alba',
  name: 'Alba',
  internalPath: '/productos/mt-espejos-alba',
  imageUrl: 'https://assets.colilladavid.es/proyectos/lrmq/catalogo/images/manillons_espejos/mt26-esp-alba-i01.webp',
  facts: ['Medidas/opciones: Ø 60, Ø 70'],
  recommendationReason: 'Coincide con las medidas solicitadas.',
};

describe('AssistantProductCard', () => {
  it('renders the approved cover preview without making the image the only way to open the product', () => {
    render(<MemoryRouter><AssistantProductCard product={product} /></MemoryRouter>);

    expect(screen.getByRole('img', { name: 'Alba' })).toHaveAttribute('src', product.imageUrl);
    expect(screen.getByRole('img', { name: 'Alba' })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('img', { name: 'Alba' })).toHaveAttribute('decoding', 'async');
    expect(screen.getByRole('link', { name: 'Alba' })).toHaveAttribute('href', '/productos/mt-espejos-alba');
  });

  it('keeps the card usable when the cover cannot be loaded', () => {
    render(<MemoryRouter><AssistantProductCard product={product} /></MemoryRouter>);

    fireEvent.error(screen.getByRole('img', { name: 'Alba' }));

    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Alba' })).toBeInTheDocument();
  });

  it('shows a stable fallback when n8n has no cover for a product', () => {
    const withoutImage = { ...product, imageUrl: undefined };
    render(<MemoryRouter><AssistantProductCard product={withoutImage} /></MemoryRouter>);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument();
  });
});
