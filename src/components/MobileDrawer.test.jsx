import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MobileDrawer } from './MobileDrawer';

describe('MobileDrawer', () => {
  it('keeps the page surface and exposes the mobile catalog action', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <MobileDrawer activeSectionId="inicio" onNavigate={vi.fn()} onClose={onClose} />
      </MemoryRouter>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Menú de navegación' });
    expect(dialog).toHaveClass('bg-white');
    expect(screen.getByRole('link', { name: 'Tienda' })).toHaveAttribute('href', '/productos');
    fireEvent.click(screen.getByRole('link', { name: 'Tienda' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
