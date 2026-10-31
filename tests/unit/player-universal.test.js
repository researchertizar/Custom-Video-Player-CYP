// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Player } from '../../src/core/player.js';

describe('Player Universal Support', () => {
  let container;
  let player;

  beforeEach(() => {
    window.YT = {
      Player: vi.fn().mockImplementation((element, config) => {
        if (config?.events?.onReady) {
          setTimeout(() => config.events.onReady(), 0);
        }
        return {
          playVideo: vi.fn(),
          pauseVideo: vi.fn(),
          stopVideo: vi.fn(),
          seekTo: vi.fn(),
          getCurrentTime: vi.fn().mockReturnValue(0),
          getDuration: vi.fn().mockReturnValue(120),
          getVideoLoadedFraction: vi.fn().mockReturnValue(0.5),
          setVolume: vi.fn(),
          getVolume: vi.fn().mockReturnValue(100),
          isMuted: vi.fn().mockReturnValue(false),
          mute: vi.fn(),
          unMute: vi.fn(),
          setPlaybackRate: vi.fn(),
          getPlaybackRate: vi.fn().mockReturnValue(1),
          getVideoData: vi.fn().mockReturnValue({ title: 'Mock YouTube Video', author: '', video_id: 'dQw4w9WgXcQ' }),
          destroy: vi.fn()
        };
      }),
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
      }
    };
    container = document.createElement('div');
    container.id = 'player-test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    delete window.YT;
    if (player) {
      player.destroy();
      player = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('initializes HTML5 provider when given an MP4 URL', async () => {
    player = new Player({
      element: container,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      lazy: false
    });

    expect(player._providerType).toBe('html5');
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
  });

  it('initializes YouTube provider when given a YouTube ID', async () => {
    player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      lazy: false
    });

    expect(player._providerType).toBe('youtube');
  });

  it('can dynamically switch source from YouTube to HTML5 video', async () => {
    player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      lazy: false
    });

    expect(player._providerType).toBe('youtube');

    // Switch to HTML5 MP4
    await player.load('https://example.com/movie.mp4');
    expect(player._providerType).toBe('html5');
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
  });
});
