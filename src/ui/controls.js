/**
 * UI Control Bar, Action Triggers, and Menus.
 */

import { createElement } from '../utils/dom.js';
import { Icons, getIcons } from './icons.js';
import { formatTime } from '../utils/time.js';
import { isIOS } from '../utils/platform.js';

export class Controls {
  /**
   * @param {import('../core/player.js').Player} player
   */
  constructor(player) {
    this._player = player;
    this._toastTimer = null;
    this.icons = getIcons(this._player._options?.icons);

    this._buildElements();
    this._bindEvents();
  }

  _buildElements() {
    // Bottom Controls container
    this.container = createElement('div', { className: 'cyp-controls-bottom' });
    this.controlRow = createElement('div', { className: 'cyp-control-row' });

    // Left controls
    this.leftGroup = createElement('div', { className: 'cyp-controls-left' });

    this.playBtn = createElement('button', {
      className: 'cyp-btn cyp-play-btn',
      attributes: { type: 'button', 'aria-label': 'Play', title: 'Play (Space)' },
      innerHTML: this.icons.play
    });

    this.backBtn = createElement('button', {
      className: 'cyp-btn cyp-back-btn',
      attributes: { type: 'button', 'aria-label': 'Rewind 10 seconds', title: 'Back 10s (J)' },
      innerHTML: this.icons.back10
    });

    this.forwardBtn = createElement('button', {
      className: 'cyp-btn cyp-forward-btn',
      attributes: { type: 'button', 'aria-label': 'Forward 10 seconds', title: 'Forward 10s (L)' },
      innerHTML: this.icons.forward10
    });

    // Volume group
    this.volumeGroup = createElement('div', { className: 'cyp-volume-group' });
    this.muteBtn = createElement('button', {
      className: 'cyp-btn cyp-mute-btn',
      attributes: { type: 'button', 'aria-label': 'Mute', title: 'Mute (M)' },
      innerHTML: this.icons.volumeHigh
    });
    this.volumeSlider = createElement('input', {
      className: 'cyp-volume-slider',
      attributes: {
        type: 'range',
        min: '0',
        max: '100',
        value: '100',
        'aria-label': 'Volume'
      }
    });

    // Guardrail: on iOS, volume cannot be adjusted via JavaScript
    if (isIOS()) {
      this.volumeSlider.style.display = 'none';
    }

    this.volumeGroup.appendChild(this.muteBtn);
    this.volumeGroup.appendChild(this.volumeSlider);

    // Time display
    this.timeDisplay = createElement('div', {
      className: 'cyp-time-display',
      textContent: '0:00 / 0:00'
    });

    // Spacer
    this.spacer = createElement('div', { className: 'cyp-spacer' });

    // Right controls
    this.rightGroup = createElement('div', { className: 'cyp-controls-right' });

    this.chaptersBtn = createElement('button', {
      className: 'cyp-btn cyp-chapters-btn',
      attributes: { type: 'button', 'aria-label': 'Chapters', title: 'Chapters' },
      innerHTML: this.icons.chapters
    });
    this.chaptersBtn.style.display = 'none'; // Progressive disclosure: hidden until chapters are provided

    this.captionsBtn = createElement('button', {
      className: 'cyp-btn cyp-captions-btn',
      attributes: { type: 'button', 'aria-label': 'Subtitles/closed captions', title: 'Subtitles/closed captions (C)' },
      innerHTML: this.icons.captions
    });
    this.captionsBtn.style.display = 'none'; // Progressive disclosure: hidden until tracks are detected

    // Settings menu wrapper
    this.settingsWrapper = createElement('div', { className: 'cyp-settings-wrapper' });
    this.settingsBtn = createElement('button', {
      className: 'cyp-btn cyp-settings-btn',
      attributes: {
        type: 'button',
        'aria-label': 'Settings',
        title: 'Settings',
        'aria-haspopup': 'true',
        'aria-expanded': 'false'
      },
      innerHTML: this.icons.settings
    });

    this.settingsMenu = createElement('div', {
      className: 'cyp-settings-menu',
      attributes: { role: 'menu', 'aria-label': 'Player settings' }
    });

    // 1. Root View: Minimal rows for Speed, Quality, Subtitles
    this.menuRootView = createElement('div', {
      className: 'cyp-menu-view cyp-menu-root is-active',
      attributes: { role: 'menu' }
    });

    this.speedNavVal = createElement('span', { className: 'cyp-nav-val', textContent: 'Normal' });
    this.speedNavBtn = createElement('button', {
      className: 'cyp-menu-nav-btn',
      attributes: { type: 'button', role: 'menuitem', 'aria-haspopup': 'true' },
      children: [
        createElement('span', { className: 'cyp-nav-left', textContent: 'Playback Speed' }),
        createElement('span', {
          className: 'cyp-nav-right',
          children: [
            this.speedNavVal,
            createElement('span', { className: 'cyp-nav-chevron', innerHTML: this.icons.chevronRight || '›' })
          ]
        })
      ]
    });

    this.qualityNavVal = createElement('span', { className: 'cyp-nav-val', textContent: 'Auto' });
    this.qualityNavBtn = createElement('button', {
      className: 'cyp-menu-nav-btn',
      attributes: { type: 'button', role: 'menuitem', 'aria-haspopup': 'true' },
      children: [
        createElement('span', { className: 'cyp-nav-left', textContent: 'Quality' }),
        createElement('span', {
          className: 'cyp-nav-right',
          children: [
            this.qualityNavVal,
            createElement('span', { className: 'cyp-nav-chevron', innerHTML: this.icons.chevronRight || '›' })
          ]
        })
      ]
    });
    this.qualityNavBtn.style.display = 'none'; // Progressive disclosure: hidden until provider returns quality levels

    this.captionsNavVal = createElement('span', { className: 'cyp-nav-val', textContent: 'Off' });
    this.captionsNavBtn = createElement('button', {
      className: 'cyp-menu-nav-btn',
      attributes: { type: 'button', role: 'menuitem', 'aria-haspopup': 'true' },
      children: [
        createElement('span', { className: 'cyp-nav-left', textContent: 'Subtitles / CC' }),
        createElement('span', {
          className: 'cyp-nav-right',
          children: [
            this.captionsNavVal,
            createElement('span', { className: 'cyp-nav-chevron', innerHTML: this.icons.chevronRight || '›' })
          ]
        })
      ]
    });
    this.captionsNavBtn.style.display = 'none'; // Progressive disclosure: hidden until caption tracks are detected

    this.menuRootView.appendChild(this.speedNavBtn);
    this.menuRootView.appendChild(this.qualityNavBtn);
    this.menuRootView.appendChild(this.captionsNavBtn);

    // 2. Playback Speed Sub-View
    this.speedSubView = createElement('div', {
      className: 'cyp-menu-view cyp-menu-sub cyp-speed-view',
      attributes: { role: 'menu' }
    });
    this.speedBackBtn = createElement('button', {
      className: 'cyp-menu-back-btn',
      attributes: { type: 'button', 'aria-label': 'Back to main menu' },
      children: [
        createElement('span', { className: 'cyp-back-arrow', innerHTML: this.icons.arrowLeft || '‹' }),
        createElement('span', { className: 'cyp-back-title', textContent: 'Playback Speed' })
      ]
    });
    this.speedSubView.appendChild(this.speedBackBtn);

    this.speedOptionsList = createElement('div', { className: 'cyp-menu-options cyp-speed-list' });
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    this.speedItems = speeds.map((speed) => {
      const isDefault = speed === 1;
      const item = createElement('button', {
        className: `cyp-menu-item ${isDefault ? 'is-active' : ''}`,
        attributes: {
          type: 'button',
          'data-speed': String(speed),
          role: 'menuitemradio',
          'aria-checked': isDefault ? 'true' : 'false'
        },
        children: [
          createElement('span', { className: 'cyp-item-label', textContent: isDefault ? 'Normal' : `${speed}×` }),
          createElement('span', { className: 'cyp-item-check', innerHTML: this.icons.check || '✓' })
        ]
      });
      this.speedOptionsList.appendChild(item);
      return item;
    });
    this.speedSubView.appendChild(this.speedOptionsList);

    // 3. Quality Sub-View
    this.qualitySubView = createElement('div', {
      className: 'cyp-menu-view cyp-menu-sub cyp-quality-view',
      attributes: { role: 'menu' }
    });
    this.qualityBackBtn = createElement('button', {
      className: 'cyp-menu-back-btn',
      attributes: { type: 'button', 'aria-label': 'Back to main menu' },
      children: [
        createElement('span', { className: 'cyp-back-arrow', innerHTML: this.icons.arrowLeft || '‹' }),
        createElement('span', { className: 'cyp-back-title', textContent: 'Quality' })
      ]
    });
    this.qualitySubView.appendChild(this.qualityBackBtn);
    this.qualityMenuList = createElement('div', { className: 'cyp-menu-options cyp-quality-list' });
    this.qualitySubView.appendChild(this.qualityMenuList);

    // 4. Captions / Subtitles Sub-View
    this.captionsSubView = createElement('div', {
      className: 'cyp-menu-view cyp-menu-sub cyp-captions-view',
      attributes: { role: 'menu' }
    });
    this.captionsBackBtn = createElement('button', {
      className: 'cyp-menu-back-btn',
      attributes: { type: 'button', 'aria-label': 'Back to main menu' },
      children: [
        createElement('span', { className: 'cyp-back-arrow', innerHTML: this.icons.arrowLeft || '‹' }),
        createElement('span', { className: 'cyp-back-title', textContent: 'Subtitles / CC' })
      ]
    });
    this.captionsSubView.appendChild(this.captionsBackBtn);
    this.captionsMenuList = createElement('div', { className: 'cyp-menu-options cyp-captions-list' });
    this.captionsSubView.appendChild(this.captionsMenuList);

    // Assemble all views into the settings menu container
    this.settingsMenu.appendChild(this.menuRootView);
    this.settingsMenu.appendChild(this.speedSubView);
    this.settingsMenu.appendChild(this.qualitySubView);
    this.settingsMenu.appendChild(this.captionsSubView);

    this.settingsWrapper.appendChild(this.settingsBtn);
    this.settingsWrapper.appendChild(this.settingsMenu);

    this.theaterBtn = createElement('button', {
      className: 'cyp-btn cyp-theater-btn',
      attributes: { type: 'button', 'aria-label': 'Theater mode', title: 'Theater mode (T)' },
      innerHTML: this.icons.theater
    });

    this.miniBtn = createElement('button', {
      className: 'cyp-btn cyp-mini-btn',
      attributes: { type: 'button', 'aria-label': 'Mini player', title: 'Mini player' },
      innerHTML: this.icons.mini
    });

    this.fullscreenBtn = createElement('button', {
      className: 'cyp-btn cyp-fullscreen-btn',
      attributes: { type: 'button', 'aria-label': 'Fullscreen', title: 'Fullscreen (F)' },
      innerHTML: this.icons.fullscreen
    });

    // Control visibility filtering
    const enabledControls = Array.isArray(this._player._options.controls)
      ? this._player._options.controls
      : null;

    const isVisible = (id) => !enabledControls || enabledControls.includes(id);

    if (isVisible('play')) this.leftGroup.appendChild(this.playBtn);
    if (isVisible('rewind')) this.leftGroup.appendChild(this.backBtn);
    if (isVisible('forward')) this.leftGroup.appendChild(this.forwardBtn);
    if (isVisible('volume')) this.leftGroup.appendChild(this.volumeGroup);
    if (isVisible('time')) this.leftGroup.appendChild(this.timeDisplay);

    if (isVisible('chapters')) this.rightGroup.appendChild(this.chaptersBtn);
    if (isVisible('captions')) this.rightGroup.appendChild(this.captionsBtn);
    if (isVisible('settings')) this.rightGroup.appendChild(this.settingsWrapper);
    if (isVisible('theater')) this.rightGroup.appendChild(this.theaterBtn);
    if (isVisible('mini')) this.rightGroup.appendChild(this.miniBtn);
    if (isVisible('fullscreen')) this.rightGroup.appendChild(this.fullscreenBtn);

    this.controlRow.appendChild(this.leftGroup);
    this.controlRow.appendChild(this.spacer);
    this.controlRow.appendChild(this.rightGroup);

    this.container.appendChild(this.controlRow);

    // Toast alert element
    this.toast = createElement('div', { className: 'cyp-toast' });

    // Center big play button
    this.centerPlayBtn = createElement('button', {
      className: 'cyp-center-play',
      attributes: { type: 'button', 'aria-label': 'Play video' },
      innerHTML: Icons.play
    });

    // Loading spinner
    this.loader = createElement('div', { className: 'cyp-loader' });

    // Error overlay
    this.errorOverlay = createElement('div', { className: 'cyp-error-overlay' });
    this.errorTitle = createElement('h3', { textContent: 'Video Unavailable' });
    this.errorMessage = createElement('p', { textContent: 'Unable to load video.' });
    this.errorOverlay.appendChild(this.errorTitle);
    this.errorOverlay.appendChild(this.errorMessage);
  }

