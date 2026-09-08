import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Opiniones } from './Opiniones';

const { reviews } = vi.hoisted(() => ({ reviews: [] }));
vi.mock('../../data/reviewsContent', () => ({
  get googleReviews() {
    return reviews;
  },
}));

const REVIEW_ONE = { author: 'Ana', rating: 5, text: 'Instalación impecable.', googleUrl: 'https://maps.google.com/review-1' };
const REVIEW_TWO = { author: 'Luis', rating: 4, text: 'Muy buen trato y medidas exactas.', googleUrl: 'https://maps.google.com/review-2' };

describe('desktop Opiniones chapter', () => {
  beforeEach(() => {
    reviews.length = 0;
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the slogan and an honest empty state without verified reviews', () => {
    render(<Opiniones step={2} isActive />);
    expect(screen.getByRole('heading', { name: 'Juzga tú mismo.' })).toBeInTheDocument();
    expect(screen.getByText(/Pronto mostraremos aquí las reseñas verificadas de Google/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Reseñas de Google' })).not.toBeInTheDocument();
  });

  it('renders reviews with accessible stars and Google links', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO);
    render(<Opiniones step={2} isActive />);
    const region = screen.getByRole('region', { name: 'Reseñas de Google' });
    expect(region).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: '5 de 5 estrellas' })[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-1');
    expect(screen.getByRole('button', { name: 'Reseña siguiente' })).toBeInTheDocument();
  });

  it('advances manually and through the dots', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO);
    render(<Opiniones step={2} isActive />);
    fireEvent.click(screen.getByRole('button', { name: 'Reseña siguiente' }));
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-2');
    fireEvent.click(screen.getByRole('button', { name: 'Ver reseña 1' }));
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-1');
  });

  it('auto-plays every six seconds unless the pointer or keyboard holds focus', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO);
    vi.useFakeTimers();
    render(<Opiniones step={2} isActive />);
    const region = screen.getByRole('region', { name: 'Reseñas de Google' });
    fireEvent.focusIn(region);
    act(() => { vi.advanceTimersByTime(12_000); });
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-1');

    fireEvent.focusOut(region);
    act(() => { vi.advanceTimersByTime(6_000); });
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-2');
  });

  it('never auto-plays with reduced motion', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.useFakeTimers();
    render(<Opiniones step={2} isActive />);
    act(() => { vi.advanceTimersByTime(12_000); });
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-1');
  });

  it('shows reviewer avatars, dates, and an honest note for reviews without text', () => {
    reviews.push(
      { ...REVIEW_ONE, date: 'Hace un mes', image: '/reviews/ana.jpg' },
      { author: 'Laura', rating: 5, text: '', date: 'Hace 2 años', image: '/reviews/laura.jpg', googleUrl: 'https://maps.google.com/review-3' },
    );
    render(<Opiniones step={2} isActive />);
    const region = screen.getByRole('region', { name: 'Reseñas de Google' });
    const avatars = [...region.querySelectorAll('img')];
    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveAttribute('src', '/reviews/ana.jpg');
    expect(screen.getByText('Hace un mes')).toBeInTheDocument();
    expect(screen.getByText('Reseña sin comentario de texto.')).toBeInTheDocument();
  });

  it('reveals the slogan only from the first cascade step', () => {
    render(<Opiniones step={0} isActive />);
    const heading = screen.getByRole('heading', { name: 'Juzga tú mismo.' });
    expect(heading.closest('div').className).toContain('opacity-0');
  });
});
