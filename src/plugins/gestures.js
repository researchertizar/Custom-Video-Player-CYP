/**
 * Mobile Touch Gestures Plugin.
 * Handles double-tap seeking (left half = -10s, right half = +10s).
 */

export function gesturesPlugin(options = {}) {
  const config = {
    doubleTapThresholdMs: 300,
    seekSeconds: 10,
    ...options
  };

  let playerInstance = null;
  let lastTapTime = 0;
  let touchHandler = null;

  return {
    name: 'gestures',

    install(player) {
      playerInstance = player;

      const target = player._ui?.clickInterceptor || player._container;
      if (!target) return;

      touchHandler = (e) => {
        const now = Date.now();
        const diff = now - lastTapTime;

        if (diff > 0 && diff < config.doubleTapThresholdMs) {
          const touch = e.changedTouches[0];
          const rect = target.getBoundingClientRect();
          const x = touch.clientX - rect.left;

          if (x < rect.width / 2) {
            player.seekBy(-config.seekSeconds);
            if (player._ui?.controls) player._ui.controls.showToast(`-${config.seekSeconds}s`);
          } else {
            player.seekBy(config.seekSeconds);
            if (player._ui?.controls) player._ui.controls.showToast(`+${config.seekSeconds}s`);
          }
        }

        lastTapTime = now;
      };

      target.addEventListener('touchend', touchHandler, { passive: true });
    },

    destroy() {
      const target = playerInstance?._ui?.clickInterceptor || playerInstance?._container;
      if (target && touchHandler) {
        target.removeEventListener('touchend', touchHandler);
      }
      touchHandler = null;
    }
  };
}

