/**
 * Concrete YouTube Provider wrapping the official YouTube IFrame Player API.
 */

import { Provider } from '../provider.js';
import { youtubeLoader } from './youtube-loader.js';
import { mapYouTubeError, PlayerError, ErrorCode } from '../../core/errors.js';

export class YouTubeProvider extends Provider {
  /**
   * @param {import('../../core/events.js').EventEmitter} emitter
   */
  constructor(emitter) {
    super(emitter);
    /** @type {any} */
    this._yt = null;
    this._isReady = false;
    this._mountElement = null;
    this._container = null;
    this._lastState = -1;
    /** @type {Array<Function>} */
    this._commandQueue = [];
  }

  /**
   * Enqueues a command to run once the YouTube API is ready, or runs immediately if already ready.
   * @param {Function} fn
   * @private
   */
  _enqueue(fn) {
    if (this._isReady && this._yt) {
      try {
        fn();
      } catch (err) {
        console.warn('[YouTubeProvider] Error executing command:', err);
      }
    } else {
      this._commandQueue.push(fn);
    }
  }

  /**
   * Flushes all queued commands after onReady fires.
   * @private
   */
  _flushQueue() {
    while (this._commandQueue.length > 0) {
      const fn = this._commandQueue.shift();
      try {
        fn();
      } catch (err) {
        console.warn('[YouTubeProvider] Error executing queued command:', err);
      }
    }
  }

  /**
   * @param {HTMLElement} container
   * @param {string} videoId
   * @param {object} [options]
   * @returns {Promise<void>}
   */
  async init(container, videoId, options = {}) {
    if (this._yt) {
      this.destroy();
    }
    this._container = container;
    if (this._container && typeof this._container.querySelectorAll === 'function') {
      const existing = this._container.querySelectorAll('.cyp-iframe-target, iframe');
      existing.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
    await youtubeLoader.load();

    return new Promise((resolve, reject) => {
      this._mountElement = document.createElement('div');
      this._mountElement.className = 'cyp-iframe-target';
      this._container.appendChild(this._mountElement);

      const playerVars = {
        controls: 0,
        playsinline: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1,
        modestbranding: 1,
        enablejsapi: 1,
        ...options.playerVars
      };

      // Safely configure origin for postMessage communication
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        if (window.location.protocol.startsWith('http')) {
          playerVars.origin = window.location.origin;
        }
      }

      if (options.autoplay) {
        playerVars.autoplay = 1;
      }
      if (options.startTime) {
        playerVars.start = Math.floor(options.startTime);
      }
      if (options.captions) {
        playerVars.cc_load_policy = 1;
      }
      if (options.captionLanguage) {
        playerVars.cc_lang_pref = options.captionLanguage;
      }

      try {
        const host = options.host || 'https://www.youtube-nocookie.com';
        this._yt = new window.YT.Player(this._mountElement, {
          host,
          videoId,
          playerVars,
          events: {
            onReady: () => {
              this._isReady = true;
              this._flushQueue();
              this._loadCaptionsModule();
              this._emitter.emit('provider:ready');
              resolve();
            },
            onStateChange: (event) => {
              this._handleStateChange(event.data);
            },
            onApiChange: () => {
              this._handleApiChange();
            },
            onPlaybackQualityChange: (event) => {
              this._emitter.emit('quality:change', event.data);
            },
            onError: (event) => {
              const err = mapYouTubeError(event.data);
              this._emitter.emit('error', err);
              this._emitter.emit('provider:error', err);
            }
          }
        });
      } catch (err) {
        reject(new PlayerError(ErrorCode.API_LOAD_FAILED, 'Failed to instantiate YT.Player.', err));
      }
    });
  }

  /**
   * Translates YouTube state codes to normalized player events.
   * @param {number} stateCode
   */
  _handleStateChange(stateCode) {
    this._lastState = stateCode;
    const YT = window.YT;
    if (!YT) return;

    switch (stateCode) {
      case YT.PlayerState.PLAYING:
        this._emitter.emit('playing');
        break;
      case YT.PlayerState.PAUSED:
        this._emitter.emit('pause');
        break;
      case YT.PlayerState.BUFFERING:
        this._emitter.emit('buffering');
        break;
      case YT.PlayerState.ENDED:
        this._emitter.emit('ended');
        break;
      case YT.PlayerState.CUED:
        this._emitter.emit('cued');
        break;
      default:
        break;
    }

    // Check if currently playing an ad
    const isAd = Boolean(
      this._yt &&
      typeof this._yt.getAdState === 'function' &&
      this._yt.getAdState() === 1
    );

    this._emitter.emit('provider:statechange', { stateCode, isAd });
  }

