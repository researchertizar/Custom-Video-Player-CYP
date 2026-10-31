import { describe, it, expect } from 'vitest';
import { detectSource } from '../../src/utils/source-detector.js';

describe('source-detector', () => {
  it('detects standard YouTube URLs as youtube', () => {
    const res1 = detectSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res1.type).toBe('youtube');
    expect(res1.target).toBe('dQw4w9WgXcQ');

    const res2 = detectSource('https://youtu.be/dQw4w9WgXcQ?t=45');
    expect(res2.type).toBe('youtube');
    expect(res2.target).toBe('dQw4w9WgXcQ');
    expect(res2.startTime).toBe(45);
  });

  it('detects 11-char YouTube ID as youtube', () => {
    const res = detectSource('dQw4w9WgXcQ');
    expect(res.type).toBe('youtube');
    expect(res.target).toBe('dQw4w9WgXcQ');
  });

  it('detects direct MP4 and WebM video files as html5', () => {
    const res1 = detectSource('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    expect(res1.type).toBe('html5');
    expect(res1.target).toContain('BigBuckBunny.mp4');

    const res2 = detectSource('./videos/demo.webm');
    expect(res2.type).toBe('html5');
    expect(res2.target).toBe('./videos/demo.webm');

    const res3 = detectSource('/media/movie.ogg');
    expect(res3.type).toBe('html5');
    expect(res3.target).toBe('/media/movie.ogg');
  });

  it('detects blob: and data: URLs as html5', () => {
    const res1 = detectSource('blob:http://localhost:5173/550e8400-e29b-41d4-a716-446655440000');
    expect(res1.type).toBe('html5');

    const res2 = detectSource('data:video/mp4;base64,AAAA');
    expect(res2.type).toBe('html5');
  });

  it('detects array of sources or source objects as html5', () => {
    const arr = [{ src: 'video.mp4', type: 'video/mp4' }];
    const res1 = detectSource(arr);
    expect(res1.type).toBe('html5');
    expect(res1.target).toBe(arr);

    const obj = { src: 'video.webm', type: 'video/webm' };
    const res2 = detectSource(obj);
    expect(res2.type).toBe('html5');
    expect(res2.target).toBe(obj);
  });

  it('honors explicit provider override', () => {
    const res = detectSource('https://example.com/stream', { provider: 'html5' });
    expect(res.type).toBe('html5');
  });
});

