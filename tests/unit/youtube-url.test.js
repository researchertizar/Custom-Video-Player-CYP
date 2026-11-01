import { describe, it, expect } from 'vitest';
import { parseYouTubeUrl, isValidVideoId, encodeStreamToken, decodeStreamToken } from '../../src/utils/youtube-url.js';
import { mapYouTubeError, ErrorCode } from '../../src/core/errors.js';

describe('YouTube URL Parser', () => {
  it('validates 11-char video IDs', () => {
    expect(isValidVideoId('dQw4w9WgXcQ')).toBe(true);
    expect(isValidVideoId('dQw4w9WgXc')).toBe(false);
    expect(isValidVideoId('dQw4w9WgXcQQ')).toBe(false);
  });

  it('parses bare video ID', () => {
    const res = parseYouTubeUrl('dQw4w9WgXcQ');
    expect(res.videoId).toBe('dQw4w9WgXcQ');
    expect(res.startTime).toBe(0);
  });

  it('parses standard watch URL', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res.videoId).toBe('dQw4w9WgXcQ');
    expect(res.startTime).toBe(0);
  });

  it('parses watch URL with start timestamp', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s');
    expect(res.videoId).toBe('dQw4w9WgXcQ');
    expect(res.startTime).toBe(120);
  });

  it('parses short URL (youtu.be)', () => {
    const res = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ?t=1m30s');
    expect(res.videoId).toBe('dQw4w9WgXcQ');
    expect(res.startTime).toBe(90);
  });

  it('parses shorts URL', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('parses embed URL', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('returns null on invalid URL', () => {
    const res = parseYouTubeUrl('https://example.com/video');
    expect(res.videoId).toBeNull();
  });

  it('encodes and decodes obfuscated stream tokens to hide video identity', () => {
    const token = encodeStreamToken('dQw4w9WgXcQ');
    expect(token.startsWith('b64:')).toBe(true);
    expect(token.includes('youtube.com')).toBe(false);
    expect(token.includes('dQw4w9WgXcQ')).toBe(false);

    const parsed = decodeStreamToken(token);
    expect(parsed.videoId).toBe('dQw4w9WgXcQ');
    expect(parsed.startTime).toBe(0);
  });

  it('encodes and decodes stream tokens with timestamp offset', () => {
    const token = encodeStreamToken('dQw4w9WgXcQ', 85);
    expect(token.startsWith('b64:')).toBe(true);

    const parsed = decodeStreamToken(token);
    expect(parsed.videoId).toBe('dQw4w9WgXcQ');
    expect(parsed.startTime).toBe(85);
  });

  it('attaches watchUrl to PlayerError on embedding restriction code 101/150', () => {
    const err = mapYouTubeError(150, 'baB7VymlPw0');
    expect(err.code).toBe(ErrorCode.EMBEDDING_DISABLED);
    expect(err.watchUrl).toBe('https://www.youtube.com/watch?v=baB7VymlPw0');
  });
});

