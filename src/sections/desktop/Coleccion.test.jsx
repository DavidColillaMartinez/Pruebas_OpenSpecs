import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Coleccion } from './Coleccion';

describe('Coleccion minimal presentation', () => {
  it('renders the minimal branch without card articles', () => {
    const { container } = render(<Coleccion step={5} isActive />);

    expect(screen.getByRole('heading', { name: 'Cuatro decisiones, una lectura.' })).toBeInTheDocument();
    expect(container.querySelectorAll('article')).toHaveLength(0);
  });
});
