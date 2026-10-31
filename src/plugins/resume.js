/**
 * Playback Resume Plugin.
 * Saves playback progress to localStorage and restores it seamlessly on next visit.
 */

import { formatTime } from '../utils/time.js';

export function resumePlugin(options = {}) {
  const config = {
    storageKeyPrefix: 'cyp_resume_',
    minResumeTime: 5, // Only resume if played > 5s
    endThreshold: 5,  // Don't resume if within 5s of ending
    saveIntervalMs: 3000,
    storage: typeof window !== 'undefined' ? window.localStorage : null,
    ...options
  };

  let playerInstance = null;
  let saveTimer = null;
  let unsubs = [];

  const getKey = () => `${config.storageKeyPrefix}${playerInstance._currentVideoId}`;

  const saveCurrentPosition = () => {
    if (!config.storage || !playerInstance) return;
    const current = playerInstance.getCurrentTime();
    const duration = playerInstance.getDuration();

    if (current > config.minResumeTime && duration > 0 && current < duration - config.endThreshold) {
      try {
        config.storage.setItem(getKey(), String(Math.floor(current)));
      } catch {
        // LocalStorage quota or access error
      }
    }
  };

  const restoreSavedPosition = () => {
    if (!config.storage || !playerInstance) return;

    try {
      const savedRaw = config.storage.getItem(getKey());
      if (!savedRaw) return;

      const savedTime = parseInt(savedRaw, 10);
      const duration = playerInstance.getDuration();

      if (savedTime > config.minResumeTime && (!duration || savedTime < duration - config.endThreshold)) {
        playerInstance.seekTo(savedTime);
        if (playerInstance._ui && playerInstance._ui.controls) {
          playerInstance._ui.controls.showToast(`Resumed at ${formatTime(savedTime)}`, 1800);
        }
      }
    } catch {
      // Ignore storage errors
    }
  };

  const clearSavedPosition = () => {
    if (!config.storage || !playerInstance) return;
    try {
      config.storage.removeItem(getKey());
    } catch {
      // Ignore
    }
  };

  return {
    name: 'resume',

    install(player) {
      playerInstance = player;

      unsubs.push(
        player.on('ready', () => {
          restoreSavedPosition();
        })
      );

      unsubs.push(
        player.on('playing', () => {
          if (!saveTimer) {
            saveTimer = setInterval(saveCurrentPosition, config.saveIntervalMs);
          }
        })
      );

      unsubs.push(
        player.on('pause', () => {
          saveCurrentPosition();
        })
      );

      unsubs.push(
        player.on('ended', () => {
          clearSavedPosition();
        })
      );

      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', saveCurrentPosition);
      }
    },

    destroy() {
      if (saveTimer) clearInterval(saveTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', saveCurrentPosition);
      }
      for (const unsub of unsubs) {
        unsub();
      }
      unsubs = [];
    }
  };
}

