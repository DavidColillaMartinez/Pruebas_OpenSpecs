import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogFilterPanel } from './CatalogFilterPanel';

function Harness() {
  return (
    <CatalogFilterPanel
      facets={{ category: [{ value: 'mirrors', label: 'Espejos', count: 4 }] }}
      filters={{}}
      mobileOpen
      onMobileClose={() => undefined}
      onToggle={() => undefined}
    />
  );
}

describe('CatalogFilterPanel', () => {
  it('provides labelled fieldsets, counts and a modal mobile panel', () => {
    render(<Harness />);

    expect(screen.getByRole('dialog', { name: 'Filtrar' })).toBeInTheDocument();
    const dialog = screen.getByRole('dialog', { name: 'Filtrar' });
    expect(within(dialog).getByRole('group', { name: 'Categoría' })).toBeInTheDocument();
    expect(within(dialog).getByRole('checkbox', { name: 'Espejos' })).toBeInTheDocument();
    expect(within(dialog).getByText('4')).toBeInTheDocument();
  });

  it('restores the previous body overflow when the panel closes', () => {
    const onMobileClose = vi.fn();
    const view = render(
      <CatalogFilterPanel
        facets={{ category: [{ value: 'mirrors', label: 'Espejos', count: 4 }] }}
        filters={{}}
        mobileOpen
        onMobileClose={onMobileClose}
        onToggle={() => undefined}
      />,
    );

    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onMobileClose).toHaveBeenCalledOnce();
    view.rerender(
      <CatalogFilterPanel
        facets={{ category: [{ value: 'mirrors', label: 'Espejos', count: 4 }] }}
        filters={{}}
        mobileOpen={false}
        onMobileClose={onMobileClose}
        onToggle={() => undefined}
      />,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('supports keyboard dismissal and reports dynamic checkbox changes', () => {
    const onMobileClose = vi.fn();
    const onToggle = vi.fn();
    render(
      <CatalogFilterPanel
        facets={{ category: [{ value: 'mirrors', label: 'Espejos', count: 4 }] }}
        filters={{}}
        mobileOpen
        onMobileClose={onMobileClose}
        onToggle={onToggle}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filtrar' });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Espejos' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onToggle).toHaveBeenCalledWith('category', 'mirrors', true);
    expect(onMobileClose).toHaveBeenCalled();
  });
});