  _bindEvents() {
    this.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.togglePlay();
    });
    this.centerPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.togglePlay();
    });
    this.backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.seekBy(-10);
      this.showToast('-10s');
    });
    this.forwardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.seekBy(10);
      this.showToast('+10s');
    });

    this.muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.toggleMute();
    });

    this.volumeSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      this._player.setVolume(val);
      if (val === 0) {
        this._player.mute();
      } else if (this._player.isMuted()) {
        this._player.unmute();
      }
    });

    // Settings Menu Toggle
    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = this.settingsMenu.classList.contains('is-open');
      if (isOpen) {
        this.settingsMenu.classList.remove('is-open');
        this.settingsBtn.setAttribute('aria-expanded', 'false');
      } else {
        this.settingsMenu.classList.add('is-open');
        this.settingsBtn.setAttribute('aria-expanded', 'true');
        this.switchMenuView('root');
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.settingsWrapper.contains(e.target)) {
        this.settingsMenu.classList.remove('is-open');
        this.settingsBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.settingsMenu.classList.contains('is-open')) {
        this.settingsMenu.classList.remove('is-open');
        this.settingsBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Submenu navigations from root view
    this.speedNavBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switchMenuView('speed');
    });

    this.qualityNavBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switchMenuView('quality');
    });

    this.captionsNavBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switchMenuView('captions');
    });

    // Back button navigations
    this.speedBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switchMenuView('root');
    });

    this.qualityBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switchMenuView('root');
    });

    this.captionsBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switchMenuView('root');
    });

    // Speed options
    for (const item of this.speedItems) {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const speed = Number(item.getAttribute('data-speed'));
        this._player.setPlaybackRate(speed);
        this.setSpeed(speed);
        this.switchMenuView('root');
        this.showToast(`Speed: ${speed === 1 ? 'Normal' : `${speed}×`}`);
      });
    }

    this.chaptersBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.events.emit('ui:toggle-chapters');
    });

    this.captionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.toggleCaptions();
    });

    this.theaterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.events.emit('ui:toggle-theater');
    });

    this.miniBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.events.emit('ui:toggle-mini');
    });

    this.fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.events.emit('ui:toggle-fullscreen');
    });
  }

  /**
   * Updates Play/Pause button icons.
   * @param {boolean} isPlaying
   * @param {boolean} isEnded
   */
  setPlayState(isPlaying, isEnded = false) {
    if (isEnded) {
      this.playBtn.innerHTML = Icons.replay;
      this.centerPlayBtn.innerHTML = Icons.replay;
      this.centerPlayBtn.classList.remove('is-hidden');
    } else if (isPlaying) {
      this.playBtn.innerHTML = Icons.pause;
      this.playBtn.setAttribute('title', 'Pause (Space)');
      this.centerPlayBtn.classList.add('is-hidden');
    } else {
      this.playBtn.innerHTML = Icons.play;
      this.playBtn.setAttribute('title', 'Play (Space)');
      this.centerPlayBtn.innerHTML = Icons.play;
      this.centerPlayBtn.classList.remove('is-hidden');
    }
  }

  /**
   * Updates Volume icons and slider position.
   * @param {number} volume
   * @param {boolean} muted
   */
  setVolumeState(volume, muted) {
    this.volumeSlider.value = String(volume);
    if (muted || volume === 0) {
      this.muteBtn.innerHTML = Icons.volumeMute;
    } else if (volume < 50) {
      this.muteBtn.innerHTML = Icons.volumeLow;
    } else {
      this.muteBtn.innerHTML = Icons.volumeHigh;
    }
  }

  /**
   * Updates current time and total duration display.
   * Progressive disclosure: total duration is hidden until valid metadata arrives.
   * @param {number} current
   * @param {number} duration
   */
  setTime(current, duration) {
    if (!duration || duration <= 0 || isNaN(duration)) {
      this.timeDisplay.textContent = formatTime(current);
    } else {
      this.timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }
  }

  /**
   * Updates fullscreen icon depending on active fullscreen state.
   * @param {boolean} isFullscreen
   */
  setFullscreenState(isFullscreen) {
    this.fullscreenBtn.innerHTML = isFullscreen ? Icons.fullscreenExit : Icons.fullscreen;
  }

  /**
   * Updates mini player button state and icon.
   * @param {boolean} isMini
   */
  setMiniState(isMini) {
    if (this.miniBtn) {
      this.miniBtn.innerHTML = isMini ? (this.icons.expand || Icons.expand) : this.icons.mini;
      this.miniBtn.setAttribute('title', isMini ? 'Expand to page (I)' : 'Mini player (I)');
      this.miniBtn.setAttribute('aria-label', isMini ? 'Expand to page' : 'Mini player');
    }
  }

  /**
   * Shows a brief visual toast message.
   * @param {string} msg
   * @param {number} [durationMs=1000]
   */
  showToast(msg, durationMs = 1000) {
    this.toast.textContent = msg;
    this.toast.classList.add('is-visible');

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.remove('is-visible');
    }, durationMs);
  }

  /**
   * Displays the error overlay with specific message.
   * @param {string} message
   */
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorOverlay.classList.add('is-visible');
    this.loader.classList.add('is-hidden');
    this.centerPlayBtn.classList.add('is-hidden');
  }

  /**
   * Toggles the loader indicator.
   * @param {boolean} show
   */
  setLoading(show) {
    this.loader.classList.toggle('is-visible', show);
  }

  /**
   * Sets active playback speed indicator and updates menu state.
   * @param {number} speed
   */
  setSpeed(speed) {
    const label = speed === 1 ? 'Normal' : `${speed}×`;
    if (this.speedNavVal) {
      this.speedNavVal.textContent = label;
    }
    if (this.speedItems) {
      for (const btn of this.speedItems) {
        const btnSpeed = Number(btn.getAttribute('data-speed'));
        const isActive = btnSpeed === speed;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-checked', String(isActive));
      }
    }
  }

  /**
   * Switches the active settings view: 'root', 'speed', 'quality', or 'captions'.
   * @param {'root'|'speed'|'quality'|'captions'} [viewName='root']
   */
  switchMenuView(viewName = 'root') {
    this._currentMenuView = viewName;
    if (this.menuRootView) this.menuRootView.classList.toggle('is-active', viewName === 'root');
    if (this.speedSubView) this.speedSubView.classList.toggle('is-active', viewName === 'speed');
    if (this.qualitySubView) this.qualitySubView.classList.toggle('is-active', viewName === 'quality');
    if (this.captionsSubView) this.captionsSubView.classList.toggle('is-active', viewName === 'captions');
  }

  /**
   * Updates closed captions button state and visual feedback.
   * @param {boolean} enabled
   * @param {string|null} [activeTrack]
   */
  setCaptionsState(enabled, activeTrack) {
    this.captionsBtn.classList.toggle('is-active', Boolean(enabled));
    if (this.captionsNavVal) {
      this.captionsNavVal.textContent = enabled ? (activeTrack || 'On') : 'Off';
    }
    if (enabled) {
      this.showToast(`Captions: ${activeTrack || 'On'}`);
    } else {
      this.showToast('Captions: Off');
    }
  }

  /**
   * Updates subtitles menu options with checkmarks and hierarchical navigation.
   * Progressive disclosure: only displayed when caption tracks actually exist.
   * @param {Array<{ languageCode: string, displayName: string }>} tracks
   * @param {string|null} activeTrack
   * @param {boolean} isEnabled
   */
  updateCaptionsMenu(tracks = [], activeTrack = null, isEnabled = false) {
    this.captionsMenuList.innerHTML = '';
    const hasCaptions = Array.isArray(tracks) && tracks.length > 0;

    // Progressive disclosure: Only show CC button and Subtitles settings row if tracks exist
    this.captionsBtn.style.display = hasCaptions ? '' : 'none';
    this.captionsNavBtn.style.display = hasCaptions ? 'flex' : 'none';

    if (!hasCaptions) {
      return;
    }

    let activeLabel = 'Off';
    if (isEnabled) {
      const activeObj = tracks.find((t) => t.languageCode === activeTrack);
      activeLabel = activeObj ? (activeObj.displayName || activeObj.languageCode) : (activeTrack || 'On');
    }
    if (this.captionsNavVal) {
      this.captionsNavVal.textContent = activeLabel;
    }

    // "Off" option
    const offBtn = createElement('button', {
      className: `cyp-menu-item ${!isEnabled ? 'is-active' : ''}`,
      attributes: { type: 'button', role: 'menuitemradio', 'aria-checked': String(!isEnabled) },
      children: [
        createElement('span', { className: 'cyp-item-label', textContent: 'Off' }),
        createElement('span', { className: 'cyp-item-check', innerHTML: this.icons.check || '✓' })
      ]
    });
    offBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._player.disableCaptions();
      this.updateCaptionsMenu(tracks, null, false);
      this.switchMenuView('root');
      this.showToast('Captions: Off');
    });
    this.captionsMenuList.appendChild(offBtn);

    // List each track
    for (const track of tracks) {
      const isActive = isEnabled && track.languageCode === activeTrack;
      const displayName = track.displayName || track.languageCode;
      const trackBtn = createElement('button', {
        className: `cyp-menu-item ${isActive ? 'is-active' : ''}`,
        attributes: {
          type: 'button',
          'data-lang': track.languageCode,
          role: 'menuitemradio',
          'aria-checked': String(isActive)
        },
        children: [
          createElement('span', { className: 'cyp-item-label', textContent: displayName }),
          createElement('span', { className: 'cyp-item-check', innerHTML: this.icons.check || '✓' })
        ]
      });
      trackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._player.setCaptionTrack(track.languageCode);
        this.updateCaptionsMenu(tracks, track.languageCode, true);
        this.switchMenuView('root');
        this.showToast(`Captions: ${displayName}`);
      });
      this.captionsMenuList.appendChild(trackBtn);
    }
  }

  /**
   * Updates quality menu items from available quality levels with checkmarks.
   * Progressive disclosure: only displayed when quality levels actually exist.
   * @param {string[]} levels
   * @param {string} currentQuality
   */
  updateQualityMenu(levels = [], currentQuality = 'auto') {
    this.qualityMenuList.innerHTML = '';
    const hasQuality = Array.isArray(levels) && levels.length > 1;

    // Progressive disclosure: Only show Quality row in settings if multiple levels exist
    this.qualityNavBtn.style.display = hasQuality ? 'flex' : 'none';

    if (!hasQuality) {
      return;
    }

    const qualityMap = {
      highres: '4K (2160p)',
      hd1440: '1440p QHD',
      hd1080: '1080p HD',
      hd720: '720p',
      large: '480p',
      medium: '360p',
      small: '240p',
      tiny: '144p',
      auto: 'Auto'
    };

    const currentLabel = qualityMap[currentQuality] || currentQuality;
    if (this.qualityNavVal) {
      this.qualityNavVal.textContent = currentLabel;
    }

    const allLevels = [...levels];
    if (!allLevels.includes('auto')) {
      allLevels.unshift('auto');
    }

    for (const lvl of allLevels) {
      const isActive = lvl === currentQuality;
      const label = qualityMap[lvl] || lvl;
      const btn = createElement('button', {
        className: `cyp-menu-item ${isActive ? 'is-active' : ''}`,
        attributes: { type: 'button', 'data-quality': lvl, role: 'menuitemradio', 'aria-checked': String(isActive) },
        children: [
          createElement('span', { className: 'cyp-item-label', textContent: label }),
          createElement('span', { className: 'cyp-item-check', innerHTML: this.icons.check || '✓' })
        ]
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._player.setPlaybackQuality(lvl);
        this.updateQualityMenu(allLevels, lvl);
        this.switchMenuView('root');
        this.showToast(`Quality: ${label}`);
      });
      this.qualityMenuList.appendChild(btn);
    }
  }

  /**
   * Dynamically toggles visibility of an individual control button.
   * @param {'play'|'rewind'|'forward'|'volume'|'time'|'chapters'|'captions'|'settings'|'theater'|'mini'|'fullscreen'} controlName
   * @param {boolean} visible
   */
  setControlVisibility(controlName, visible) {
    const map = {
      play: this.playBtn,
      rewind: this.backBtn,
      forward: this.forwardBtn,
      volume: this.volumeGroup,
      time: this.timeDisplay,
      chapters: this.chaptersBtn,
      captions: this.captionsBtn,
      settings: this.settingsWrapper,
      theater: this.theaterBtn,
      mini: this.miniBtn,
      fullscreen: this.fullscreenBtn
    };

    const el = map[controlName];
    if (el) {
      el.style.display = visible ? '' : 'none';
    }
  }

  destroy() {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this.container.remove();
    this.centerPlayBtn.remove();
    this.loader.remove();
    this.errorOverlay.remove();
    this.toast.remove();
  }
}

