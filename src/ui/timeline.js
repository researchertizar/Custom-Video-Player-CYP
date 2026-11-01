/**
 * Interactive Timeline Scrubber Component.
 */

import { createElement, clamp } from '../utils/dom.js';
import { formatTime } from '../utils/time.js';

export class Timeline {
  /**
   * @param {import('../core/player.js').Player} player
   */
  constructor(player) {
    this._player = player;
    this._isDragging = false;
    this._duration = 0;

    this._build();
    this._bindEvents();
  }

  _build() {
    this.element = createElement('div', {
      className: 'cyp-timeline',
      attributes: {
        role: 'slider',
        'aria-label': 'Video progress bar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': '0',
        tabindex: '0'
      }
    });

    this.track = createElement('div', { className: 'cyp-timeline-track' });
    this.bufferBar = createElement('div', { className: 'cyp-timeline-buffer' });
    this.playedBar = createElement('div', { className: 'cyp-timeline-played' });
    this.thumb = createElement('div', { className: 'cyp-timeline-thumb' });
    this.tooltip = createElement('div', { className: 'cyp-timeline-tooltip', textContent: '0:00' });
    this.markersContainer = createElement('div', { className: 'cyp-timeline-markers' });

    this.track.appendChild(this.bufferBar);
    this.track.appendChild(this.playedBar);
    this.track.appendChild(this.markersContainer);
    this.track.appendChild(this.thumb);

    this.element.appendChild(this.track);
    this.element.appendChild(this.tooltip);
  }

  _bindEvents() {
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._onHoverMove = this._handleHoverMove.bind(this);

    this.element.addEventListener('pointerdown', this._onPointerDown);
    this.element.addEventListener('pointermove', this._onHoverMove);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  }

  /**
   * Calculates scrub percentage based on a pointer event.
   * @param {PointerEvent} e
   * @returns {number} 0 to 1
   */
  _getPercentageFromEvent(e) {
    const rect = this.track.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return clamp((e.clientX - rect.left) / rect.width, 0, 1);
  }

  _handlePointerDown(e) {
    if (e.button !== 0) return; // Left click only
    this._isDragging = true;
    this.element.classList.add('is-scrubbing');

    try {
      this.element.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    const pct = this._getPercentageFromEvent(e);
    this._applyScrub(pct);
  }

  _handlePointerMove(e) {
    if (!this._isDragging) return;
    const pct = this._getPercentageFromEvent(e);
    this._applyScrub(pct);
  }

  _handlePointerUp(e) {
    if (!this._isDragging) return;
    this._isDragging = false;
    this.element.classList.remove('is-scrubbing');

    try {
      this.element.releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
  }

  _handleHoverMove(e) {
    const rect = this.track.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const pct = x / rect.width;
    const targetSeconds = (this._duration || 0) * pct;

    this.tooltip.textContent = formatTime(targetSeconds);
    const tooltipWidth = this.tooltip.offsetWidth || 40;
    const clampedX = clamp(x, tooltipWidth / 2, rect.width - tooltipWidth / 2);
    this.tooltip.style.left = `${clampedX}px`;
  }

  _applyScrub(pct) {
    const duration = this._duration || this._player.getDuration() || 0;
    const targetSeconds = duration * pct;

    this.playedBar.style.width = `${pct * 100}%`;
    this.thumb.style.left = `${pct * 100}%`;
    this.element.setAttribute('aria-valuenow', String(Math.round(pct * 100)));

    this._player.seekTo(targetSeconds);
  }

  /**
   * Updates timeline visuals from player state sync.
   * @param {number} currentTime
   * @param {number} duration
   * @param {number} buffered
   */
  update(currentTime, duration, buffered) {
    this._duration = duration;

    // Buffer percentage
    const bufPct = clamp(buffered || 0, 0, 1) * 100;
    this.bufferBar.style.width = `${bufPct}%`;

    // Only update played position when the user is NOT actively dragging
    if (!this._isDragging) {
      const pct = duration > 0 ? clamp((currentTime / duration) * 100, 0, 100) : 0;
      this.playedBar.style.width = `${pct}%`;
      this.thumb.style.left = `${pct}%`;
      this.element.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
  }

  /**
   * Adds a visual chapter marker on the timeline.
   * @param {number} time
   * @param {string} [label]
   */
  addMarker(time, label = '') {
    const duration = this._duration || this._player.getDuration() || 1;
    const pct = clamp((time / duration) * 100, 0, 100);

    const marker = createElement('div', {
      className: 'cyp-timeline-marker',
      attributes: {
        title: label || formatTime(time)
      }
    });
    marker.style.left = `${pct}%`;
    this.markersContainer.appendChild(marker);
  }

  /**
   * Clears all chapter markers.
   */
  clearMarkers() {
    this.markersContainer.innerHTML = '';
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this._onPointerDown);
    this.element.removeEventListener('pointermove', this._onHoverMove);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    this.element.remove();
  }
}

