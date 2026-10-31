/**
 * Custom YouTube Player - Main Library Entry Point.
 */

import '../styles/player.css';
import '../styles/controls.css';
import '../styles/themes.css';

import { Player } from './core/player.js';
import { Provider } from './providers/provider.js';
import { YouTubeProvider } from './providers/youtube/youtube-provider.js';
import { HTML5Provider } from './providers/html5/html5-provider.js';
import { detectSource } from './utils/source-detector.js';
import { resumePlugin } from './plugins/resume.js';
import { chaptersPlugin } from './plugins/chapters.js';
import { keyboardPlugin } from './plugins/keyboard.js';
import { gesturesPlugin } from './plugins/gestures.js';
import { CustomYouTubePlayerElement, CustomVideoPlayerElement } from './web-component.js';
import { parseYouTubeUrl, isValidVideoId, encodeStreamToken, decodeStreamToken } from './utils/youtube-url.js';
import { formatTime, parseTime } from './utils/time.js';
import { PlayerError, ErrorCode } from './core/errors.js';
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
  PlayerError,
  ErrorCode,
  Icons,
  getIcons
};

export const CustomVideoPlayer = CustomYouTubePlayer;

export {
  Player,
  Provider,
  YouTubeProvider,
  HTML5Provider,
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
  PlayerError,
  ErrorCode,
  Icons,
  getIcons
};

export default CustomYouTubePlayer;
