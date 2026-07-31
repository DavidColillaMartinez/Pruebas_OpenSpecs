import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogFilterPanel } from './CatalogFilterPanel';

function Harness() {
  return (
    <CatalogFilterPanel
      facets={{ category: [{ value: 'mirrors', label: 'Espejos', count: 4 }] }}
      filters={{}}
      profile="root"
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
    expect(within(dialog).getByRole('button', { name: 'Categoría' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(dialog).queryByRole('checkbox', { name: 'Espejos' })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Categoría' }));
    expect(within(dialog).getByRole('button', { name: 'Categoría' })).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('checkbox', { name: /Espejos/ })).toHaveAccessibleDescription('4 resultados');
    expect(within(dialog).getByText('4')).toBeInTheDocument();
  });

  it('restores the previous body overflow when the panel closes', () => {
    const onMobileClose = vi.fn();
    const view = render(
      <CatalogFilterPanel
        facets={{ category: [{ value: 'mirrors', label: 'Espejos', count: 4 }] }}
        filters={{}}
        profile="root"
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
        profile="root"
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
        profile="root"
        mobileOpen
        onMobileClose={onMobileClose}
        onToggle={onToggle}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filtrar' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Categoría' }));
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /Espejos/ }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onToggle).toHaveBeenCalledWith('category', 'mirrors', true);
    expect(onMobileClose).toHaveBeenCalled();
  });

  it('orders Mamparas facets and exposes every API option', () => {
    const facets = {
      finish: [{ value: 'Cromo', label: 'Cromo', count: 21 }],
      distribution: Array.from({ length: 10 }, (_, index) => ({ value: `distribution-${index + 1}`, label: `Distribución ${index + 1}`, count: index + 1 })),
      collection: [{ value: 'Open', label: 'Open', count: 1 }],
      subcategory: [{ value: 'Mamparas de ducha', label: 'Mamparas de ducha', count: 17 }],
    };
    render(
      <CatalogFilterPanel
        facets={facets}
        filters={{}}
        profile="mamparas"
        mobileOpen
        onMobileClose={() => undefined}
        onToggle={() => undefined}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filtrar' });
    expect([...dialog.querySelectorAll('fieldset legend button')].map((button) => button.textContent?.trim())).toEqual([
      'Tipo+',
      'Modelo+',
      'Distribución+',
      'Acabado+',
    ]);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Distribución' }));
    expect(within(dialog).queryByRole('checkbox', { name: 'Distribución 9' })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ver todas' }));
    expect(within(dialog).getByRole('checkbox', { name: /Distribución 9/ })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Ver menos' })).toBeInTheDocument();
  });

  it('keeps a selected option visible when a long facet is collapsed', () => {
    const facets = {
      distribution: Array.from({ length: 10 }, (_, index) => ({ value: `distribution-${index + 1}`, label: `Distribución ${index + 1}`, count: 1 })),
    };
    render(
      <CatalogFilterPanel
        facets={facets}
        filters={{ distribution: ['distribution-10'] }}
        profile="mamparas"
        mobileOpen
        onMobileClose={() => undefined}
        onToggle={() => undefined}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filtrar' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Distribución' }));
    expect(within(dialog).getByRole('checkbox', { name: /Distribución 10/ })).toBeChecked();
  });
});
