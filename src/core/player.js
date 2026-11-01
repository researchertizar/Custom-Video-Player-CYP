/**
 * Custom YouTube Player - Core Orchestrator.
 */

import { EventEmitter } from './events.js';
import { StateManager, PlaybackStatus } from './state.js';
import { PluginManager } from './plugin-manager.js';
import { YouTubeProvider } from '../providers/youtube/youtube-provider.js';
import { HTML5Provider } from '../providers/html5/html5-provider.js';
import { detectSource } from '../utils/source-detector.js';
import { parseYouTubeUrl } from '../utils/youtube-url.js';
import { PlayerError, ErrorCode } from './errors.js';
import { PlayerUI } from '../ui/player-ui.js';
import { PlayerPresets } from './presets.js';

export class Player {
  /**
   * @param {object} options
   * @param {string|HTMLElement} options.element - Container element or CSS selector.
   * @param {string} [options.videoId] - 11-char ID or YouTube URL.
   * @param {string} [options.url] - Alternative URL property.
   * @param {boolean} [options.autoplay=false]
   * @param {boolean} [options.lazy=true] - Render poster facade first.
   * @param {string} [options.theme='dark']
   * @param {boolean|object} [options.controls=true]
   * @param {Array<object|Function>} [options.plugins=[]]
   * @param {boolean} [options.debug=false]
   */
  constructor(options = {}) {
    this._options = {
      autoplay: false,
      lazy: true,
      theme: 'dark',
      controls: true,
      debug: false,
      plugins: [],
      ...options
    };

    if (this._options.preset && PlayerPresets[this._options.preset]) {
      const p = PlayerPresets[this._options.preset];
      if (!options.theme) this._options.theme = p.theme;
      if (!options.accentColor) this._options.accentColor = p.accentColor;
      if (options.radius === undefined) this._options.radius = p.radius;
      if (options.trackHeight === undefined) this._options.trackHeight = p.trackHeight;
    }

    this._container = typeof this._options.element === 'string'
      ? document.querySelector(this._options.element)
      : this._options.element;

    if (!this._container || !(this._container instanceof HTMLElement)) {
      throw new PlayerError(ErrorCode.INVALID_CONFIGURATION, 'Invalid or missing container element.');
    }

    // Detect video source type (YouTube or HTML5)
    const rawTarget = this._options.videoId || this._options.url || this._options.src || '';
    const detection = detectSource(rawTarget, this._options);
    this._providerType = detection.type;
    this._currentVideoTarget = detection.target;
    this._currentVideoId = detection.type === 'youtube' ? detection.target : null;
    this._initialStartTime = detection.startTime;

    // Dual-Mode interaction model: 'enhanced' (default) vs 'compliant' (strict YouTube policies)
    this._mode = this._options.mode || (this._options.strictCompliance ? 'compliant' : 'enhanced');

    // Subsystems
    this.events = new EventEmitter();
    this.state = new StateManager(this.events, {
      title: this._options.title || 'Loading video...',
      status: PlaybackStatus.IDLE
    });
    this.plugins = new PluginManager(this);
    this.provider = this._createProvider(this._providerType);
    this._ui = this._options.controls !== false
      ? new PlayerUI(this, this._container, this._options)
      : null;

    // Internal timers & polling
    this._pollingTimer = null;
    this._isDestroyed = false;
    this._isMounted = false;
    this._mountPromise = null;
    this._readyPromise = null;
    this._resolveReady = null;

    this._readyPromise = new Promise((resolve) => {
      this._resolveReady = resolve;
    });

    this._bindProviderEvents();

    // Register initial plugins
    if (Array.isArray(this._options.plugins)) {
      for (const plugin of this._options.plugins) {
        this.use(plugin);
      }
    }

    // If not lazy, mount immediately
    if (!this._options.lazy) {
      this.mount();
    }
  }

  /**
   * Factory method to create provider instance based on detected source type.
   * @param {'youtube' | 'html5'} type
   * @returns {Provider}
   * @private
   */
  _createProvider(type) {
    if (type === 'html5') {
      return new HTML5Provider(this.events);
    }
    return new YouTubeProvider(this.events);
  }

