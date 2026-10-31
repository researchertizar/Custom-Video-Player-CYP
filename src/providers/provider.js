/**
 * Abstract Provider interface.
 * All media backends (YouTube, HTML5, etc.) must implement this contract.
 */

export class Provider {
  /**
   * @param {import('../core/events.js').EventEmitter} emitter
   */
  constructor(emitter) {
    this._emitter = emitter;
  }

  /**
   * Initialize provider into the host element.
   * @param {HTMLElement} container
   * @param {string} videoId
   * @param {object} [options]
   * @returns {Promise<void>}
   */
  async init(container, videoId, options = {}) {
    throw new Error('Provider.init() must be implemented.');
  }

  /**
   * Begins or resumes playback.
   * @returns {Promise<void>|void}
   */
  play() {
    throw new Error('Provider.play() must be implemented.');
  }

  /**
   * Pauses playback.
   */
  pause() {
    throw new Error('Provider.pause() must be implemented.');
  }

  /**
   * Stops playback.
   */
  stop() {
    throw new Error('Provider.stop() must be implemented.');
  }

  /**
   * Seeks to a specific timestamp in seconds.
   * @param {number} seconds
   * @param {boolean} [allowSeekAhead=true]
   */
  seekTo(seconds, allowSeekAhead = true) {
    throw new Error('Provider.seekTo() must be implemented.');
  }

  /**
   * Returns the current playback time in seconds.
   * @returns {number}
   */
  getCurrentTime() {
    return 0;
  }

  /**
   * Returns the video duration in seconds.
   * @returns {number}
   */
  getDuration() {
    return 0;
  }

  /**
   * Returns fraction of video buffered (0 to 1).
   * @returns {number}
   */
  getVideoLoadedFraction() {
    return 0;
  }

  /**
   * Sets volume level (0-100).
   * @param {number} value
   */
  setVolume(value) {
    throw new Error('Provider.setVolume() must be implemented.');
  }

  /**
   * Gets current volume level (0-100).
   * @returns {number}
   */
  getVolume() {
    return 100;
  }

  /**
   * Mutes playback.
   */
  mute() {
    throw new Error('Provider.mute() must be implemented.');
  }

  /**
   * Unmutes playback.
   */
  unmute() {
    throw new Error('Provider.unmute() must be implemented.');
  }

  /**
   * Returns whether audio is muted.
   * @returns {boolean}
   */
  isMuted() {
    return false;
  }

  /**
   * Sets playback rate (0.25 to 2.0).
   * @param {number} rate
   */
  setPlaybackRate(rate) {
    throw new Error('Provider.setPlaybackRate() must be implemented.');
  }

  /**
   * Returns current playback rate.
   * @returns {number}
   */
  getPlaybackRate() {
    return 1;
  }

  /**
   * Loads a new video by ID.
   * @param {string} videoId
   * @param {number} [startSeconds=0]
   */
  loadVideo(videoId, startSeconds = 0) {
    throw new Error('Provider.loadVideo() must be implemented.');
  }

  /**
   * Retrieves video metadata.
   * @returns {{ title: string, author: string, videoId: string }}
   */
  getVideoData() {
    return { title: '', author: '', videoId: '' };
  }

  /**
   * Tears down provider and cleans up event handlers and references.
   */
  destroy() {
    // Override in subclass
  }
}

