/**
 * YouTube URL and Video ID parser and validator.
 */

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts a YouTube video ID and optional start time from a URL or video ID string.
 * @param {string} input - URL or video ID.
 * @param {number} [depth=0] - Recursion guard for obfuscated tokens.
 * @returns {{ videoId: string|null, startTime: number }}
 */
export function parseYouTubeUrl(input, depth = 0) {
  if (!input || typeof input !== 'string' || depth > 5) {
    return { videoId: null, startTime: 0 };
  }

  const trimmed = input.trim();

  // Obfuscated / Base64 Token: b64:... or base64:... or enc:...
  if (trimmed.startsWith('b64:') || trimmed.startsWith('base64:') || trimmed.startsWith('enc:')) {
    try {
      const payload = trimmed.split(':')[1];
      const decoded = typeof atob === 'function'
        ? atob(payload)
        : Buffer.from(payload, 'base64').toString('utf8');
      return parseYouTubeUrl(decoded, depth + 1);
    } catch {
      return { videoId: null, startTime: 0 };
    }
  }

  // Direct 11-character video ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return { videoId: trimmed, startTime: 0 };
  }

  // Obfuscated or direct ID with timestamp query: <id>?t=<time>
  if (trimmed.includes('?') && !trimmed.includes('/') && !trimmed.startsWith('http')) {
    const [rawId, query] = trimmed.split('?');
    if (YOUTUBE_ID_REGEX.test(rawId)) {
      const params = new URLSearchParams(query);
      const timeParam = params.get('t') || params.get('start');
      const startTime = timeParam ? parseTimeStringToSeconds(timeParam) : 0;
      return { videoId: rawId, startTime };
    }
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '');
    let videoId = null;
    let startTime = 0;

    // Time offset query param ('t' or 'start')
    const timeParam = url.searchParams.get('t') || url.searchParams.get('start');
    if (timeParam) {
      startTime = parseTimeStringToSeconds(timeParam);
    }

    if (host === 'youtu.be') {
      // Short URL: youtu.be/<id>
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0 && YOUTUBE_ID_REGEX.test(pathParts[0])) {
        videoId = pathParts[0];
      }
    } else if (host.includes('youtube.com')) {
      // Standard: youtube.com/watch?v=<id>
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        if (v && YOUTUBE_ID_REGEX.test(v)) {
          videoId = v;
        }
      }
      // Embed: youtube.com/embed/<id>
      else if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.replace('/embed/', '').split('/')[0];
        if (id && YOUTUBE_ID_REGEX.test(id)) {
          videoId = id;
        }
      }
      // Shorts: youtube.com/shorts/<id>
      else if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.replace('/shorts/', '').split('/')[0];
        if (id && YOUTUBE_ID_REGEX.test(id)) {
          videoId = id;
        }
      }
    }

    return { videoId, startTime };
  } catch {
    return { videoId: null, startTime: 0 };
  }
}

/**
 * Validates whether a string is a valid YouTube 11-char ID.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidVideoId(id) {
  return typeof id === 'string' && YOUTUBE_ID_REGEX.test(id.trim());
}

/**
 * Encodes a video ID and optional start time into an obfuscated stream token.
 * Prevents plain-text YouTube URLs from being exposed in HTML/attributes.
 * @param {string} videoId
 * @param {number} [startTime=0]
 * @returns {string} e.g. "b64:ZFF3NHc5V2dYY1E="
 */
export function encodeStreamToken(videoId, startTime = 0) {
  if (!videoId) return '';
  const payload = startTime > 0 ? `${videoId}?t=${Math.floor(startTime)}` : videoId;
  const encoded = typeof btoa === 'function'
    ? btoa(payload)
    : Buffer.from(payload, 'utf8').toString('base64');
  return `b64:${encoded}`;
}

/**
 * Decodes an obfuscated stream token.
 * @param {string} token
 * @returns {{ videoId: string|null, startTime: number }}
 */
export function decodeStreamToken(token) {
  return parseYouTubeUrl(token);
}

/**
 * Helper to parse time strings like "1h2m3s", "90s", "1m30s", or raw numbers.
 * @param {string} str
 * @returns {number}
 */
function parseTimeStringToSeconds(str) {
  if (!str) return 0;
  if (/^\d+$/.test(str)) return parseInt(str, 10);

  let total = 0;
  const hoursMatch = str.match(/(\d+)h/);
  const minutesMatch = str.match(/(\d+)m/);
  const secondsMatch = str.match(/(\d+)s/);

  if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 3600;
  if (minutesMatch) total += parseInt(minutesMatch[1], 10) * 60;
  if (secondsMatch) total += parseInt(secondsMatch[1], 10);

  return total;
}