  /**
   * Mounts the underlying video provider (from lazy or explicit invocation).
   * @returns {Promise<Player>}
   */
  async mount() {
    if (this._mountPromise) {
      return this._mountPromise;
    }

    this._isMounted = true;
    this._mountPromise = (async () => {
      if (this._ui) {
        await this._ui.mountProvider();
      } else {
        await this.provider.init(
          this._container,
          this._currentVideoTarget || this._currentVideoId,
          {
            autoplay: this._options.autoplay,
            startTime: this._initialStartTime,
            ...this._options
          }
        );
      }
      return this.ready();
    })();

    return this._mountPromise;
  }

  /**
   * Binds provider signals to player state and lifecycle.
   */
  _bindProviderEvents() {
    this.events.on('provider:ready', () => {
      this.state.set({ status: PlaybackStatus.READY });
      const duration = this.provider.getDuration();
      const meta = this.provider.getVideoData();

      this.state.set({
        duration: duration || 0,
        title: meta.title || 'YouTube Video'
      });

      if (this._resolveReady) {
        this._resolveReady(this);
      }
      this.events.emit('ready', this);
    });

    this.events.on('playing', () => {
      this.state.set({
        status: PlaybackStatus.PLAYING,
        hasStarted: true
      });
      const meta = this.provider.getVideoData();
      if (meta && meta.title && meta.title !== this.state.getField('title')) {
        this.state.set({ title: meta.title });
      }
      this._startPolling();
    });

    this.events.on('pause', () => {
      this.state.set({ status: PlaybackStatus.PAUSED });
      this._stopPolling();
      this._syncProgress();
    });

    this.events.on('buffering', () => {
      this.state.set({ status: PlaybackStatus.BUFFERING });
      this._stopPolling();
    });

    this.events.on('ended', () => {
      this.state.set({
        status: PlaybackStatus.ENDED,
        currentTime: this.state.getField('duration')
      });
      this._stopPolling();
    });

    this.events.on('captions:update', (data) => {
      this.state.set({
        captionsEnabled: Boolean(data.enabled),
        captionTrack: data.activeTrack ? data.activeTrack.languageCode : null,
        captionTracks: data.tracks || []
      });
      this.events.emit('captionschange', data);
    });

    this.events.on('provider:statechange', ({ isAd }) => {
      this.state.set({ isAd });
    });

    this.events.on('error', (err) => {
      this.state.set({ status: PlaybackStatus.ERROR });
      this._stopPolling();
      if (this._options.debug) {
        console.error('[Player] Error:', err);
      }
    });
  }

  /**
   * Starts high-efficiency progress update loop (Active ONLY while PLAYING).
   */
  _startPolling() {
    this._stopPolling();
    this._syncProgress();
    this._pollingTimer = setInterval(() => {
      this._syncProgress();
    }, 200);
  }

  /**
   * Stops the progress update timer to conserve CPU when paused/ended.
   */
  _stopPolling() {
    if (this._pollingTimer) {
      clearInterval(this._pollingTimer);
      this._pollingTimer = null;
    }
  }

  /**
   * Synchronizes current playback metrics from provider into reactive state.
   */
  _syncProgress() {
    if (!this.provider || this._isDestroyed) return;

    const currentTime = this.provider.getCurrentTime();
    const duration = this.provider.getDuration();
    const buffered = this.provider.getVideoLoadedFraction();

    this.state.set({
      currentTime,
      duration: duration || this.state.getField('duration'),
      buffered
    });
  }

  /**
   * Returns a promise that resolves when the player is ready.
   * @returns {Promise<Player>}
   */
  async ready() {
    return this._readyPromise;
  }

  /**
   * Starts video playback. Ensures provider is mounted and ready first.
   */
  async play() {
    if (this._isDestroyed) return;
    if (!this._isMounted) {
      await this.mount();
    }
    await this.ready();
    this.provider.play();
  }

  /**
   * Pauses video playback.
   */
  pause() {
    if (this._isDestroyed) return;
    this.provider.pause();
  }

