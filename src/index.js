/**
 * Custom Video Player (CYP) - Main Library Entry Point.
 * Zero-runtime-dependency universal video player engine for HTML5 and YouTube.
 */


import { Player } from './core/player.js';
import { Provider } from './providers/provider.js';
import { YouTubeProvider } from './providers/youtube/youtube-provider.js';
import { HTML5Provider } from './providers/html5/html5-provider.js';
import { ProviderRegistry } from './providers/provider-registry.js';
import { detectSource } from './utils/source-detector.js';
import { resumePlugin } from './plugins/resume.js';
import { chaptersPlugin } from './plugins/chapters.js';
import { keyboardPlugin } from './plugins/keyboard.js';
import { gesturesPlugin } from './plugins/gestures.js';
import { CustomYouTubePlayerElement, CustomVideoPlayerElement } from './web-component.js';
import { parseYouTubeUrl, isValidVideoId, encodeStreamToken, decodeStreamToken } from './utils/youtube-url.js';
import { formatTime, parseTime } from './utils/time.js';
import { sanitizeUrl, escapeHtml } from './utils/dom.js';
import { PlayerError, ErrorCode, mapYouTubeError } from './core/errors.js';
import { PlayerPresets } from './core/presets.js';

import { Icons, getIcons } from './ui/icons.js';

/**
 * Creates and initializes a Player instance.
 * @param {object} options
 * @returns {Player}
 */
export function createPlayer(options) {
  return new Player(options);
}

// Global UMD export compatibility
export const CustomYouTubePlayer = {
  Player,
  create: createPlayer,
  Provider,
  YouTubeProvider,
  HTML5Provider,
  ProviderRegistry,
  detectSource,
  PlayerPresets,
  resumePlugin,
  chaptersPlugin,
  keyboardPlugin,
  gesturesPlugin,
  parseYouTubeUrl,
  isValidVideoId,
  encodeStreamToken,
  decodeStreamToken,
  formatTime,
  parseTime,
  sanitizeUrl,
  escapeHtml,
  PlayerError,
  ErrorCode,
  mapYouTubeError,
  Icons,
  getIcons
};

export const CustomVideoPlayer = CustomYouTubePlayer;

export {
  Player,
  Provider,
  YouTubeProvider,
  HTML5Provider,
  ProviderRegistry,
  detectSource,
  PlayerPresets,
  resumePlugin,
  chaptersPlugin,
  keyboardPlugin,
  gesturesPlugin,
  CustomYouTubePlayerElement,
  CustomVideoPlayerElement,
  parseYouTubeUrl,
  isValidVideoId,
  encodeStreamToken,
  decodeStreamToken,
  formatTime,
  parseTime,
  sanitizeUrl,
  escapeHtml,
  PlayerError,
  ErrorCode,
  mapYouTubeError,
  Icons,
  getIcons
};

export default CustomYouTubePlayer;