  play() {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.playVideo === 'function') {
        this._yt.playVideo();
      }
    });
  }

  pause() {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.pauseVideo === 'function') {
        this._yt.pauseVideo();
      }
    });
  }

  stop() {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.stopVideo === 'function') {
        this._yt.stopVideo();
      }
    });
  }

  seekTo(seconds, allowSeekAhead = true) {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.seekTo === 'function') {
        this._yt.seekTo(seconds, allowSeekAhead);
      }
    });
  }

  getCurrentTime() {
    if (this._isReady && this._yt && typeof this._yt.getCurrentTime === 'function') {
      return this._yt.getCurrentTime() || 0;
    }
    return 0;
  }

  getDuration() {
    if (this._isReady && this._yt && typeof this._yt.getDuration === 'function') {
      return this._yt.getDuration() || 0;
    }
    return 0;
  }

  getVideoLoadedFraction() {
    if (this._isReady && this._yt && typeof this._yt.getVideoLoadedFraction === 'function') {
      return this._yt.getVideoLoadedFraction() || 0;
    }
    return 0;
  }

  setVolume(value) {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.setVolume === 'function') {
        this._yt.setVolume(value);
      }
    });
  }

  getVolume() {
    if (this._isReady && this._yt && typeof this._yt.getVolume === 'function') {
      return this._yt.getVolume();
    }
    return 100;
  }

  mute() {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.mute === 'function') {
        this._yt.mute();
      }
    });
  }

  unmute() {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.unMute === 'function') {
        this._yt.unMute();
      }
    });
  }

  isMuted() {
    if (this._isReady && this._yt && typeof this._yt.isMuted === 'function') {
      return Boolean(this._yt.isMuted());
    }
    return false;
  }

  setPlaybackRate(rate) {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.setPlaybackRate === 'function') {
        this._yt.setPlaybackRate(rate);
      }
    });
  }

  getPlaybackRate() {
    if (this._isReady && this._yt && typeof this._yt.getPlaybackRate === 'function') {
      return this._yt.getPlaybackRate() || 1;
    }
    return 1;
  }

  loadVideo(videoId, startSeconds = 0) {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.loadVideoById === 'function') {
        this._yt.loadVideoById({
          videoId,
          startSeconds: Math.floor(startSeconds)
        });
      }
    });
  }

  getVideoData() {
    if (this._isReady && this._yt && typeof this._yt.getVideoData === 'function') {
      const data = this._yt.getVideoData() || {};
      return {
        title: data.title || '',
        author: data.author || '',
        videoId: data.video_id || ''
      };
    }
    return { title: '', author: '', videoId: '' };
  }

  /**
   * Attempts to load the captions module from YouTube.
   * @private
   */
  _loadCaptionsModule() {
    if (this._yt && typeof this._yt.loadModule === 'function') {
      try {
        this._yt.loadModule('captions');
      } catch (err) {
        // Silently continue if module is not available
      }
    }
  }

  /**
   * Retrieves array of available caption tracks.
   * @returns {Array<{ languageCode: string, displayName: string, kind: string }>}
   */
  getCaptionTracks() {
    if (this._isReady && this._yt && typeof this._yt.getOption === 'function') {
      try {
        const list = this._yt.getOption('captions', 'tracklist') || [];
        if (Array.isArray(list)) {
          return list.map((t) => ({
            languageCode: t.languageCode || t.language || '',
            displayName: t.displayName || t.name || t.languageName || t.languageCode || 'Unknown',
            kind: t.kind || 'standard'
          }));
        }
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  /**
   * Retrieves current active caption track or null.
   * @returns {{ languageCode: string, displayName: string }|null}
   */
  getActiveCaptionTrack() {
    if (this._isReady && this._yt && typeof this._yt.getOption === 'function') {
      try {
        const track = this._yt.getOption('captions', 'track');
        if (track && track.languageCode) {
          return {
            languageCode: track.languageCode,
            displayName: track.displayName || track.languageName || track.languageCode
          };
        }
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  /**
   * Sets the caption track to a specific language code, or null/empty to turn off.
   * @param {string|null} languageCode
   */
  setCaptionTrack(languageCode) {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.setOption === 'function') {
        try {
          if (languageCode) {
            this._yt.setOption('captions', 'track', { languageCode });
          } else {
            this._yt.setOption('captions', 'track', {});
          }
          this._handleApiChange();
        } catch (err) {
          console.warn('[YouTubeProvider] Error setting caption track:', err);
        }
      }
    });
  }

  /**
   * Handles onApiChange events from YouTube (e.g. captions module loaded or track changes).
   * @private
   */
  _handleApiChange() {
    const tracks = this.getCaptionTracks();
    const activeTrack = this.getActiveCaptionTrack();
    this._emitter.emit('captions:update', {
      tracks,
      activeTrack,
      enabled: Boolean(activeTrack && activeTrack.languageCode)
    });
  }

  /**
   * Returns array of available playback quality levels from YouTube.
   * @returns {string[]}
   */
  getAvailableQualityLevels() {
    if (this._isReady && this._yt && typeof this._yt.getAvailableQualityLevels === 'function') {
      try {
        return this._yt.getAvailableQualityLevels() || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Returns currently active playback quality level.
   * @returns {string}
   */
  getPlaybackQuality() {
    if (this._isReady && this._yt && typeof this._yt.getPlaybackQuality === 'function') {
      try {
        return this._yt.getPlaybackQuality() || 'auto';
      } catch (e) {
        return 'auto';
      }
    }
    return 'auto';
  }

  /**
   * Sets playback quality (e.g. 'hd1080', 'hd720', 'large', 'medium', 'small', 'auto').
   * @param {string} quality
   */
  setPlaybackQuality(quality) {
    this._enqueue(() => {
      if (this._yt && typeof this._yt.setPlaybackQuality === 'function') {
        try {
          this._yt.setPlaybackQuality(quality);
          this._emitter.emit('quality:change', quality);
        } catch (err) {
          console.warn('[YouTubeProvider] Error setting playback quality:', err);
        }
      }
    });
  }

  destroy() {
    this._commandQueue = [];
    if (this._yt && typeof this._yt.destroy === 'function') {
      try {
        this._yt.destroy();
      } catch (err) {
        console.warn('[YouTubeProvider] Error during destroy:', err);
      }
    }
    this._yt = null;
    this._isReady = false;
    if (this._mountElement && this._mountElement.parentNode) {
      this._mountElement.parentNode.removeChild(this._mountElement);
    }
    this._mountElement = null;
  }
}
