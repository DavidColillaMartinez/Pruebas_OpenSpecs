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
    expect(dialog).toHaveClass('bg-surface-elevated');
    for (const label of ['Inicio', 'Quiénes somos', 'Colección', 'Reformas', 'Visión', 'Opiniones', 'Contacto']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Tienda' })).toHaveAttribute('href', '/productos');
    fireEvent.click(screen.getByRole('link', { name: 'Tienda' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('moves focus into the drawer on open and wraps Tab back to the first control', () => {
    render(
      <MemoryRouter>
        <MobileDrawer activeSectionId="inicio" onNavigate={vi.fn()} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    const closeButton = screen.getByRole('button', { name: 'Cerrar menú' });
    expect(closeButton).toHaveFocus();

    const lastLink = screen.getByRole('link', { name: 'Pedir asesoría' });
    lastLink.focus();
    fireEvent.keyDown(lastLink, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });
});
