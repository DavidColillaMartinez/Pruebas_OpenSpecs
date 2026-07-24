import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Vision } from './Vision';
import { chapterSteps } from '../../data/copy';

const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

afterEach(() => {
  play.mockClear();
  pause.mockClear();
});

describe('desktop Vision video compare flow', () => {
  it('goes from first autoplay directly to compare and keeps replay available', async () => {
    const setBlocked = vi.fn();
    const { container } = render(<Vision step={0} isActive setBlocked={setBlocked} />);
    const video = container.querySelector('video');

    expect(chapterSteps[3]).toBe(1);
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Revelar' })).not.toBeInTheDocument();

    fireEvent(video, new Event('ended'));

    expect(await screen.findByRole('slider', { name: 'Comparar boceto con imagen final' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reproducir video de nuevo' })).toBeInTheDocument();
    expect(setBlocked).toHaveBeenCalledWith(false);
  });

  it('pauses replay on exit and shows compare immediately on return', async () => {
    const setBlocked = vi.fn();
    const { container, rerender } = render(<Vision step={0} isActive setBlocked={setBlocked} />);
    const video = container.querySelector('video');

    fireEvent(video, new Event('ended'));
    await screen.findByRole('slider', { name: 'Comparar boceto con imagen final' });
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Comparar boceto con imagen final' }), { key: 'ArrowRight' });
    expect(screen.getByRole('slider', { name: 'Comparar boceto con imagen final' })).toHaveAttribute('aria-valuenow', '55');
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir video de nuevo' }));
    await waitFor(() => expect(screen.queryByRole('slider', { name: 'Comparar boceto con imagen final' })).not.toBeInTheDocument());
    fireEvent(video, new Event('ended'));
    expect((await screen.findByRole('slider', { name: 'Comparar boceto con imagen final' })).getAttribute('aria-valuenow')).toBe('50');

    rerender(<Vision step={0} isActive={false} setBlocked={setBlocked} />);
    expect(pause).toHaveBeenCalled();
    expect(setBlocked).toHaveBeenCalledWith(false);

    rerender(<Vision step={0} isActive setBlocked={setBlocked} />);
    expect(await screen.findByRole('slider', { name: 'Comparar boceto con imagen final' })).toBeInTheDocument();
  });
});
