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
const REVIEW_THREE = { author: 'Mar', rating: 5, text: 'Plazo y acabado perfectos.', googleUrl: 'https://maps.google.com/review-3' };

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

  it('gives each review its own card with the previous and next layered behind', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO, REVIEW_THREE);
    const { container } = render(<Opiniones step={2} isActive />);
    const figures = [...container.querySelectorAll('figure')];
    expect(figures).toHaveLength(3);
    expect(figures[0].style.transform).toContain('scale(1)');
    expect(figures[0].style.zIndex).toBe('20');
    expect(figures[1].style.transform).toContain('translateX(52%)');
    expect(figures[1].style.transform).toContain('translateY(10%)');
    expect(figures[2].style.transform).toContain('translateX(-52%)');
    expect(figures[2].style.transform).toContain('translateY(-10%)');
    expect(figures[1].style.zIndex).toBe('10');
    expect(figures[2].style.zIndex).toBe('10');
  });

  it('glides all cards in one simultaneous mechanical move', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO, REVIEW_THREE);
    const { container } = render(<Opiniones step={2} isActive />);
    const figures = [...container.querySelectorAll('figure')];
    figures.forEach((figure) => {
      expect(figure.style.transition).toContain('700ms');
      expect(figure.style.transition).toContain('cubic-bezier(0.75, 0, 0.18, 1)');
      expect(figure.style.transition).toContain('transform');
    });
  });

  it('keeps inactive cards out of the accessibility and tab order', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO, REVIEW_THREE);
    const { container } = render(<Opiniones step={2} isActive />);
    const figures = [...container.querySelectorAll('figure')];
    expect(figures[0].getAttribute('aria-hidden')).not.toBe('true');
    expect(figures[1].getAttribute('aria-hidden')).toBe('true');
    expect(figures[1].hasAttribute('inert')).toBe(true);
    expect(figures[1].querySelector('a')).toHaveAttribute('tabindex', '-1');
  });

  it('advances manually and through the dots', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO);
    render(<Opiniones step={2} isActive />);
    fireEvent.click(screen.getByRole('button', { name: 'Reseña siguiente' }));
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-2');
    fireEvent.click(screen.getByRole('button', { name: 'Ver reseña 1' }));
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-1');
  });

  it('auto-plays every four seconds unless the pointer or keyboard holds focus', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO, REVIEW_THREE);
    vi.useFakeTimers();
    render(<Opiniones step={2} isActive />);
    const region = screen.getByRole('region', { name: 'Reseñas de Google' });
    fireEvent.focusIn(region);
    act(() => { vi.advanceTimersByTime(12_000); });
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-1');

    fireEvent.focusOut(region);
    act(() => { vi.advanceTimersByTime(4_000); });
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-2');
  });

  it('auto-plays through all thirteen reviews and wraps back to the first', () => {
    reviews.push(...Array.from({ length: 13 }, (_, i) => ({
      author: `Cliente ${i + 1}`,
      rating: 5,
      text: `Reseña ${i + 1}.`,
      googleUrl: `https://maps.google.com/review-${i + 1}`,
    })));
    vi.useFakeTimers();
    render(<Opiniones step={2} isActive />);
    const activeDotNumber = () => {
      for (let n = 1; n <= 13; n += 1) {
        if (screen.getByRole('button', { name: `Ver reseña ${n}` }).getAttribute('aria-current') === 'true') return n;
      }
      return 0;
    };

    const sequence = [];
    for (let tick = 0; tick < 13; tick += 1) {
      act(() => { vi.advanceTimersByTime(4_000); });
      sequence.push(activeDotNumber());
    }
    expect(sequence).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1]);
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-1');
  });

  it('resumes autoplay after manual navigation even while the control keeps focus', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO, REVIEW_THREE);
    vi.useFakeTimers();
    render(<Opiniones step={2} isActive />);
    const next = screen.getByRole('button', { name: 'Reseña siguiente' });
    fireEvent.focusIn(next);
    fireEvent.click(next);
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-2');

    act(() => { vi.advanceTimersByTime(4_000); });
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-3');
  });

  it('resumes autoplay after jumping through the dots', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO, REVIEW_THREE);
    vi.useFakeTimers();
    render(<Opiniones step={2} isActive />);
    fireEvent.focusIn(screen.getByRole('button', { name: 'Ver reseña 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver reseña 2' }));
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-2');

    act(() => { vi.advanceTimersByTime(4_000); });
    expect(screen.getByRole('link', { name: 'Ver en Google' })).toHaveAttribute('href', 'https://maps.google.com/review-3');
  });

  it('never auto-plays with reduced motion', () => {
    reviews.push(REVIEW_ONE, REVIEW_TWO, REVIEW_THREE);
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
