import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AssistantProvider } from './model/assistantStore';
import { AssistantShell } from './AssistantShell';

describe('on-demand assistant panel', () => {
  it('stays inactive until opened and preserves the draft and focus across closing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    try {
      render(<MemoryRouter><AssistantProvider><AssistantShell /></AssistantProvider></MemoryRouter>);
      const launcher = screen.getByRole('button', { name: 'Abrir el asistente de Area LRMQ' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      launcher.focus();
      fireEvent.click(launcher);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      const input = screen.getByRole('textbox');
      await waitFor(() => expect(input).toHaveFocus());
      fireEvent.change(input, { target: { value: 'Un borrador sin enviar' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(launcher).toHaveFocus();
      fireEvent.click(launcher);
      expect(screen.getByRole('textbox')).toHaveValue('Un borrador sin enviar');
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
