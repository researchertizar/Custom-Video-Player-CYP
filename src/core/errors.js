/**
 * Standardized player error types and factory.
 */

export const ErrorCode = {
  API_LOAD_FAILED: 'API_LOAD_FAILED',
  API_TIMEOUT: 'API_TIMEOUT',
  INVALID_VIDEO_ID: 'INVALID_VIDEO_ID',
  VIDEO_UNAVAILABLE: 'VIDEO_UNAVAILABLE',
  EMBEDDING_DISABLED: 'EMBEDDING_DISABLED',
  HTML5_ERROR: 'HTML5_ERROR',
  PLAYER_NOT_READY: 'PLAYER_NOT_READY',
  PLAYER_DESTROYED: 'PLAYER_DESTROYED',
  UNKNOWN: 'UNKNOWN'
};

export class PlayerError extends Error {
  /**
   * @param {string} code - One of ErrorCode values.
   * @param {string} message - Human readable message.
   * @param {any} [originalError] - Raw underlying error or event code.
   */
  constructor(code, message, originalError = null) {
    super(message);
    this.name = 'PlayerError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Maps YouTube API error numeric codes (2, 5, 100, 101, 150) to PlayerError.
 * @param {number} code
 * @returns {PlayerError}
 */
export function mapYouTubeError(code) {
  switch (code) {
    case 2:
      return new PlayerError(ErrorCode.INVALID_VIDEO_ID, 'The requested video ID is invalid or malformed.', code);
    case 5:
      return new PlayerError(ErrorCode.HTML5_ERROR, 'The requested content cannot be played in an HTML5 player.', code);
    case 100:
      return new PlayerError(ErrorCode.VIDEO_UNAVAILABLE, 'The video was removed, made private, or is unavailable.', code);
    case 101:
    case 150:
      return new PlayerError(ErrorCode.EMBEDDING_DISABLED, 'The video owner does not allow embedding this video.', code);
    default:
      return new PlayerError(ErrorCode.UNKNOWN, `An unexpected playback error occurred (Code: ${code}).`, code);
  }
}

