/**
 * Shared singleton loader for the YouTube IFrame Player API.
 */

import { PlayerError, ErrorCode } from '../../core/errors.js';

const YT_SCRIPT_URL = 'https://www.youtube.com/iframe_api';
const DEFAULT_TIMEOUT_MS = 15000;

class YouTubeLoader {
  constructor() {
    /** @type {Promise<void>|null} */
    this._loadPromise = null;
    this._isReady = false;
  }

  /**
   * Loads the YouTube IFrame API script and resolves when `window.YT` is ready.
   * @param {number} [timeoutMs=15000]
   * @returns {Promise<void>}
   */
  load(timeoutMs = DEFAULT_TIMEOUT_MS) {
    if (typeof window === 'undefined') {
      return Promise.reject(new PlayerError(ErrorCode.API_LOAD_FAILED, 'Window is not defined.'));
    }

    // 1. Already fully loaded and ready
    if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
      this._isReady = true;
      return Promise.resolve();
    }

    // 2. If load is already in-flight, return the shared promise
    if (this._loadPromise) {
      return this._loadPromise;
    }

    this._loadPromise = new Promise((resolve, reject) => {
      let timeoutId = null;
      let pollInterval = null;

      const checkReady = () => {
        if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
          if (timeoutId) clearTimeout(timeoutId);
          if (pollInterval) clearInterval(pollInterval);
          this._isReady = true;
          resolve();
          return true;
        }
        return false;
      };

      if (checkReady()) return;

      // Set timeout guard
      timeoutId = setTimeout(() => {
        if (pollInterval) clearInterval(pollInterval);
        this._loadPromise = null;
        reject(
          new PlayerError(
            ErrorCode.API_TIMEOUT,
            `YouTube IFrame API failed to load within ${timeoutMs}ms.`
          )
        );
      }, timeoutMs);

      // Handle existing callback hook without overriding other listeners
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousCallback === 'function') {
          try {
            previousCallback();
          } catch (e) {
            console.error('[YouTubeLoader] Error in existing onYouTubeIframeAPIReady:', e);
          }
        }
        checkReady();
      };

      // Periodic check interval in case onYouTubeIframeAPIReady fired before hook registration
      pollInterval = setInterval(() => {
        checkReady();
      }, 50);

      // Check if script tag is already injected in DOM
      const existingScript = document.querySelector(`script[src="${YT_SCRIPT_URL}"]`);
      if (!existingScript) {
        // Inject script tag
        const script = document.createElement('script');
        script.src = YT_SCRIPT_URL;
        script.async = true;

        script.onerror = (err) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (pollInterval) clearInterval(pollInterval);
          this._loadPromise = null;
          reject(
            new PlayerError(
              ErrorCode.API_LOAD_FAILED,
              'Failed to load the YouTube IFrame API script.',
              err
            )
          );
        };

        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          document.head.appendChild(script);
        }
      }
    });

    return this._loadPromise;
  }

  /**
   * Returns whether the YouTube API is ready.
   * @returns {boolean}
   */
  isReady() {
    return this._isReady || Boolean(window.YT && window.YT.Player);
  }
}

export const youtubeLoader = new YouTubeLoader();
