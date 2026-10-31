import { describe, it, expect } from 'vitest';
import { formatTime, parseTime } from '../../src/utils/time.js';

describe('Time Utils', () => {
  it('formats zero and negative seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(-10)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(599)).toBe('9:59');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatTime(3600)).toBe('1:00:00');
    expect(formatTime(3665)).toBe('1:01:05');
    expect(formatTime(7325)).toBe('2:02:05');
  });

  it('parses time strings to seconds', () => {
    expect(parseTime('0:05')).toBe(5);
    expect(parseTime('1:05')).toBe(65);
    expect(parseTime('1:00:00')).toBe(3600);
    expect(parseTime('01:02:03')).toBe(3723);
    expect(parseTime(120)).toBe(120);
    expect(parseTime('invalid')).toBe(0);
  });
});

