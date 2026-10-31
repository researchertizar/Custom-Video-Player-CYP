/**
 * Keyboard Shortcuts Plugin.
 * Standard YouTube / media player keyboard shortcuts.
 */

export function keyboardPlugin(options = {}) {
  const config = {
    seekSecondsShort: 5,
    seekSecondsLong: 10,
    ...options
  };

  let playerInstance = null;
  let keyHandler = null;
  let isHoveredOrFocused = false;

  let enterHandler = null;
  let leaveHandler = null;
  let focusInHandler = null;
  let focusOutHandler = null;

  return {
    name: 'keyboard',

    install(player) {
      playerInstance = player;
      const container = player._container;

      if (container) {
        enterHandler = () => { isHoveredOrFocused = true; };
        leaveHandler = () => { isHoveredOrFocused = false; };
        focusInHandler = () => { isHoveredOrFocused = true; };
        focusOutHandler = () => { isHoveredOrFocused = false; };

        container.addEventListener('mouseenter', enterHandler);
        container.addEventListener('mouseleave', leaveHandler);
        container.addEventListener('focusin', focusInHandler);
        container.addEventListener('focusout', focusOutHandler);
      }

      keyHandler = (e) => {
        // Guard against typing in forms or interactive input fields
        const target = e.target;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        ) {
          return;
        }

        // Multi-player disambiguation: only act if focused, hovered, or actively playing
        if (typeof document !== 'undefined') {
          const allPlayers = document.querySelectorAll('.cyp-player');
          if (allPlayers.length > 1 && container) {
            const hasFocus = container.contains(document.activeElement);
            const isPlaying = player.state.getField('status') === 'playing';
            if (!hasFocus && !isHoveredOrFocused && !isPlaying) {
              return;
            }
          }
        }

        const key = e.key.toLowerCase();

        switch (key) {
          case ' ':
          case 'k':
            e.preventDefault();
            player.togglePlay();
            break;

          case 'arrowleft':
            e.preventDefault();
            player.seekBy(-config.seekSecondsShort);
            if (player._ui?.controls) player._ui.controls.showToast(`-${config.seekSecondsShort}s`);
            break;

          case 'arrowright':
            e.preventDefault();
            player.seekBy(config.seekSecondsShort);
            if (player._ui?.controls) player._ui.controls.showToast(`+${config.seekSecondsShort}s`);
            break;

          case 'j':
            e.preventDefault();
            player.seekBy(-config.seekSecondsLong);
            if (player._ui?.controls) player._ui.controls.showToast(`-${config.seekSecondsLong}s`);
            break;

          case 'l':
            e.preventDefault();
            player.seekBy(config.seekSecondsLong);
            if (player._ui?.controls) player._ui.controls.showToast(`+${config.seekSecondsLong}s`);
            break;

          case 'm':
            e.preventDefault();
            player.toggleMute();
            break;

          case 'f':
            e.preventDefault();
            player.events.emit('ui:toggle-fullscreen');
            break;

          case 't':
            e.preventDefault();
            player.events.emit('ui:toggle-theater');
            break;

          case 'c':
            e.preventDefault();
            player.toggleCaptions();
            break;

          case 'i':
            e.preventDefault();
            player.events.emit('ui:toggle-mini');
            break;

          case 'escape':
            if (player._ui?.controls?.settingsMenu?.classList.contains('is-open')) {
              player._ui.controls.settingsMenu.classList.remove('is-open');
            } else if (player.state.getField('mini')) {
              if (player._ui) player._ui.toggleMini(false);
            }
            break;

          default:
            // 0 - 9 seek to percentage (0% to 90%)
            if (/^[0-9]$/.test(key)) {
              e.preventDefault();
              const pct = parseInt(key, 10) / 10;
              const duration = player.getDuration();
              if (duration > 0) {
                player.seekTo(duration * pct);
                if (player._ui?.controls) player._ui.controls.showToast(`${pct * 100}%`);
              }
            }
            break;
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', keyHandler);
      }
    },

    destroy() {
      if (typeof window !== 'undefined' && keyHandler) {
        window.removeEventListener('keydown', keyHandler);
      }
      keyHandler = null;

      const container = playerInstance?._container;
      if (container) {
        if (enterHandler) container.removeEventListener('mouseenter', enterHandler);
        if (leaveHandler) container.removeEventListener('mouseleave', leaveHandler);
        if (focusInHandler) container.removeEventListener('focusin', focusInHandler);
        if (focusOutHandler) container.removeEventListener('focusout', focusOutHandler);
      }
    }
  };
}
