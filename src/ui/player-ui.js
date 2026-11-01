/**
 * Master UI Coordinator for Custom YouTube Player.
 * Manages DOM lifecycle, responsive layouts, smart overlay, and auto-hide timers.
 */

import { createElement, escapeHtml, sanitizeUrl } from '../utils/dom.js';
import { Timeline } from './timeline.js';
import { Controls } from './controls.js';
import { PlaybackStatus } from '../core/state.js';
import { Icons } from './icons.js';
import { PlayerPresets } from '../core/presets.js';

export class PlayerUI {
  /**
   * @param {import('../core/player.js').Player} player
   * @param {HTMLElement} rootContainer
   * @param {object} options
   */
  constructor(player, rootContainer, options = {}) {
    this._player = player;
    this._root = rootContainer;
    this._options = options;

    this._hideTimer = null;
    this._isControlsHidden = false;
    this._hasMountedIframe = false;
    this._mountPromise = null;

    this._buildDOM();
    this._bindPlayerState();
    this._bindInteractions();
  }

  _buildDOM() {
    // If a preset model is specified, use its baseline attributes
    if (this._options.preset && PlayerPresets[this._options.preset]) {
      const p = PlayerPresets[this._options.preset];
      if (!this._options.theme) this._options.theme = p.theme;
      if (!this._options.accentColor) this._options.accentColor = p.accentColor;
      if (this._options.radius === undefined) this._options.radius = p.radius;
      if (this._options.trackHeight === undefined) this._options.trackHeight = p.trackHeight;
    }

    this._mode = this._player.mode || 'enhanced';
    this._root.classList.add('cyp-player', `theme-${this._options.theme || 'dark'}`, `mode-${this._mode}`);

    // Apply custom styling options
    if (this._options.accentColor) {
      this._root.style.setProperty('--cyp-accent', this._options.accentColor);
      this._root.style.setProperty('--cyp-accent-hover', this._options.accentColor);
    }
    if (this._options.trackHeight) {
      const th = typeof this._options.trackHeight === 'number' ? `${this._options.trackHeight}px` : this._options.trackHeight;
      this._root.style.setProperty('--cyp-track-height', th);
    }
    if (this._options.radius !== undefined) {
      const r = typeof this._options.radius === 'number' ? `${this._options.radius}px` : this._options.radius;
      this._root.style.setProperty('--cyp-radius', r);
    }

    // Main 16:9 Video Box
    this.videoBox = createElement('div', { className: 'cyp-video-box' });

    // IFrame / Media Mount Target Wrapper
    this.iframeWrapper = createElement('div', { className: 'cyp-iframe-wrapper' });
    this.mediaWrapper = this.iframeWrapper;

    // Smart Click Interceptor (Catches play/pause & gestures while allowing ad pass-through)
    this.clickInterceptor = createElement('div', { className: 'cyp-click-interceptor' });

    // Thumbnail Facade (Lazy load poster)
    const customPoster = this._options.poster || this._options.thumbnail;
    const initialId = this._player._currentVideoId;
    const initialPosterSrc = customPoster || (initialId ? `https://i.ytimg.com/vi/${initialId}/hqdefault.jpg` : '');

    this.posterImg = createElement('img', {
      className: 'cyp-poster-img',
      attributes: {
        src: initialPosterSrc,
        alt: 'Video poster',
        loading: 'lazy'
      }
    });
    this.posterImg.addEventListener('error', () => {
      if (this.posterImg.src.includes('hqdefault.jpg') && this._player._currentVideoId) {
        this.posterImg.src = `https://i.ytimg.com/vi/${this._player._currentVideoId}/mqdefault.jpg`;
      }
    });

    const icons = this.controls?.icons || Icons;
    this.poster = createElement('div', {
      className: 'cyp-poster',
      children: [
        this.posterImg,
        createElement('button', {
          className: 'cyp-poster-play-btn',
          attributes: { type: 'button', 'aria-label': 'Play video' },
          innerHTML: icons.play
        })
      ]
    });

    // Branding Logo Watermark Overlay
    this.logoOverlay = createElement('div', { className: 'cyp-logo-overlay is-hidden' });
    if (this._options.logo) {
      this.setLogo(this._options.logo);
    }

    // Top Header & Gradient (Progressive disclosure: hidden until title is present)
    this.topGradient = createElement('div', { className: 'cyp-top-gradient' });
    if (!this._options.title) {
      this.topGradient.style.display = 'none';
    }
    this.titleDisplay = createElement('div', {
      className: 'cyp-title',
      textContent: this._options.title || 'Video Player'
    });
    this.topGradient.appendChild(this.titleDisplay);

    // Floating Mini Player Top Bar
    this.miniBar = createElement('div', { className: 'cyp-mini-bar' });
    this.miniTitle = createElement('span', {
      className: 'cyp-mini-title',
      textContent: this._options.title || 'Video Player'
    });
    this.miniActions = createElement('div', { className: 'cyp-mini-actions' });
    this.miniExpandBtn = createElement('button', {
      className: 'cyp-btn cyp-mini-expand-btn',
      attributes: { type: 'button', 'aria-label': 'Expand to page (I)', title: 'Expand to page (I)' },
      innerHTML: Icons.expand
    });
    this.miniCloseBtn = createElement('button', {
      className: 'cyp-btn cyp-mini-close-btn',
      attributes: { type: 'button', 'aria-label': 'Close mini player (Esc)', title: 'Close mini player (Esc)' },
      innerHTML: Icons.close
    });
    this.miniActions.appendChild(this.miniExpandBtn);
    this.miniActions.appendChild(this.miniCloseBtn);
    this.miniBar.appendChild(this.miniTitle);
    this.miniBar.appendChild(this.miniActions);

    // Timeline
    this.timeline = new Timeline(this._player);

    // Controls
    this.controls = new Controls(this._player);

    // When in lazy mode, hide the center play button so it doesn't overlap the poster
    if (this._options.lazy) {
      this.controls.centerPlayBtn.classList.add('is-hidden');
    }

    // Assemble video box
    this.videoBox.appendChild(this.iframeWrapper);
    this.videoBox.appendChild(this.clickInterceptor);
    this.videoBox.appendChild(this.poster);
    this.videoBox.appendChild(this.topGradient);
    this.videoBox.appendChild(this.miniBar);
    this.videoBox.appendChild(this.logoOverlay);
    this.videoBox.appendChild(this.controls.centerPlayBtn);
    this.videoBox.appendChild(this.controls.loader);
    this.videoBox.appendChild(this.controls.errorOverlay);
    this.videoBox.appendChild(this.controls.toast);

    // Assemble bottom control dock
    this.controls.container.insertBefore(this.timeline.element, this.controls.controlRow);
    this.videoBox.appendChild(this.controls.container);

    this._root.appendChild(this.videoBox);
  }

