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

    const thumbnails = screen.getAllByRole('button', { name: /Ver imagen/ });
    expect(thumbnails).toHaveLength(2);
    expect(thumbnails[0]).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(thumbnails[1]);
    expect(thumbnails[1]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('img', { name: 'Alba, Ø60, imagen principal' })).toHaveAttribute('src', images[1].url);
  });

  it('opens a zoom dialog when the active image is clicked and closes on Escape', () => {
    render(<ProductGallery images={images} productName="Alba" />);

    fireEvent.click(screen.getByRole('button', { name: /Ampliar imagen/ }));
    expect(screen.getByRole('dialog', { name: /Imagen ampliada/ })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the page usable without images', async () => {
    const { rerender } = render(<ProductGallery images={images} productName="Alba" />);
    rerender(<ProductGallery images={[]} productName="Producto sin imagen" />);
    expect(await screen.findByText('Imagen no disponible')).toBeInTheDocument();
  });

  it('navigates a long ordered gallery through five visible thumbnails and the zoom view', () => {
    const manyImages = Array.from({ length: 23 }, (_, index) => ({
      alt: `Imagen ${index + 1}`,
      url: `https://assets.example/gallery-${index + 1}.webp`,
      role: 'detail',
      sortOrder: index + 1,
    }));
    render(<ProductGallery images={manyImages} productName="Mampara" />);

    expect(screen.getAllByRole('button', { name: /Ver imagen/ })).toHaveLength(5);
    const nextButton = screen.getByRole('button', { name: 'Imagen siguiente' });
    fireEvent.click(nextButton);
    expect(screen.getByRole('img', { name: 'Mampara, imagen principal' })).toHaveAttribute('src', manyImages[1].url);
    fireEvent.click(screen.getByRole('button', { name: /Ampliar imagen/ }));
    expect(screen.getByRole('dialog', { name: /Imagen ampliada/ })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', manyImages[2].url);
    expect(screen.getAllByRole('button', { name: /Ver imagen/ })).toHaveLength(5);
  });
});
