// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { Controls } from '../../src/ui/controls.js';
import { EventEmitter } from '../../src/core/events.js';
import { Icons } from '../../src/ui/icons.js';

describe('Controls UI, Progressive Disclosure & Hierarchical Settings', () => {
  function createMockPlayer(options = {}) {
    const events = new EventEmitter();
    return {
      _options: options,
      events,
      on: (ev, fn) => events.on(ev, fn),
      emit: (ev, ...args) => events.emit(ev, ...args),
      togglePlay: vi.fn(),
      seekBy: vi.fn(),
      seekTo: vi.fn(),
      toggleMute: vi.fn(),
      setVolume: vi.fn(),
      isMuted: vi.fn(() => false),
      setPlaybackRate: vi.fn(),
      setPlaybackQuality: vi.fn(),
      toggleCaptions: vi.fn(),
      disableCaptions: vi.fn(),
      setCaptionTrack: vi.fn(),
      getActiveCaptionTrack: vi.fn(() => null)
    };
  }

  it('initializes with strict progressive disclosure (dead/empty controls are hidden)', () => {
    const player = createMockPlayer();
    const controls = new Controls(player);

    // Captions, Chapters, Quality nav should start hidden
    expect(controls.captionsBtn.style.display).toBe('none');
    expect(controls.chaptersBtn.style.display).toBe('none');
    expect(controls.captionsNavBtn.style.display).toBe('none');
    expect(controls.qualityNavBtn.style.display).toBe('none');

    // Playback Speed nav is standard and should be visible
    expect(controls.speedNavBtn.style.display).not.toBe('none');
    expect(controls.menuRootView.classList.contains('is-active')).toBe(true);
  });

  it('switches views hierarchically with back navigation and checkmarks', () => {
    const player = createMockPlayer();
    const controls = new Controls(player);

    // Click speed nav
    controls.speedNavBtn.click();
    expect(controls.speedSubView.classList.contains('is-active')).toBe(true);
    expect(controls.menuRootView.classList.contains('is-active')).toBe(false);

    // Click back button
    controls.speedBackBtn.click();
    expect(controls.menuRootView.classList.contains('is-active')).toBe(true);
    expect(controls.speedSubView.classList.contains('is-active')).toBe(false);

    // Selecting a speed rate updates rate and returns to root view
    const item15 = controls.speedItems.find((i) => i.getAttribute('data-speed') === '1.5');
    expect(item15).toBeDefined();
    item15.click();
    expect(player.setPlaybackRate).toHaveBeenCalledWith(1.5);
    expect(controls.menuRootView.classList.contains('is-active')).toBe(true);
    expect(controls.speedNavVal.textContent).toBe('1.5×');
  });

  it('dynamically reveals captions controls only when tracks arrive', () => {
    const player = createMockPlayer();
    const controls = new Controls(player);

    // Empty tracks list -> still hidden
    controls.updateCaptionsMenu([], null, false);
    expect(controls.captionsBtn.style.display).toBe('none');
    expect(controls.captionsNavBtn.style.display).toBe('none');

    // Tracks arrive -> progressively revealed
    const mockTracks = [
      { languageCode: 'en', displayName: 'English' },
      { languageCode: 'es', displayName: 'Spanish' }
    ];
    controls.updateCaptionsMenu(mockTracks, 'en', true);
    expect(controls.captionsBtn.style.display).toBe('');
    expect(controls.captionsNavBtn.style.display).toBe('flex');
    expect(controls.captionsNavVal.textContent).toBe('English');

    // Navigate to captions submenu
    controls.captionsNavBtn.click();
    expect(controls.captionsSubView.classList.contains('is-active')).toBe(true);

    // Back to root
    controls.captionsBackBtn.click();
    expect(controls.menuRootView.classList.contains('is-active')).toBe(true);
  });

  it('dynamically reveals quality navigation only when multiple quality levels exist', () => {
    const player = createMockPlayer();
    const controls = new Controls(player);

    // Only 1 level or empty -> hidden
    controls.updateQualityMenu(['auto'], 'auto');
    expect(controls.qualityNavBtn.style.display).toBe('none');

    // Multiple levels -> progressively revealed
    controls.updateQualityMenu(['hd1080', 'hd720', 'medium'], 'hd1080');
    expect(controls.qualityNavBtn.style.display).toBe('flex');
    expect(controls.qualityNavVal.textContent).toBe('1080p HD');

    // Submenu navigation
    controls.qualityNavBtn.click();
    expect(controls.qualitySubView.classList.contains('is-active')).toBe(true);

    controls.qualityBackBtn.click();
    expect(controls.menuRootView.classList.contains('is-active')).toBe(true);
  });

  it('updates mini player button state and labels correctly', () => {
    const player = createMockPlayer();
    const controls = new Controls(player);

    controls.setMiniState(true);
    expect(controls.miniBtn.getAttribute('title')).toContain('Expand to page');

    controls.setMiniState(false);
    expect(controls.miniBtn.getAttribute('title')).toContain('Mini player');
  });

  it('contains zero emojis in icons or standard buttons', () => {
    const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]/;
    for (const [name, svg] of Object.entries(Icons)) {
      expect(emojiRegex.test(svg), `Icon ${name} should not contain emojis`).toBe(false);
      expect(svg.trim().startsWith('<svg') || svg.trim().startsWith('<span'), `Icon ${name} should be valid SVG or markup`).toBe(true);
    }
  });
});