  /**
   * Initializes the YouTube iframe inside the wrapper.
   * @returns {Promise<void>}
   */
  async mountProvider() {
    if (this._mountPromise) {
      return this._mountPromise;
    }

    this._hasMountedIframe = true;
    this.poster.classList.add('is-hidden');
    this.controls.setLoading(true);

    this._mountPromise = (async () => {
      try {
        await this._player.provider.init(
          this.iframeWrapper,
          this._player._currentVideoTarget || this._player._currentVideoId,
          {
            autoplay: Boolean(this._options.autoplay),
            startTime: this._player._initialStartTime,
            host: this._options.host,
            captions: this._options.captions,
            captionLanguage: this._options.captionLanguage,
            tracks: this._options.tracks,
            poster: this._options.poster
          }
        );
        this.controls.centerPlayBtn.classList.remove('is-hidden');
      } catch (err) {
        this.controls.showError(err.message || 'Failed to initialize video.');
        throw err;
      } finally {
        this.controls.setLoading(false);
      }
    })();

    return this._mountPromise;
  }

  _bindPlayerState() {
    // Reactive state synchronization
    this._player.events.on('change:mode', (mode) => {
      this.setMode(mode);
    });

    this._player.events.on('change:status', (status) => {
      this._root.setAttribute('data-status', status);

      const isPlaying = status === PlaybackStatus.PLAYING;
      const isEnded = status === PlaybackStatus.ENDED;
      this.controls.setPlayState(isPlaying, isEnded);

      if (status === PlaybackStatus.BUFFERING || status === PlaybackStatus.LOADING) {
        this.controls.setLoading(true);
      } else {
        this.controls.setLoading(false);
      }

      if (isPlaying) {
        this._startHideTimer();
      } else {
        this._showControls();
      }
    });

    this._player.events.on('change:currentTime', (currentTime) => {
      const duration = this._player.getDuration();
      const buffered = this._player.state.getField('buffered');
      this.timeline.update(currentTime, duration, buffered);
      this.controls.setTime(currentTime, duration);
    });

    this._player.events.on('change:duration', (duration) => {
      const currentTime = this._player.getCurrentTime();
      this.controls.setTime(currentTime, duration);
    });

    this._player.events.on('change:volume', (vol) => {
      this.controls.setVolumeState(vol, this._player.isMuted());
    });

    this._player.events.on('change:muted', (muted) => {
      this.controls.setVolumeState(this._player.getVolume(), muted);
    });

    this._player.events.on('change:title', (title) => {
      if (title && title !== 'Loading video...') {
        this.titleDisplay.textContent = title;
        this.topGradient.style.display = '';
      }
    });

    this._player.events.on('change:captionsEnabled', (enabled) => {
      this.controls.setCaptionsState(enabled, this._player.state.getField('captionTrack'));
      this.controls.updateCaptionsMenu(
        this._player.state.getField('captionTracks'),
        this._player.state.getField('captionTrack'),
        enabled
      );
    });

    this._player.events.on('change:captionTrack', (track) => {
      this.controls.setCaptionsState(this._player.isCaptionsEnabled(), track);
      this.controls.updateCaptionsMenu(
        this._player.state.getField('captionTracks'),
        track,
        this._player.isCaptionsEnabled()
      );
    });

    this._player.events.on('change:captionTracks', (tracks) => {
      this.controls.updateCaptionsMenu(
        tracks,
        this._player.state.getField('captionTrack'),
        this._player.isCaptionsEnabled()
      );
    });

    this._player.events.on('quality:change', (quality) => {
      const levels = this._player.getAvailableQualityLevels();
      this.controls.updateQualityMenu(levels, quality);
    });

    this._player.events.on('ready', () => {
      const levels = this._player.getAvailableQualityLevels();
      const current = this._player.getPlaybackQuality();
      this.controls.updateQualityMenu(levels, current);
    });

    // Guardrail: When YouTube plays an ad, pass pointer events directly to the iframe
    this._player.events.on('change:isAd', (isAd) => {
      this.iframeWrapper.classList.toggle('is-ad-active', isAd);
      this.clickInterceptor.classList.toggle('pass-through', isAd);
      if (isAd) {
        this.controls.showToast('Ad playing (Controls unlocked)');
      }
    });

    this._player.events.on('error', (err) => {
      this.controls.showError(err.message);
    });

    // Fullscreen, Theater, Mini events
    this._player.events.on('ui:toggle-fullscreen', () => this.toggleFullscreen());
    this._player.events.on('ui:toggle-theater', () => this.toggleTheater());
    this._player.events.on('ui:toggle-mini', () => this.toggleMini());
  }