  /**
   * Toggles play/pause based on current state.
   */
  async togglePlay() {
    if (!this._isMounted) {
      return this.play();
    }
    if (this.state.getField('status') === PlaybackStatus.PLAYING) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Stops video playback.
   */
  stop() {
    if (this._isDestroyed) return;
    this.provider.stop();
  }

  /**
   * Seeks to a specific timestamp in seconds.
   * @param {number} seconds
   */
  async seekTo(seconds) {
    if (this._isDestroyed) return;
    if (!this._isMounted) {
      await this.mount();
    }
    const target = Math.max(0, Math.min(seconds, this.state.getField('duration') || seconds));
    this.provider.seekTo(target, true);
    this.state.set({ currentTime: target });
  }

  /**
   * Relative seek forward or backward by delta seconds.
   * @param {number} deltaSeconds
   */
  seekBy(deltaSeconds) {
    const current = this.getCurrentTime();
    this.seekTo(current + deltaSeconds);
  }

  /**
   * Sets volume level (0-100).
   * @param {number} value
   */
  setVolume(value) {
    if (this._isDestroyed) return;
    this.provider.setVolume(value);
    this.state.set({ volume: value, muted: value === 0 });
  }

  /**
   * Gets current volume level (0-100).
   * @returns {number}
   */
  getVolume() {
    return this.state.getField('volume');
  }

  /**
   * Mutes player audio.
   */
  mute() {
    if (this._isDestroyed) return;
    this.provider.mute();
    this.state.set({ muted: true });
  }

  /**
   * Unmutes player audio.
   */
  unmute() {
    if (this._isDestroyed) return;
    this.provider.unmute();
    this.state.set({ muted: false });
  }

  /**
   * Toggles audio mute state.
   */
  toggleMute() {
    if (this.isMuted()) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Returns whether audio is muted.
   * @returns {boolean}
   */
  isMuted() {
    return this.state.getField('muted');
  }

  /**
   * Sets playback speed rate.
   * @param {number} rate
   */
  setPlaybackRate(rate) {
    if (this._isDestroyed) return;
    this.provider.setPlaybackRate(rate);
    this.state.set({ playbackRate: rate });
  }

  /**
   * Returns current playback rate.
   * @returns {number}
   */
  getPlaybackRate() {
    return this.state.getField('playbackRate');
  }

  /**
   * Returns current playback timestamp in seconds.
   * @returns {number}
   */
  getCurrentTime() {
    return this.state.getField('currentTime');
  }

  /**
   * Returns total video duration in seconds.
   * @returns {number}
   */
  getDuration() {
    return this.state.getField('duration');
  }

  /**
   * Loads a new video into this player instance.
   * Supports YouTube URLs/IDs, direct video files (MP4/WebM/OGG), blobs, and media sources.
   * @param {string|object|Array} videoIdentifier - ID, YouTube URL, direct video link, or source object/array.
   * @param {number} [startSeconds=0]
   */
  async load(videoIdentifier, startSeconds = 0) {
    if (this._isDestroyed) return;
    const detection = detectSource(videoIdentifier, this._options);

    // If provider backend changed (e.g. from youtube to html5 or vice-versa)
    if (detection.type !== this._providerType) {
      if (this.provider) {
        this.provider.destroy();
      }
      this._providerType = detection.type;
      this.provider = this._createProvider(this._providerType);
      this._bindProviderEvents();

      this._currentVideoTarget = detection.target;
      this._currentVideoId = detection.type === 'youtube' ? detection.target : null;
      this.state.resetForNewVideo();
      if (this._ui) {
        this._ui.updateVideoTarget(detection);
      }

      if (this._isMounted) {
        const mountContainer = this._ui ? (this._ui.mediaWrapper || this._ui.iframeWrapper) : this._container;
        this._mountPromise = this.provider.init(mountContainer, detection.target, {
          autoplay: true,
          startTime: startSeconds || detection.startTime,
          ...this._options
        });
        await this._mountPromise;
      } else {
        await this.mount();
        if (startSeconds > 0) {
          this.seekTo(startSeconds);
        }
      }
      return;
    }

    this._providerType = detection.type;
    this._currentVideoTarget = detection.target;
    this._currentVideoId = detection.type === 'youtube' ? detection.target : null;
    this.state.resetForNewVideo();
    if (this._ui) {
      this._ui.updateVideoTarget(detection);
    }

    if (!this._isMounted) {
      await this.mount();
      if (startSeconds > 0) {
        this.seekTo(startSeconds);
      }
    } else {
      this.provider.loadVideo(detection.target, startSeconds);
    }
  }

  /**
   * Toggles floating mini-player mode.
   * @returns {boolean}
   */
  /**
   * Returns current interaction mode ('enhanced' | 'compliant').
   * @returns {'enhanced' | 'compliant'}
   */
  get mode() {
    return this._mode;
  }

  /**
   * Sets interaction mode dynamically.
   * @param {'enhanced' | 'compliant'} newMode
   */
  setMode(newMode) {
    if (newMode !== 'compliant' && newMode !== 'enhanced') {
      return;
    }
    if (this._mode !== newMode) {
      this._mode = newMode;
      this._options.mode = newMode;
      if (this._ui) {
        this._ui.setMode(newMode);
      }
      this.events.emit('change:mode', newMode);
    }
  }

  /**
   * Whether strict YouTube compliance mode is active.
   * @returns {boolean}
   */
  isCompliant() {
    return this._mode === 'compliant';
  }

  /**
   * Whether enhanced distraction-free mode is active.
   * @returns {boolean}
   */
  isEnhanced() {
    return this._mode === 'enhanced';
  }

  toggleMini() {
    if (this._ui) {
      return this._ui.toggleMini();
    }
    return false;
  }

  /**
   * Requests native picture-in-picture if supported, or falls back to mini-player.
   * @returns {Promise<PictureInPictureWindow|boolean>}
   */
  async requestPictureInPicture() {
    if (this._providerType === 'html5' && typeof this.provider.requestPictureInPicture === 'function') {
      try {
        return await this.provider.requestPictureInPicture();
      } catch {
        // Fallback to UI mini player
      }
    }
    return this.toggleMini();
  }

  /**
   * Sets player visual theme ('dark', 'cinema', 'glass', 'minimal', 'professional', 'cyber', 'light').
   * @param {string} themeName
   * @param {boolean} [resetAccent=true]
   */
  setTheme(themeName, resetAccent = true) {
    this._options.theme = themeName;
    if (this._ui) {
      this._ui.setTheme(themeName, resetAccent);
    }
    this.events.emit('change:theme', themeName);
  }

  /**
   * Applies a complete developer UI preset model.
   * @param {string|object} presetName Preset key ('glass', 'minimal', 'professional', 'cyber', 'cinema', 'dark')
   */
  applyPreset(presetName) {
    const preset = typeof presetName === 'string' ? PlayerPresets[presetName] : presetName;
    if (!preset) {
      console.warn(`[CustomYouTubePlayer] Preset "${presetName}" not found.`);
      return;
    }
    this._options.preset = preset.id || preset.theme;
    this._options.theme = preset.theme;
    if (this._ui) {
      this._ui.applyPreset(preset);
    }
    this.events.emit('change:preset', preset.id || preset.theme, preset);
  }

  /**
   * Toggles closed captions on or off.
   * @param {string} [languageCode]
   */
  toggleCaptions(languageCode) {
    if (this.isCaptionsEnabled()) {
      this.disableCaptions();
    } else {
      this.enableCaptions(languageCode);
    }
  }

  /**
   * Enables closed captions with a target language or default available track.
   * @param {string} [languageCode]
   */
  enableCaptions(languageCode) {
    if (this._isDestroyed) return;
    const tracks = this.getCaptionTracks();
    const targetCode = languageCode || (tracks.length > 0 ? tracks[0].languageCode : 'en');
    this.provider.setCaptionTrack(targetCode);
    this.state.set({
      captionsEnabled: true,
      captionTrack: targetCode
    });
  }

  /**
   * Disables closed captions.
   */
  disableCaptions() {
    if (this._isDestroyed) return;
    this.provider.setCaptionTrack(null);
    this.state.set({
      captionsEnabled: false,
      captionTrack: null
    });
  }

  /**
   * Selects an active caption language track, or null/empty to disable.
   * @param {string|null} languageCode
   */
  setCaptionTrack(languageCode) {
    if (!languageCode) {
      this.disableCaptions();
    } else {
      this.enableCaptions(languageCode);
    }
  }

  /**
   * Returns whether closed captions are enabled.
   * @returns {boolean}
   */
  isCaptionsEnabled() {
    return Boolean(this.state.getField('captionsEnabled'));
  }

  /**
   * Returns current active caption track code or null.
   * @returns {string|null}
   */
  getActiveCaptionTrack() {
    return this.state.getField('captionTrack');
  }

  /**
   * Returns array of available caption tracks.
   * @returns {Array<{ languageCode: string, displayName: string, kind?: string }>}
   */
  getCaptionTracks() {
    const fromState = this.state.getField('captionTracks');
    if (Array.isArray(fromState) && fromState.length > 0) {
      return fromState;
    }
    return this.provider.getCaptionTracks();
  }

  /**
   * Sets playback quality resolution level.
   * @param {string} quality ('highres', 'hd1080', 'hd720', 'large', 'medium', 'small', 'auto')
   */
  setPlaybackQuality(quality) {
    if (this._isDestroyed) return;
    this.provider.setPlaybackQuality(quality);
  }

  /**
   * Returns active playback quality level.
   * @returns {string}
   */
  getPlaybackQuality() {
    return this.provider.getPlaybackQuality();
  }

  /**
   * Returns array of available playback quality levels for the current video.
   * @returns {string[]}
   */
  getAvailableQualityLevels() {
    return this.provider.getAvailableQualityLevels();
  }

  /**
   * Sets custom watermark branding logo overlay.
   * @param {object|null} logoOptions { src, url, position, opacity, width }
   */
  setLogo(logoOptions) {
    if (this._ui) {
      this._ui.setLogo(logoOptions);
    }
  }

  /**
   * Sets custom poster/thumbnail facade image.
   * @param {string} url
   */
  setPoster(url) {
    if (this._ui) {
      this._ui.setPoster(url);
    }
  }

  /**
   * Sets custom theme accent color.
   * @param {string} color (hex, rgb, or hsl)
   */
  setAccentColor(color) {
    if (this._ui) {
      this._ui.setAccentColor(color);
    }
  }

  /**
   * Sets custom seeker track thickness (height).
   * @param {number|string} height
   */
  setTrackHeight(height) {
    if (this._ui) {
      this._ui.setTrackHeight(height);
    }
  }

  /**
   * Sets custom border radius.
   * @param {number|string} radius
   */
  setRadius(radius) {
    if (this._ui) {
      this._ui.setRadius(radius);
    }
  }

  /**
   * Dynamically toggles visibility of a specific control button.
   * @param {string} controlName
   * @param {boolean} visible
   */
  setControlVisibility(controlName, visible) {
    if (this._ui) {
      this._ui.setControlVisibility(controlName, visible);
    }
  }

  /**
   * Batch updates player customization options.
   * @param {object} newOptions
   */
  updateOptions(newOptions = {}) {
    Object.assign(this._options, newOptions);
    if (newOptions.preset) this.applyPreset(newOptions.preset);
    if (newOptions.theme && !newOptions.preset) this.setTheme(newOptions.theme);
    if (newOptions.accentColor) this.setAccentColor(newOptions.accentColor);
    if (newOptions.trackHeight) this.setTrackHeight(newOptions.trackHeight);
    if (newOptions.radius !== undefined) this.setRadius(newOptions.radius);
    if (newOptions.logo !== undefined) this.setLogo(newOptions.logo);
    if (newOptions.poster) this.setPoster(newOptions.poster);
  }

  /**
   * Registers a plugin.
   * @param {object|Function} plugin
   * @returns {Player}
   */
  use(plugin) {
    this.plugins.use(plugin);
    return this;
  }

  /**
   * Subscribes to player events.
   * @param {string} event
   * @param {Function} callback
   * @returns {() => void}
   */
  on(event, callback) {
    return this.events.on(event, callback);
  }

  /**
   * Unsubscribes from player events.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    this.events.off(event, callback);
  }

  /**
   * Subscribes to a player event once.
   * @param {string} event
   * @param {Function} callback
   * @returns {() => void}
   */
  once(event, callback) {
    return this.events.once(event, callback);
  }

  /**
   * Returns an immutable copy of the reactive state.
   */
  getState() {
    return this.state.get();
  }

  /**
   * Completely tears down the player, timers, plugins, and DOM elements.
   */
  destroy() {
    if (this._isDestroyed) return;
    this._isDestroyed = true;

    this._stopPolling();
    this.plugins.destroy();

    if (this._ui && typeof this._ui.destroy === 'function') {
      this._ui.destroy();
      this._ui = null;
    }

    if (this.provider) {
      this.provider.destroy();
    }

    this.events.emit('destroy');
    this.events.removeAllListeners();
  }
}
