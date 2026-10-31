import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Library Build Artifacts', () => {
  const distDir = resolve(__dirname, '../../dist');

  it('generates player.es.js with non-empty content', () => {
    const esFile = resolve(distDir, 'player.es.js');
    expect(existsSync(esFile)).toBe(true);
    const content = readFileSync(esFile, 'utf-8');
    expect(content.length).toBeGreaterThan(10000);
    expect(content).toContain('CustomYouTubePlayer');
  });

  it('generates player.umd.js for CDN and script tag consumption', () => {
    const umdFile = resolve(distDir, 'player.umd.js');
    expect(existsSync(umdFile)).toBe(true);
    const content = readFileSync(umdFile, 'utf-8');
    expect(content.length).toBeGreaterThan(10000);
    expect(content).toContain('CustomYouTubePlayer');
  });

  it('generates player.css with extracted styles', () => {
    const cssFile = resolve(distDir, 'player.css');
    expect(existsSync(cssFile)).toBe(true);
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain('.cyp-player');
    expect(content).toContain('.cyp-timeline');
    expect(content).toContain('.cyp-controls-bottom');
  });

  it('provides comprehensive TypeScript declaration file index.d.ts', () => {
    const dtsFile = resolve(__dirname, '../../index.d.ts');
    expect(existsSync(dtsFile)).toBe(true);
    const content = readFileSync(dtsFile, 'utf-8');
    expect(content).toContain('export class Player');
    expect(content).toContain('export function createPlayer');
    expect(content).toContain('export const PlayerPresets');
    expect(content).toContain('export type PresetId');
    expect(content).toContain('export interface PlayerOptions');
  });
});

