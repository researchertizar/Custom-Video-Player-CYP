// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { YouTubeProvider } from '../../src/providers/youtube/youtube-provider.js';
import { EventEmitter } from '../../src/core/events.js';
import { Player } from '../../src/core/player.js';
import { PlayerPresets } from '../../src/core/presets.js';

describe('Player Customization & Quality API', () => {
  it('manages quality levels and sets playback quality', () => {
    const emitter = new EventEmitter();
    const provider = new YouTubeProvider(emitter);

    const mockYt = {
      getAvailableQualityLevels: vi.fn(() => ['hd1080', 'hd720', 'medium', 'auto']),
      getPlaybackQuality: vi.fn(() => 'hd1080'),
      setPlaybackQuality: vi.fn()
    };

    provider._yt = mockYt;
    provider._isReady = true;

    // Available quality levels
    const levels = provider.getAvailableQualityLevels();
    expect(levels).toEqual(['hd1080', 'hd720', 'medium', 'auto']);

    // Current quality
    expect(provider.getPlaybackQuality()).toBe('hd1080');

    // Set quality
    const qualityHandler = vi.fn();
    emitter.on('quality:change', qualityHandler);

    provider.setPlaybackQuality('hd720');
    provider._flushQueue();

    expect(mockYt.setPlaybackQuality).toHaveBeenCalledWith('hd720');
    expect(qualityHandler).toHaveBeenCalledWith('hd720');
  });

  it('handles empty quality levels gracefully', () => {
    const emitter = new EventEmitter();
    const provider = new YouTubeProvider(emitter);
    expect(provider.getAvailableQualityLevels()).toEqual([]);
    expect(provider.getPlaybackQuality()).toBe('auto');
  });

  it('provides complete developer preset models', () => {
    const expectedPresets = ['glass', 'minimal', 'professional', 'cyber', 'cinema', 'dark'];
    for (const key of expectedPresets) {
      const preset = PlayerPresets[key];
      expect(preset, `Preset "${key}" should be defined`).toBeDefined();
      expect(preset.name).toBeTruthy();
      expect(preset.theme).toBeTruthy();
      expect(preset.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof preset.radius).toBe('number');
      expect(typeof preset.trackHeight).toBe('number');
    }
  });

  it('correctly applies themes and clears overriding inline accents', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      accentColor: '#ff0000',
      theme: 'dark'
    });

    expect(container.classList.contains('theme-dark')).toBe(true);
    expect(container.style.getPropertyValue('--cyp-accent')).toBe('#ff0000');

    // Switching theme to cinema should clear overriding inline accent so theme variable takes effect
    player.setTheme('cinema');
    expect(container.classList.contains('theme-cinema')).toBe(true);
    expect(container.classList.contains('theme-dark')).toBe(false);
    expect(container.style.getPropertyValue('--cyp-accent')).toBe('');
  });

  it('applies developer preset models via applyPreset() and emits events', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const player = new Player({
      element: container,
      videoId: 'dQw4w9WgXcQ',
      preset: 'glass'
    });

    expect(container.classList.contains('theme-glass')).toBe(true);
    expect(container.style.getPropertyValue('--cyp-accent')).toBe('#00f2fe');
    expect(container.style.getPropertyValue('--cyp-radius')).toBe('16px');

    const presetListener = vi.fn();
    player.on('change:preset', presetListener);

    // Apply cyber preset
    player.applyPreset('cyber');
    expect(container.classList.contains('theme-cyber')).toBe(true);
    expect(container.style.getPropertyValue('--cyp-accent')).toBe('#00ffcc');
    expect(container.style.getPropertyValue('--cyp-radius')).toBe('2px');
    expect(presetListener).toHaveBeenCalledWith('cyber', PlayerPresets.cyber);
  });
});
