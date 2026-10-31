import { describe, it, expect, vi } from 'vitest';
import { YouTubeProvider } from '../../src/providers/youtube/youtube-provider.js';
import { EventEmitter } from '../../src/core/events.js';

describe('YouTubeProvider Command Queue', () => {
  it('queues commands until onReady fires', async () => {
    const emitter = new EventEmitter();
    const provider = new YouTubeProvider(emitter);

    // Mock internal YT.Player
    const mockYt = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
      setVolume: vi.fn()
    };

    // Before ready: commands should be queued
    provider.play();
    provider.pause();
    provider.seekTo(45);
    provider.setVolume(80);

    expect(mockYt.playVideo).not.toHaveBeenCalled();
    expect(mockYt.pauseVideo).not.toHaveBeenCalled();

    // Attach mock player and trigger onReady
    provider._yt = mockYt;
    provider._isReady = true;
    provider._flushQueue();

    // All queued commands should have executed in sequence
    expect(mockYt.playVideo).toHaveBeenCalledTimes(1);
    expect(mockYt.pauseVideo).toHaveBeenCalledTimes(1);
    expect(mockYt.seekTo).toHaveBeenCalledWith(45, true);
    expect(mockYt.setVolume).toHaveBeenCalledWith(80);
  });
});
