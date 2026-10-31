// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from '../../src/core/events.js';
import { HTML5Provider } from '../../src/providers/html5/html5-provider.js';

describe('HTML5Provider', () => {
  let emitter;
  let container;
  let provider;

  beforeEach(() => {
    emitter = new EventEmitter();
    container = document.createElement('div');
    document.body.appendChild(container);
    provider = new HTML5Provider(emitter);
  });

  afterEach(() => {
    if (provider) {
      provider.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('initializes and appends video element to container', async () => {
    await provider.init(container, 'https://example.com/video.mp4', {
      title: 'Sample Video'
    });

    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video.src).toBe('https://example.com/video.mp4');
    expect(provider.getVideoData().title).toBe('Sample Video');
  });

  it('supports volume and mute controls', async () => {
    await provider.init(container, 'https://example.com/test.mp4');

    provider.setVolume(75);
    expect(provider.getVolume()).toBe(75);

    provider.mute();
    expect(provider.isMuted()).toBe(true);

    provider.unmute();
    expect(provider.isMuted()).toBe(false);
  });

  it('supports playback rate controls', async () => {
    await provider.init(container, 'https://example.com/test.mp4');

    provider.setPlaybackRate(1.5);
    expect(provider.getPlaybackRate()).toBe(1.5);
  });

  it('supports seekTo within bounds', async () => {
    await provider.init(container, 'https://example.com/test.mp4');
    provider.seekTo(10);
    expect(provider.getCurrentTime()).toBe(10);
  });

  it('handles loadVideo dynamically', async () => {
    await provider.init(container, 'https://example.com/first.mp4');
    provider.loadVideo('https://example.com/second.mp4', 5);

    const video = container.querySelector('video');
    expect(video.src).toBe('https://example.com/second.mp4');
  });
});
