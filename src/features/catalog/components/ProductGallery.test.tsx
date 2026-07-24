import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProductGallery } from './ProductGallery';

const images = [
  { alt: 'Alba', url: 'https://assets.example/alba-1.webp', role: 'main', sortOrder: 1 },
  { alt: 'Alba lateral', url: 'https://assets.example/alba-2.webp', role: 'detail', sortOrder: 2 },
];

describe('ProductGallery', () => {
  it('changes the active image with native buttons and selected state', () => {
    render(<ProductGallery images={images} productName="Alba" variantLabel="Ø60" />);

    const thumbnails = screen.getAllByRole('button');
    expect(thumbnails).toHaveLength(2);
    expect(thumbnails[0]).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(thumbnails[1]);
    expect(thumbnails[1]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('img', { name: 'Alba, Ø60, imagen principal' })).toHaveAttribute('src', images[1].url);
  });

  it('keeps the page usable without images or when the active image fails', () => {
    const { rerender } = render(<ProductGallery images={images} productName="Alba" />);
    fireEvent.error(screen.getByRole('img', { name: 'Alba, imagen principal' }));
    expect(screen.getByRole('status')).toHaveTextContent('Imagen no disponible');

    rerender(<ProductGallery images={[]} productName="Producto sin imagen" />);
    expect(screen.getByRole('status')).toHaveTextContent('Imagen no disponible');
  });
});
