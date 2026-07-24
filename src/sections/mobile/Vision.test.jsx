import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MobileVision } from './Vision';

const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

afterEach(() => play.mockClear());

describe('mobile Vision video compare flow', () => {
  it('passes directly from playback to compare and replays from compare', () => {
    const { container } = render(<MobileVision reducedMotion={false} />);
    const video = container.querySelector('video');

    expect(screen.queryByRole('button', { name: 'Revelar' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir boceto' }));
    fireEvent(video, new Event('ended'));

    expect(screen.getByRole('slider', { name: 'Comparar boceto con imagen final' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reproducir video de nuevo' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Comparar boceto con imagen final' }), { key: 'ArrowRight' });
    expect(screen.getByRole('slider', { name: 'Comparar boceto con imagen final' })).toHaveAttribute('aria-valuenow', '55');
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir video de nuevo' }));
    expect(play).toHaveBeenCalledTimes(2);
    fireEvent(video, new Event('ended'));
    expect(screen.getByRole('slider', { name: 'Comparar boceto con imagen final' })).toHaveAttribute('aria-valuenow', '50');
  });
});
