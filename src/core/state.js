/**
 * Reactive State Manager with granular change events.
 */

import { clamp } from '../utils/dom.js';

export const PlaybackStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  ENDED: 'ended',
  ERROR: 'error'
};

const INITIAL_STATE = {
  status: PlaybackStatus.IDLE,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 100,
  muted: false,
  playbackRate: 1,
  fullscreen: false,
  theater: false,
  mini: false,
  title: '',
  controlsVisible: true,
  hasStarted: false,
  isAd: false,
  captionsEnabled: false,
  captionTrack: null,
  captionTracks: []
};

export class StateManager {
  /**
   * @param {import('./events.js').EventEmitter} emitter
   * @param {object} [initialOverrides]
   */
  constructor(emitter, initialOverrides = {}) {
    this._emitter = emitter;
    this._state = { ...INITIAL_STATE, ...initialOverrides };
  }

  /**
   * Returns a copy of the current state snapshot.
   * @returns {typeof INITIAL_STATE}
   */
  get() {
    return { ...this._state };
  }

  /**
   * Get a specific state field.
   * @template {keyof typeof INITIAL_STATE} K
   * @param {K} key
   * @returns {typeof INITIAL_STATE[K]}
   */
  getField(key) {
    return this._state[key];
  }

  /**
   * Batch updates state and emits granular change events.
   * @param {Partial<typeof INITIAL_STATE>} updates
   */
  set(updates) {
    const changes = {};

    for (const [key, rawValue] of Object.entries(updates)) {
      if (!(key in this._state)) continue;

      let value = rawValue;

      // Sanitization & Clamping
      if (key === 'volume') {
        value = clamp(Number(value) || 0, 0, 100);
      } else if (key === 'currentTime' || key === 'duration') {
        value = Math.max(0, Number(value) || 0);
      } else if (key === 'buffered') {
        value = clamp(Number(value) || 0, 0, 1);
      } else if (key === 'playbackRate') {
        value = Math.max(0.1, Number(value) || 1);
      }

      const oldValue = this._state[key];
      if (oldValue !== value) {
        this._state[key] = value;
        changes[key] = { value, oldValue };
      }
    }

    if (Object.keys(changes).length > 0) {
      // Emit individual property changes
      for (const [key, { value, oldValue }] of Object.entries(changes)) {
        this._emitter.emit(`change:${key}`, value, oldValue);
      }
      // Emit batch change event
      this._emitter.emit('statechange', this.get(), changes);
    }
  }

  /**
   * Resets playback state for a new video load.
   */
  resetForNewVideo() {
    this.set({
      status: PlaybackStatus.LOADING,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      hasStarted: false,
      isAd: false,
      captionsEnabled: false,
      captionTrack: null,
      captionTracks: []
    });
  }
}

