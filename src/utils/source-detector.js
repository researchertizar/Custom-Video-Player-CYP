/**
 * Media Source & Provider Type Detector.
 * Determines whether a given media source should be handled by YouTubeProvider or HTML5Provider.
 */

import { parseYouTubeUrl } from './youtube-url.js';

const HTML5_EXTENSIONS = /\.(mp4|webm|ogg|ogv|m4v|mov|m3u8|mpd)(\?.*)?$/i;

/**
 * @typedef {'youtube' | 'html5'} ProviderType
 */

/**
 * Determines provider type and normalizes payload for the provider.
 * @param {string|object|Array} source
 * @param {object} [options={}]
 * @returns {{ type: ProviderType, target: any, startTime: number }}
 */
export function detectSource(source, options = {}) {
  // 1. Explicit override in options
  if (options.provider === 'youtube') {
    const { videoId, startTime } = parseYouTubeUrl(typeof source === 'string' ? source : '');
    return { type: 'youtube', target: videoId || source, startTime };
  }
  if (options.provider === 'html5') {
    return { type: 'html5', target: source, startTime: options.startTime || 0 };
  }

  // 2. Direct objects or arrays of sources are always HTML5
  if (Array.isArray(source) || (source && typeof source === 'object' && !Array.isArray(source))) {
    return { type: 'html5', target: source, startTime: options.startTime || 0 };
  }

  // 3. String source evaluation
  if (typeof source === 'string') {
    const trimmed = source.trim();

    // Blob URLs or Data URLs are HTML5
    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:video/')) {
      return { type: 'html5', target: trimmed, startTime: options.startTime || 0 };
    }

    // Direct video file extensions are HTML5
    if (HTML5_EXTENSIONS.test(trimmed)) {
      return { type: 'html5', target: trimmed, startTime: options.startTime || 0 };
    }

    // Attempt YouTube URL / ID parsing
    const { videoId, startTime } = parseYouTubeUrl(trimmed);
    if (videoId && !HTML5_EXTENSIONS.test(trimmed)) {
      return { type: 'youtube', target: videoId, startTime };
    }

    // Fallback: If it starts with http, https, or relative path without match, default to HTML5
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('./')) {
      return { type: 'html5', target: trimmed, startTime: options.startTime || 0 };
    }
  }

  // Fallback default
  return { type: 'youtube', target: source, startTime: options.startTime || 0 };
}

