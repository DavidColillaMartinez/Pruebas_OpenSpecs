import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    expect(screen.getByRole('img', { name: 'Alba, Ø60, imagen principal' })).toHaveAttribute('src', images[0].url);
    expect(screen.getByRole('img', { name: 'Alba, Ø60, imagen principal' })).toHaveAttribute('loading', 'eager');
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

  it('keeps the frame stable and falls back when the active API image fails', async () => {
    render(<ProductGallery images={images} productName="Alba" />);

    fireEvent.error(screen.getByRole('img', { name: 'Alba, imagen principal' }));
    fireEvent.error(screen.getByRole('img', { name: 'Alba, imagen principal' }));

    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('region', { name: 'Imágenes del producto' }).querySelector('div[aria-busy]')).toHaveAttribute('aria-busy', 'false'));
  });

  it('uses the horizontal frame for modular Royo covers when requested', () => {
    render(<ProductGallery images={images} productName="Logika" wideFrame />);

    expect(screen.getByRole('region', { name: 'Imágenes del producto' }).querySelector('div[aria-busy]')).toHaveClass('aspect-[1799/1149]');
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

  it('keeps Swing catalogue pages 158 and 159 in manifest order', () => {
    const swingImages = [
      { alt: 'Swing', url: 'https://assets.example/mt26-esp-swing-i02.webp', role: 'gallery', sortOrder: 2 },
      { alt: 'Swing', url: 'https://assets.example/mt26-esp-swing-i01.webp', role: 'main', sortOrder: 1 },
    ];
    render(<ProductGallery images={swingImages} productName="Swing" />);

    expect(screen.getByRole('img', { name: 'Swing, imagen principal' })).toHaveAttribute('src', swingImages[1].url);
    expect(screen.getAllByRole('button', { name: /Ver imagen/ })[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('preserves the active API image when a changed gallery keeps its first image', () => {
    const { rerender } = render(<ProductGallery images={images} productName="Royo" preserveInputOrder preserveActiveImageOnChange />);
    fireEvent.click(screen.getAllByRole('button', { name: /Ver imagen/ })[1]);
    rerender(<ProductGallery images={[...images, { alt: 'Alba extra', url: 'https://assets.example/alba-3.webp', role: 'detail' }]} productName="Royo" preserveInputOrder preserveActiveImageOnChange />);

    expect(screen.getByRole('img', { name: 'Royo, imagen principal' })).toHaveAttribute('src', images[1].url);
  });
  it('applies GME IO activation events without touching the selection', () => {
    const images = [
      { alt: 'A', url: '/cover.webp' },
      { alt: 'B', url: '/cromo.webp' },
      { alt: 'C', url: '/negro.webp' },
    ];
    const { rerender } = render(<ProductGallery images={images} productName="Fiore" />);
    expect(screen.getByRole('button', { name: /Ampliar imagen de Fiore/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }));
    rerender(<ProductGallery images={images} productName="Fiore" activation={{ eventId: 1, url: '/negro.webp' }} />);
    expect(screen.getByRole('button', { name: 'Imagen anterior' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Imagen siguiente' })).toBeDisabled();
    rerender(<ProductGallery images={images} productName="Fiore" activation={{ eventId: 2, url: '/cromo.webp' }} />);
    expect(screen.getAllByRole('button', { name: 'Imagen anterior' }).some((button) => !(button as HTMLButtonElement).disabled)).toBe(true);
    rerender(<ProductGallery images={images} productName="Fiore" activation={{ eventId: 3, url: '/missing.webp' }} />);
    expect(screen.getByRole('button', { name: /Ampliar imagen de Fiore/ })).toBeInTheDocument();
  });

  it('keeps manual navigation stable across rerenders without new finish events', () => {
    const images = [
      { alt: 'A', url: '/cover.webp' },
      { alt: 'B', url: '/cromo.webp' },
    ];
    const { rerender } = render(<ProductGallery images={images} productName="Fiore" />);
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }));
    rerender(<ProductGallery images={images} productName="Fiore" />);
    expect(screen.getAllByRole('button', { name: 'Imagen anterior' })[0]).not.toBeDisabled();
  });
});
