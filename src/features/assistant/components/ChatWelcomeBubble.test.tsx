import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ASSISTANT_WELCOME_STORAGE_KEY } from './chatWelcomeStorage';
import { ChatWelcomeBubble } from './ChatWelcomeBubble';

const OPEN_BUTTON = 'Abrir el chat con el asistente de Area LRMQ';
const CLOSE_BUTTON = 'Cerrar la sugerencia del asistente';

beforeEach(() => {
  sessionStorage.clear();
});

describe('ChatWelcomeBubble', () => {
  it('appears only after the agreed short delay', () => {
    vi.useFakeTimers();
    try {
      render(<ChatWelcomeBubble onOpen={vi.fn()} />);
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();

      act(() => { vi.advanceTimersByTime(1199); });
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();

      act(() => { vi.advanceTimersByTime(1); });
      expect(screen.getByRole('button', { name: OPEN_BUTTON })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('auto-hides after the delay and keeps it dismissed for the rest of the session', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<ChatWelcomeBubble onOpen={vi.fn()} />);

      act(() => { vi.advanceTimersByTime(1200); });
      expect(screen.getByRole('button', { name: OPEN_BUTTON })).toBeInTheDocument();

      act(() => { vi.advanceTimersByTime(8000); });
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();
      expect(sessionStorage.getItem(ASSISTANT_WELCOME_STORAGE_KEY)).toBe('dismissed');

      unmount();
      render(<ChatWelcomeBubble onOpen={vi.fn()} />);
      act(() => { vi.advanceTimersByTime(3000); });
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses the auto-hide while the pointer or focus is over the bubble', () => {
    vi.useFakeTimers();
    try {
      render(<ChatWelcomeBubble onOpen={vi.fn()} />);
      act(() => { vi.advanceTimersByTime(1200); });

      fireEvent.mouseEnter(screen.getByLabelText('Sugerencia del asistente de Area LRMQ'));
      act(() => { vi.advanceTimersByTime(9000); });
      expect(screen.getByRole('button', { name: OPEN_BUTTON })).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByLabelText('Sugerencia del asistente de Area LRMQ'));
      act(() => { vi.advanceTimersByTime(8000); });
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens the chat and dismisses itself for the rest of the session', () => {
    const onOpen = vi.fn();
    vi.useFakeTimers();
    try {
      const { unmount } = render(<ChatWelcomeBubble onOpen={onOpen} />);
      act(() => { vi.advanceTimersByTime(1200); });

      fireEvent.click(screen.getByRole('button', { name: OPEN_BUTTON }));
      expect(onOpen).toHaveBeenCalledOnce();
      expect(sessionStorage.getItem(ASSISTANT_WELCOME_STORAGE_KEY)).toBe('dismissed');
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();

      unmount();
      render(<ChatWelcomeBubble onOpen={onOpen} />);
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the bubble hidden for the rest of the session after a manual close', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<ChatWelcomeBubble onOpen={vi.fn()} />);
      act(() => { vi.advanceTimersByTime(1200); });

      fireEvent.click(screen.getByRole('button', { name: CLOSE_BUTTON }));
      expect(sessionStorage.getItem(ASSISTANT_WELCOME_STORAGE_KEY)).toBe('dismissed');
      expect(screen.queryByRole('button', { name: CLOSE_BUTTON })).not.toBeInTheDocument();

      unmount();
      render(<ChatWelcomeBubble onOpen={vi.fn()} />);
      act(() => { vi.advanceTimersByTime(1200); });
      expect(screen.queryByRole('button', { name: OPEN_BUTTON })).not.toBeInTheDocument();

      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
