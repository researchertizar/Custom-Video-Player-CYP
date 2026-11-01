// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { ProviderRegistry } from '../../src/providers/provider-registry.js';
import { Provider } from '../../src/providers/provider.js';
import { Player } from '../../src/core/player.js';

describe('ProviderRegistry & Open/Closed Architecture (S.O.L.I.D.)', () => {
  it('has default YouTube and HTML5 providers registered', () => {
    expect(ProviderRegistry.has('youtube')).toBe(true);
    expect(ProviderRegistry.has('html5')).toBe(true);
    expect(ProviderRegistry.getSupportedTypes()).toContain('youtube');
    expect(ProviderRegistry.getSupportedTypes()).toContain('html5');
  });

  it('rejects invalid provider registration with TypeError', () => {
    expect(() => ProviderRegistry.register('', class extends Provider {})).toThrow(TypeError);
    expect(() => ProviderRegistry.register('test', null)).toThrow(TypeError);
    expect(() => ProviderRegistry.register(123, class extends Provider {})).toThrow(TypeError);
  });

  it('allows registering and resolving a custom provider engine (e.g. HLS)', () => {
    class CustomHLSProvider extends Provider {
      constructor(emitter) {
        super(emitter);
        this.type = 'hls';
      }
      supportsQualityLevels() {
        return true;
      }
    }

    ProviderRegistry.register('hls', CustomHLSProvider);

    expect(ProviderRegistry.has('hls')).toBe(true);
    const ResolvedClass = ProviderRegistry.get('hls');
    expect(ResolvedClass).toBe(CustomHLSProvider);

    const instance = new ResolvedClass();
    expect(instance.type).toBe('hls');
    expect(instance.supportsQualityLevels()).toBe(true);
    expect(instance.supportsCaptions()).toBe(false);
  });

  it('exposes registerProvider on Player static and instance APIs', () => {
    class MockDashProvider extends Provider {
      constructor(emitter) {
        super(emitter);
        this.engine = 'dash';
      }
    }

    Player.registerProvider('dash', MockDashProvider);
    expect(ProviderRegistry.has('dash')).toBe(true);

    const container = document.createElement('div');
    const player = new Player({ element: container, lazy: true });
    expect(typeof player.registerProvider).toBe('function');

    player.destroy();
  });

  it('reports capability methods correctly across default providers', () => {
    const YouTubeClass = ProviderRegistry.get('youtube');
    const HTML5Class = ProviderRegistry.get('html5');

    const yt = new YouTubeClass();
    const h5 = new HTML5Class();

    expect(yt.supportsCaptions()).toBe(true);
    expect(yt.supportsQualityLevels()).toBe(true);
    expect(yt.supportsPictureInPicture()).toBe(false);

    expect(h5.supportsQualityLevels()).toBe(false);
  });
});