  _bindInteractions() {
    // Total Link Privacy: Capture and block context menu anywhere across the player
    this._root.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);

    // Prevent dragging images/elements which could expose source URLs
    this._root.addEventListener('dragstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);

    // Poster click initiates playback via player orchestrator
    this.poster.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.play();
    });

    // Center click interceptor
    this.clickInterceptor.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.togglePlay();
    });

    // Auto-hide controls triggers
    const resetHide = () => {
      this._showControls();
      if (this._player.state.getField('status') === PlaybackStatus.PLAYING) {
        this._startHideTimer();
      }
    };

    this.videoBox.addEventListener('pointermove', resetHide);
    this.videoBox.addEventListener('touchstart', resetHide, { passive: true });
    this.videoBox.addEventListener('pointerleave', () => {
      if (this._player.state.getField('status') === PlaybackStatus.PLAYING) {
        this._hideControls();
      }
    });

    // Mini player actions
    this.miniExpandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMini(false);
      this._root.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    this.miniCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.pause();
      this.toggleMini(false);
    });

    // Fullscreen change listener
    document.addEventListener('fullscreenchange', () => {
      const isFull = Boolean(document.fullscreenElement === this._root);
      this._player.state.set({ fullscreen: isFull });
      this._root.classList.toggle('is-fullscreen', isFull);
      this.controls.setFullscreenState(isFull);
    });
  }

  _showControls() {
    this._isControlsHidden = false;
    this._root.classList.remove('controls-hidden');
    if (this._hideTimer) clearTimeout(this._hideTimer);
  }

  _hideControls() {
    if (this.controls.settingsMenu.classList.contains('is-open')) return;
    this._isControlsHidden = true;
    this._root.classList.add('controls-hidden');
  }

  _startHideTimer() {
    if (this._hideTimer) clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => {
      this._hideControls();
    }, 3000);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (this._root.requestFullscreen) {
        this._root.requestFullscreen().catch((err) => {
          console.warn('[PlayerUI] Fullscreen request error:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  toggleTheater() {
    const isTheater = !this._player.state.getField('theater');
    this._player.state.set({ theater: isTheater });
    this._root.classList.toggle('is-theater', isTheater);
  }

  toggleMini(force) {
    const isMini = typeof force === 'boolean' ? force : !this._player.state.getField('mini');
    this._player.state.set({ mini: isMini });
    this._root.classList.toggle('is-mini', isMini);
    if (this.controls) this.controls.setMiniState(isMini);
    this._player.events.emit('change:mini', isMini);
    if (isMini) {
      if (this.controls) this.controls.showToast('Mini player mode (I)');
    } else {
      if (this.controls) this.controls.showToast('Restored to player');
    }
  }

  /**
   * Updates player visual theme class dynamically.
   * Clears manually forced inline accent styles by default so the theme's colors shine through.
   * @param {string} themeName
   * @param {boolean} [resetAccent=true]
   */
  /**
   * Sets interaction mode dynamically ('enhanced' | 'compliant').
   * @param {'enhanced' | 'compliant'} mode
   */
  setMode(mode) {
    if (mode !== 'compliant' && mode !== 'enhanced') return;
    this._mode = mode;
    this._root.classList.remove('mode-enhanced', 'mode-compliant');
    this._root.classList.add(`mode-${mode}`);
    if (this.controls && typeof this.controls.showToast === 'function') {
      this.controls.showToast(mode === 'compliant' ? 'YouTube Policy Compliant Mode' : 'Enhanced Studio Mode');
    }
  }

  setTheme(themeName, resetAccent = true) {
    if (!themeName) return;
    const themeClasses = Array.from(this._root.classList).filter((c) => c.startsWith('theme-'));
    for (const c of themeClasses) {
      this._root.classList.remove(c);
    }
    this._root.classList.add(`theme-${themeName}`);
    this._options.theme = themeName;

    if (resetAccent) {
      this._root.style.removeProperty('--cyp-accent');
      this._root.style.removeProperty('--cyp-accent-hover');
    }
  }

  /**
   * Applies a complete developer UI preset model.
   * @param {string|object} presetInput Preset key (e.g. 'glass', 'minimal', 'professional', 'cyber', 'cinema') or preset object
   */
  applyPreset(presetInput) {
    const preset = typeof presetInput === 'string' ? PlayerPresets[presetInput] : presetInput;
    if (!preset) return;

    this.setTheme(preset.theme, false);

    if (preset.accentColor) {
      this.setAccentColor(preset.accentColor);
    } else {
      this._root.style.removeProperty('--cyp-accent');
      this._root.style.removeProperty('--cyp-accent-hover');
    }

    if (preset.radius !== undefined) {
      this.setRadius(preset.radius);
    }

    if (preset.trackHeight !== undefined) {
      this.setTrackHeight(preset.trackHeight);
    }

    this._options.preset = preset.id || preset.theme;
  }

  /**
   * Updates poster and UI state when target changes.
   * @param {{ type: string, target: any }} detection
   */
  updateVideoTarget(detection) {
    if (!this._player._isMounted) {
      this._mountPromise = null;
    }
    if (detection.type === 'youtube' && detection.target) {
      this.updateVideoId(detection.target);
    } else {
      if (this._options.poster && this.posterImg) {
        this.posterImg.src = this._options.poster;
      }
    }
  }

  /**
   * Updates thumbnail poster image when a new video is loaded.
   * @param {string} videoId
   */
  updateVideoId(videoId) {
    if (this.posterImg && videoId) {
      this.posterImg.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  /**
   * Sets watermark branding logo.
   * @param {object} logoOptions
   */
  setLogo(logoOptions) {
    if (!logoOptions || (!logoOptions.src && !logoOptions.innerHTML)) {
      this.logoOverlay.classList.add('is-hidden');
      this.logoOverlay.innerHTML = '';
      return;
    }

    const pos = logoOptions.position || 'top-right';
    this.logoOverlay.className = `cyp-logo-overlay pos-${pos}`;

    if (logoOptions.opacity !== undefined) {
      this.logoOverlay.style.opacity = String(logoOptions.opacity);
    } else {
      this.logoOverlay.style.opacity = '';
    }

    let inner = '';
    const safeUrl = sanitizeUrl(logoOptions.url);

    if (logoOptions.src) {
      const safeSrc = sanitizeUrl(logoOptions.src);
      if (safeSrc) {
        const w = logoOptions.width ? `style="width: ${escapeHtml(logoOptions.width)}"` : '';
        const img = `<img src="${escapeHtml(safeSrc)}" alt="Logo" ${w} />`;
        inner = safeUrl
          ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${img}</a>`
          : img;
      }
    } else if (logoOptions.innerHTML) {
      const rawHtml = String(logoOptions.innerHTML);
      // Reject dangerous inline script tags or event handlers
      if (!/<script|javascript:|on\w+=/i.test(rawHtml)) {
        inner = safeUrl
          ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${rawHtml}</a>`
          : rawHtml;
      }
    }

    this.logoOverlay.innerHTML = inner;
    if (inner) {
      this.logoOverlay.classList.remove('is-hidden');
    } else {
      this.logoOverlay.classList.add('is-hidden');
    }
  }

  /**
   * Sets custom thumbnail poster image.
   * @param {string} url
   */
  setPoster(url) {
    const safe = sanitizeUrl(url);
    if (this.posterImg && safe) {
      this.posterImg.src = safe;
    }
  }

  /**
   * Sets custom accent color.
   * @param {string} color
   */
  setAccentColor(color) {
    if (!color) return;
    this._root.style.setProperty('--cyp-accent', color);
    this._root.style.setProperty('--cyp-accent-hover', color);
  }

  /**
   * Sets custom seeker track thickness (height).
   * @param {number|string} height
   */
  setTrackHeight(height) {
    if (!height) return;
    const val = typeof height === 'number' ? `${height}px` : height;
    this._root.style.setProperty('--cyp-track-height', val);
  }

  /**
   * Sets custom border radius.
   * @param {number|string} radius
   */
  setRadius(radius) {
    if (radius === undefined) return;
    const val = typeof radius === 'number' ? `${radius}px` : radius;
    this._root.style.setProperty('--cyp-radius', val);
  }

  /**
   * Toggles visibility of a specific control button.
   * @param {string} controlName
   * @param {boolean} visible
   */
  setControlVisibility(controlName, visible) {
    this.controls.setControlVisibility(controlName, visible);
  }

  destroy() {
    if (this._hideTimer) clearTimeout(this._hideTimer);
    this.timeline.destroy();
    this.controls.destroy();
    this.videoBox.remove();
  }
}
