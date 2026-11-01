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
      url: 'https://vjs.zencdn.net/v/oceans.mp4',
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

  it('initializes with enhanced mode by default and supports compliant mode', async () => {
    player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      lazy: false
    });

    expect(player.mode).toBe('enhanced');
    expect(player.isEnhanced()).toBe(true);
    expect(player.isCompliant()).toBe(false);
    expect(container.classList.contains('mode-enhanced')).toBe(true);

    // Switch to compliant mode dynamically
    let modeChanged = false;
    player.events.on('change:mode', (m) => {
      modeChanged = m === 'compliant';
    });
    player.setMode('compliant');

    expect(player.mode).toBe('compliant');
    expect(player.isCompliant()).toBe(true);
    expect(player.isEnhanced()).toBe(false);
    expect(container.classList.contains('mode-compliant')).toBe(true);
    expect(modeChanged).toBe(true);
  });

  it('supports strictCompliance option at initialization', async () => {
    player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      strictCompliance: true,
      lazy: false
    });

    expect(player.mode).toBe('compliant');
    expect(player.isCompliant()).toBe(true);
    expect(container.classList.contains('mode-compliant')).toBe(true);
  });

  it('swaps provider cleanly before mounting in lazy mode without throwing', async () => {
    player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      lazy: true
    });

    expect(player._isMounted).toBe(false);
    expect(player._providerType).toBe('youtube');

    // Switch to HTML5 while still unmounted
    await player.load('https://vjs.zencdn.net/v/oceans.mp4');

    expect(player._providerType).toBe('html5');
    expect(player.provider.constructor.name).toBe('HTML5Provider');

    // Now mount explicitly
    await player.mount();
    expect(player._isMounted).toBe(true);
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
  });

  it('cleans up duplicate DOM elements when re-initializing or switching', async () => {
    player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      lazy: false
    });
    await player.mount();

    expect(container.querySelectorAll('.cyp-iframe-target').length).toBe(1);

    // Switch to HTML5
    await player.load('https://vjs.zencdn.net/v/oceans.mp4');
    expect(container.querySelectorAll('.cyp-iframe-target').length).toBe(0);
    expect(container.querySelectorAll('video').length).toBe(1);

    // Switch back to YouTube
    await player.load('M7lc1UVf-VE');
    expect(container.querySelectorAll('video').length).toBe(0);
    expect(container.querySelectorAll('.cyp-iframe-target').length).toBe(1);
  });
it('attaches and removes document visibilitychange listener without leaking', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const testPlayer = new Player({
      element: container,
      lazy: true
    });

    expect(typeof testPlayer._onVisibilityChange).toBe('function');
    expect(addSpy).toHaveBeenCalledWith('visibilitychange', testPlayer._onVisibilityChange);

    testPlayer.destroy();
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', testPlayer._onVisibilityChange);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
