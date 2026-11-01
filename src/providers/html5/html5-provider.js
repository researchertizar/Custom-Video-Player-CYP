/**
 * Concrete HTML5 Provider wrapping the native HTMLVideoElement.
 * Provides full playback controls, subtitles, and event mapping for standard video streams (MP4, WebM, OGG, direct URLs).
 */

import { Provider } from '../provider.js';
import { PlayerError, ErrorCode } from '../../core/errors.js';

export class HTML5Provider extends Provider {
  /**
   * @param {import('../../core/events.js').EventEmitter} emitter
   */
  constructor(emitter) {
    super(emitter);
    /** @type {HTMLVideoElement|null} */
    this._video = null;
    this._container = null;
    this._isReady = false;
    this._source = null;
    this._title = '';
    this._boundListeners = new Map();
  }

  /**
   * Helper to clean video file name for default title display.
   * @param {string|any} src
   * @returns {string}
   * @private
   */
  _extractTitle(src) {
    if (typeof src !== 'string') return 'Video';
    try {
      const url = new URL(src, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
      const filename = url.pathname.split('/').filter(Boolean).pop() || 'Video';
      return decodeURIComponent(filename).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    } catch {
      return 'Video';
    }
  }

  /**
   * @param {HTMLElement} container
   * @param {string|object|Array} source - Video URL, media descriptor, or array of sources.
   * @param {object} [options]
   * @returns {Promise<void>}
   */
  async init(container, source, options = {}) {
    if (this._video) {
      this.destroy();
    }
    this._container = container;
    if (this._container && typeof this._container.querySelectorAll === 'function') {
      const existing = this._container.querySelectorAll('.cyp-html5-video, video');
      existing.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
    this._source = source;
    this._title = options.title || this._extractTitle(source);

    return new Promise((resolve) => {
      this._video = document.createElement('video');
      this._video.className = 'cyp-html5-video';
      this._video.playsInline = true;
      this._video.setAttribute('playsinline', '');
      this._video.setAttribute('webkit-playsinline', '');
      if (options.crossorigin) {
        this._video.crossOrigin = options.crossorigin;
      }
      this._video.preload = options.preload || 'metadata';

      if (options.poster) {
        this._video.poster = options.poster;
      }
      if (options.muted) {
        this._video.muted = true;
      }
      if (options.loop) {
        this._video.loop = true;
      }

      // Populate source
      if (typeof source === 'string') {
        this._video.src = source;
      } else if (Array.isArray(source)) {
        for (const item of source) {
          const s = document.createElement('source');
          s.src = typeof item === 'string' ? item : item.src;
          if (item.type) s.type = item.type;
          this._video.appendChild(s);
        }
      } else if (source && typeof source === 'object' && source.src) {
        this._video.src = source.src;
        if (source.type) this._video.type = source.type;
      }

      // Subtitle / Caption tracks
      if (Array.isArray(options.tracks)) {
        for (const t of options.tracks) {
          const trackEl = document.createElement('track');
          trackEl.kind = t.kind || 'subtitles';
          trackEl.label = t.label || t.displayName || t.srclang || 'Captions';
          trackEl.srclang = t.srclang || t.languageCode || 'en';
          trackEl.src = t.src;
          if (t.default) trackEl.default = true;
          this._video.appendChild(trackEl);
        }
      }

      // Add to container
      this._container.appendChild(this._video);

      // Event listener helper
      const addEvt = (evtName, handler) => {
        this._video.addEventListener(evtName, handler);
        this._boundListeners.set(evtName, handler);
      };

      let readyResolved = false;
      const markReady = () => {
        if (!readyResolved) {
          readyResolved = true;
          this._isReady = true;
          if (options.startTime && options.startTime > 0) {
            this._video.currentTime = options.startTime;
          }
          this._emitter.emit('provider:ready');
          resolve();
        }
      };

      addEvt('loadedmetadata', () => {
        this._emitter.emit('durationchange', this.getDuration());
        this._syncCaptions();
        markReady();
      });

      addEvt('canplay', () => {
        markReady();
      });

      addEvt('play', () => {
        this._emitter.emit('play');
      });

      addEvt('playing', () => {
        this._emitter.emit('playing');
        this._emitter.emit('provider:statechange', { stateCode: 1, isAd: false });
      });

      addEvt('pause', () => {
        if (!this._video.ended) {
          this._emitter.emit('pause');
          this._emitter.emit('provider:statechange', { stateCode: 2, isAd: false });
        }
      });

      addEvt('waiting', () => {
        this._emitter.emit('buffering');
        this._emitter.emit('provider:statechange', { stateCode: 3, isAd: false });
      });

      addEvt('ended', () => {
        this._emitter.emit('ended');
        this._emitter.emit('provider:statechange', { stateCode: 0, isAd: false });
      });

      addEvt('timeupdate', () => {
        this._emitter.emit('timeupdate', this.getCurrentTime());
      });

      addEvt('volumechange', () => {
        this._emitter.emit('volumechange', {
          volume: this.getVolume(),
          muted: this.isMuted()
        });
      });

      addEvt('ratechange', () => {
        this._emitter.emit('ratechange', this.getPlaybackRate());
      });

      addEvt('progress', () => {
        this._emitter.emit('progress', this.getVideoLoadedFraction());
      });

      addEvt('error', () => {
        if (!this._video) return;
        const mediaErr = this._video ? this._video.error : null;
        const msg = mediaErr ? `HTML5 Video Error: code ${mediaErr.code} - ${mediaErr.message || 'Playback failed'}` : 'HTML5 Video Playback Error';
        const err = new PlayerError(ErrorCode.EMBED_NOT_ALLOWED, msg);
        this._emitter.emit('error', err);
        this._emitter.emit('provider:error', err);
      });

      // Autoplay attempt
      if (options.autoplay) {
        const playPromise = this._video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browsers may block unmuted autoplay; will resume when user clicks play
          });
        }
      }

      // Fallback timeout to ensure resolve even in synthetic/headless test environments
      setTimeout(() => {
        markReady();
      }, 300);
    });
  }

  play() {
    if (this._video) {
      const p = this._video.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn('[HTML5Provider] Play interrupted or blocked:', err);
        });
      }
    }
  }

  pause() {
    if (this._video) {
      this._video.pause();
    }
  }

  stop() {
    if (this._video) {
      this._video.pause();
      this._video.currentTime = 0;
    }
  }

  seekTo(seconds, allowSeekAhead = true) {
    if (this._video) {
      const maxTime = !isNaN(this._video.duration) && isFinite(this._video.duration)
        ? this._video.duration
        : seconds;
      this._video.currentTime = Math.max(0, Math.min(seconds, maxTime));
    }
  }

  getCurrentTime() {
    return this._video ? this._video.currentTime : 0;
  }

  getDuration() {
    if (this._video && !isNaN(this._video.duration) && isFinite(this._video.duration)) {
      return this._video.duration;
    }
    return 0;
  }

  getVideoLoadedFraction() {
    if (!this._video || !this._video.duration) return 0;
    try {
      const buf = this._video.buffered;
      if (buf && buf.length > 0) {
        return Math.min(1, buf.end(buf.length - 1) / this._video.duration);
      }
    } catch {
      return 0;
    }
    return 0;
  }

  setVolume(value) {
    if (this._video) {
      const normalized = Math.max(0, Math.min(1, value / 100));
      this._video.volume = normalized;
      if (value > 0 && this._video.muted) {
        this._video.muted = false;
      }
    }
  }

  getVolume() {
    return this._video ? Math.round(this._video.volume * 100) : 100;
  }

  mute() {
    if (this._video) {
      this._video.muted = true;
    }
  }

  unmute() {
    if (this._video) {
      this._video.muted = false;
    }
  }

  isMuted() {
    return Boolean(this._video && this._video.muted);
  }

  setPlaybackRate(rate) {
    if (this._video) {
      this._video.playbackRate = rate;
    }
  }

  getPlaybackRate() {
    return this._video ? this._video.playbackRate : 1;
  }

  loadVideo(source, startSeconds = 0) {
    this._source = source;
    this._title = this._extractTitle(source);
    if (this._video) {
      if (typeof source === 'string') {
        this._video.src = source;
      } else if (source && typeof source === 'object' && source.src) {
        this._video.src = source.src;
      }
      this._video.load();
      if (startSeconds > 0) {
        this._video.currentTime = startSeconds;
      }
      this._video.play().catch(() => {});
    }
  }

  getVideoData() {
    return {
      title: this._title,
      author: '',
      videoId: typeof this._source === 'string' ? this._source : ''
    };
  }

  /**
   * Synchronizes textTracks from the native video element.
   * @private
   */
  _syncCaptions() {
    const tracks = this.getCaptionTracks();
    const activeTrack = this.getActiveCaptionTrack();
    this._emitter.emit('captions:update', {
      tracks,
      activeTrack,
      enabled: Boolean(activeTrack && activeTrack.languageCode)
    });
  }

  /**
   * Returns list of available subtitle/caption tracks.
   * @returns {Array<{ languageCode: string, displayName: string, kind: string }>}
   */
  getCaptionTracks() {
    if (!this._video || !this._video.textTracks) return [];
    const list = [];
    for (let i = 0; i < this._video.textTracks.length; i++) {
      const t = this._video.textTracks[i];
      list.push({
        languageCode: t.language || `track-${i}`,
        displayName: t.label || t.language || `Track ${i + 1}`,
        kind: t.kind || 'subtitles'
      });
    }
    return list;
  }

  /**
   * Retrieves current active subtitle track or null.
   * @returns {{ languageCode: string, displayName: string }|null}
   */
  getActiveCaptionTrack() {
    if (!this._video || !this._video.textTracks) return null;
    for (let i = 0; i < this._video.textTracks.length; i++) {
      const t = this._video.textTracks[i];
      if (t.mode === 'showing') {
        return {
          languageCode: t.language || `track-${i}`,
          displayName: t.label || t.language || `Track ${i + 1}`
        };
      }
    }
    return null;
  }

  /**
   * Sets active caption language track.
   * @param {string|null} languageCode
   */
  setCaptionTrack(languageCode) {
    if (!this._video || !this._video.textTracks) return;
    for (let i = 0; i < this._video.textTracks.length; i++) {
      const t = this._video.textTracks[i];
      const match = (t.language && t.language === languageCode) || `track-${i}` === languageCode;
      t.mode = (match && languageCode) ? 'showing' : 'disabled';
    }
    this._syncCaptions();
  }

  getAvailableQualityLevels() {
    return ['auto'];
  }

  getPlaybackQuality() {
    return 'auto';
  }

  setPlaybackQuality(quality) {
    // No-op for direct HTML5 video stream
  }

  /**
   * Request native picture in picture if supported by browser.
   * @returns {Promise<PictureInPictureWindow|void>}
   */
  async requestPictureInPicture() {
    if (this._video && typeof this._video.requestPictureInPicture === 'function') {
      return this._video.requestPictureInPicture();
    }
  }

  supportsPictureInPicture() {
    return Boolean(typeof document !== 'undefined' && (document.pictureInPictureEnabled || this._video?.requestPictureInPicture));
  }

  supportsCaptions() {
    return Boolean(this._video && this._video.textTracks && this._video.textTracks.length > 0);
  }

  supportsQualityLevels() {
    return false;
  }

  destroy() {
    if (this._video) {
      for (const [evt, handler] of this._boundListeners.entries()) {
        this._video.removeEventListener(evt, handler);
      }
      this._boundListeners.clear();
      this._video.pause();
      this._video.removeAttribute('src');
      if (this._video.parentNode) {
        this._video.parentNode.removeChild(this._video);
      }
      this._video = null;
    }
    this._video = null;
    this._isReady = false;
    this._container = null;
  }
}

