/**
 * Native Custom Elements (Web Component) wrapper for Custom YouTube Player.
 * Usage:
 *   <custom-youtube-player video-id="dQw4w9WgXcQ" theme="dark"></custom-youtube-player>
 */

import { Player } from './core/player.js';
import { resumePlugin } from './plugins/resume.js';
import { keyboardPlugin } from './plugins/keyboard.js';
import { gesturesPlugin } from './plugins/gestures.js';

export class CustomYouTubePlayerElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'stream-token',
      'video-id',
      'url',
      'src',
      'preset',
      'theme',
      'autoplay',
      'lazy',
      'captions',
      'accent-color',
      'track-height',
      'radius',
      'poster',
      'logo'
    ];
  }

  constructor() {
    super();
    /** @type {Player|null} */
    this.player = null;
  }

  connectedCallback() {
    if (this.player) return;

    const target = this.getAttribute('stream-token') ||
      this.getAttribute('video-id') ||
      this.getAttribute('url') ||
      this.getAttribute('src') ||
      '';
    const preset = this.getAttribute('preset');
    const theme = this.getAttribute('theme') || 'dark';
    const autoplay = this.hasAttribute('autoplay');
    const lazy = this.getAttribute('lazy') !== 'false';
    const accentColor = this.getAttribute('accent-color');
    const trackHeight = this.getAttribute('track-height');
    const radius = this.getAttribute('radius');
    const poster = this.getAttribute('poster');
    let logo = null;
    const rawLogo = this.getAttribute('logo');
    if (rawLogo) {
      try {
        logo = JSON.parse(rawLogo);
      } catch {
        logo = { src: rawLogo };
      }
    }

    this.player = new Player({
      element: this,
      videoId: target,
      preset,
      theme,
      autoplay,
      lazy,
      accentColor,
      trackHeight,
      radius,
      poster,
      logo,
      plugins: [resumePlugin(), keyboardPlugin(), gesturesPlugin()]
    });
  }

  disconnectedCallback() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.player) return;

    if ((name === 'video-id' || name === 'src' || name === 'url' || name === 'stream-token') && newValue) {
      this.player.load(newValue);
    } else if (name === 'preset' && newValue) {
      this.player.applyPreset(newValue);
    } else if (name === 'theme' && newValue) {
      this.player.setTheme(newValue);
    } else if (name === 'captions') {
      if (newValue === 'true' || newValue === '') {
        this.player.enableCaptions();
      } else if (newValue === 'false') {
        this.player.disableCaptions();
      } else if (newValue) {
        this.player.enableCaptions(newValue);
      }
    } else if (name === 'accent-color') {
      this.player?.setAccentColor(newValue);
    } else if (name === 'track-height') {
      this.player?.setTrackHeight(newValue);
    } else if (name === 'radius') {
      this.player?.setRadius(newValue);
    } else if (name === 'poster') {
      this.player?.setPoster(newValue);
    } else if (name === 'logo') {
      try {
        this.player?.setLogo(JSON.parse(newValue));
      } catch {
        this.player?.setLogo({ src: newValue });
      }
    }
  }

  // Public component methods forwarding to the player instance
  load(videoId, startSeconds = 0) {
    this.player?.load(videoId, startSeconds);
  }

  setTheme(theme) {
    this.player?.setTheme(theme);
  }

  setAccentColor(color) {
    this.player?.setAccentColor(color);
  }

  setTrackHeight(height) {
    this.player?.setTrackHeight(height);
  }

  setRadius(radius) {
    this.player?.setRadius(radius);
  }

  setPoster(url) {
    this.player?.setPoster(url);
  }

  setLogo(logoOptions) {
    this.player?.setLogo(logoOptions);
  }

  setPlaybackQuality(quality) {
    this.player?.setPlaybackQuality(quality);
  }

  getAvailableQualityLevels() {
    return this.player?.getAvailableQualityLevels() || [];
  }

  toggleCaptions(lang) {
    this.player?.toggleCaptions(lang);
  }

  enableCaptions(lang) {
    this.player?.enableCaptions(lang);
  }

  disableCaptions() {
    this.player?.disableCaptions();
  }

  setCaptionTrack(lang) {
    this.player?.setCaptionTrack(lang);
  }

  getCaptionTracks() {
    return this.player?.getCaptionTracks() || [];
  }

  play() {
    this.player?.play();
  }

  pause() {
    this.player?.pause();
  }

  togglePlay() {
    this.player?.togglePlay();
  }

  seekTo(seconds) {
    this.player?.seekTo(seconds);
  }

  setVolume(value) {
    this.player?.setVolume(value);
  }

  mute() {
    this.player?.mute();
  }

  unmute() {
    this.player?.unmute();
  }
}

export class CustomVideoPlayerElement extends CustomYouTubePlayerElement {}

if (typeof window !== 'undefined' && 'customElements' in window) {
  if (!window.customElements.get('custom-youtube-player')) {
    window.customElements.define('custom-youtube-player', CustomYouTubePlayerElement);
  }
  if (!window.customElements.get('custom-video-player')) {
    window.customElements.define('custom-video-player', CustomVideoPlayerElement);
  }
}

