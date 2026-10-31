/**
 * Time formatting and parsing utilities.
 */

/**
 * Formats a time in seconds to a string (M:SS or H:MM:SS).
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = String(secs).padStart(2, '0');

  if (hours > 0) {
    const paddedMins = String(minutes).padStart(2, '0');
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }

  return `${minutes}:${paddedSecs}`;
}

/**
 * Parses a time string (e.g. "1:30", "01:15:00", or "90") into seconds.
 * @param {string|number} input
 * @returns {number}
 */
export function parseTime(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) && input >= 0 ? input : 0;
  }

  if (typeof input !== 'string') {
    return 0;
  }

  const parts = input.trim().split(':').map(Number);
  if (parts.some(isNaN)) {
    return 0;
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 1) {
    return parts[0] || 0;
  }

  return 0;
}

