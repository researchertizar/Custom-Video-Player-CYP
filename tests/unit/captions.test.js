import { describe, it, expect, vi } from 'vitest';
import { YouTubeProvider } from '../../src/providers/youtube/youtube-provider.js';
import { EventEmitter } from '../../src/core/events.js';

describe('Captions Support', () => {
  it('retrieves tracks and manages caption selection', () => {
    const emitter = new EventEmitter();
    const provider = new YouTubeProvider(emitter);

    const mockTracks = [
      { languageCode: 'en', displayName: 'English', kind: 'standard' },
      { languageCode: 'es', displayName: 'Spanish', kind: 'standard' }
    ];

    const mockYt = {
      loadModule: vi.fn(),
      getOption: vi.fn((module, opt) => {
        if (module === 'captions' && opt === 'tracklist') return mockTracks;
        if (module === 'captions' && opt === 'track') return { languageCode: 'en' };
        return null;
      }),
      setOption: vi.fn()
    };

    provider._yt = mockYt;
    provider._isReady = true;

    // Test getCaptionTracks
    const tracks = provider.getCaptionTracks();
    expect(tracks).toHaveLength(2);
    expect(tracks[0].languageCode).toBe('en');

    // Test getActiveCaptionTrack
    const active = provider.getActiveCaptionTrack();
    expect(active?.languageCode).toBe('en');

    // Test setCaptionTrack
    provider.setCaptionTrack('es');
    provider._flushQueue();
    expect(mockYt.setOption).toHaveBeenCalledWith('captions', 'track', { languageCode: 'es' });

    // Test turn off
    provider.setCaptionTrack(null);
    provider._flushQueue();
    expect(mockYt.setOption).toHaveBeenCalledWith('captions', 'track', {});
  });
});

