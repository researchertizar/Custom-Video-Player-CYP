/**
 * Chapters and Timeline Markers Plugin.
 */

import { createElement } from '../utils/dom.js';
import { formatTime } from '../utils/time.js';

export function chaptersPlugin(options = {}) {
  const chaptersList = Array.isArray(options.chapters) ? options.chapters : [];

  let playerInstance = null;
  let drawerElement = null;
  let chapterButtons = [];
  let unsubs = [];

  const updateActiveChapter = (currentTime) => {
    if (!drawerElement || chaptersList.length === 0) return;

    let activeIndex = -1;
    for (let i = 0; i < chaptersList.length; i++) {
      const nextTime = chaptersList[i + 1]?.time ?? Infinity;
      if (currentTime >= chaptersList[i].time && currentTime < nextTime) {
        activeIndex = i;
        break;
      }
    }

    chapterButtons.forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx === activeIndex);
    });
  };

  return {
    name: 'chapters',

    install(player) {
      playerInstance = player;

      const setupUI = () => {
        if (!player._ui || !player._ui.timeline) return;

        const hasChapters = Array.isArray(chaptersList) && chaptersList.length > 0;
        // Progressive disclosure: only display chapters button if chapters exist
        if (player._ui.controls) {
          player._ui.controls.setControlVisibility('chapters', hasChapters);
        }

        if (!hasChapters) {
          player._ui.timeline.clearMarkers();
          if (drawerElement) {
            drawerElement.remove();
            drawerElement = null;
          }
          return;
        }

        // Add markers to timeline track
        player._ui.timeline.clearMarkers();
        for (const chap of chaptersList) {
          player._ui.timeline.addMarker(chap.time, chap.title);
        }

        // Build chapters drawer
        if (!drawerElement) {
          drawerElement = createElement('div', { className: 'cyp-chapters-drawer' });
          const scrollWrap = createElement('div', { className: 'cyp-chapters-scroll' });

          chapterButtons = chaptersList.map((chap, idx) => {
            const btn = createElement('button', {
              className: `cyp-chapter-pill ${idx === 0 ? 'is-active' : ''}`,
              attributes: { type: 'button' },
              children: [
                createElement('span', { className: 'cyp-chap-time', textContent: formatTime(chap.time) }),
                createElement('span', { className: 'cyp-chap-title', textContent: chap.title })
              ]
            });

            btn.addEventListener('click', () => {
              player.seekTo(chap.time);
              drawerElement.classList.remove('is-open');
              if (player._ui.controls) {
                player._ui.controls.showToast(`Chapter: ${chap.title}`, 1200);
              }
            });

            scrollWrap.appendChild(btn);
            return btn;
          });

          drawerElement.appendChild(scrollWrap);
          player._ui.videoBox.appendChild(drawerElement);
        }
      };

      unsubs.push(
        player.on('ready', setupUI)
      );

      // If already ready, setup immediately
      if (player.state.getField('duration') > 0) {
        setupUI();
      }

      unsubs.push(
        player.on('ui:toggle-chapters', () => {
          if (drawerElement) {
            drawerElement.classList.toggle('is-open');
          }
        })
      );

      unsubs.push(
        player.on('change:currentTime', (time) => {
          updateActiveChapter(time);
        })
      );
    },

    setChapters(newChapters) {
      if (Array.isArray(newChapters)) {
        chaptersList.length = 0;
        chaptersList.push(...newChapters);
        if (playerInstance && playerInstance._ui) {
          if (drawerElement) {
            drawerElement.remove();
            drawerElement = null;
          }
          playerInstance.events.emit('ready');
        }
      }
    },

    destroy() {
      for (const unsub of unsubs) unsub();
      unsubs = [];
      if (drawerElement) {
        drawerElement.remove();
        drawerElement = null;
      }
    }
  };
}

