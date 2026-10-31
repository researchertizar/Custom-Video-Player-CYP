// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sanitizeUrl, escapeHtml } from '../../src/utils/dom.js';
import { parseYouTubeUrl } from '../../src/utils/youtube-url.js';
import { PlayerUI } from '../../src/ui/player-ui.js';
import { EventEmitter } from '../../src/core/events.js';

describe('Security Hardening & Input Sanitization', () => {
  describe('sanitizeUrl', () => {
    it('allows safe http and https protocols', () => {
      expect(sanitizeUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
      expect(sanitizeUrl('http://example.com/video.mp4')).toBe('http://example.com/video.mp4');
    });

    it('allows blob and safe data:image URIs', () => {
      expect(sanitizeUrl('blob:http://localhost:3000/12345')).toBe('blob:http://localhost:3000/12345');
      expect(sanitizeUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe('data:image/svg+xml;base64,PHN2Zz4=');
    });

    it('allows safe relative paths', () => {
      expect(sanitizeUrl('/assets/logo.png')).toBe('/assets/logo.png');
      expect(sanitizeUrl('./logo.svg')).toBe('./logo.svg');
      expect(sanitizeUrl('../media/poster.jpg')).toBe('../media/poster.jpg');
    });

    it('blocks javascript: URLs and strips dangerous schemes', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('JAVASCRIPT:alert(document.cookie)')).toBe('');
      expect(sanitizeUrl('  javascript:void(0)  ')).toBe('');
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('handles non-string and falsy inputs cleanly', () => {
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
      expect(sanitizeUrl(12345)).toBe('');
    });
  });

  describe('parseYouTubeUrl recursion guard', () => {
    it('stops execution when token recursion exceeds max depth', () => {
      // Create nested token
      let nested = 'dQw4w9WgXcQ';
      for (let i = 0; i < 10; i++) {
        nested = 'b64:' + Buffer.from(nested).toString('base64');
      }

      const res = parseYouTubeUrl(nested);
      expect(res.videoId).toBeNull();
    });
  });

  describe('UI XSS Defense', () => {
    let container;
    let mockPlayer;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);

      mockPlayer = {
        element: container,
        events: new EventEmitter(),
        state: { getField: vi.fn(), on: vi.fn() },
        _options: { controls: true },
        getVolume: () => 100,
        isMuted: () => false,
        on: vi.fn(),
        destroy: vi.fn()
      };
    });

    afterEach(() => {
      container.remove();
    });

    it('prevents javascript: injection in setLogo url', () => {
      const ui = new PlayerUI(mockPlayer, container, { lazy: false });
      ui.setLogo({
        src: 'https://example.com/logo.png',
        url: 'javascript:alert(document.domain)'
      });

      const anchor = ui.logoOverlay.querySelector('a');
      expect(anchor).toBeNull();
      const img = ui.logoOverlay.querySelector('img');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe('https://example.com/logo.png');
    });

    it('prevents inline script execution in setLogo innerHTML', () => {
      const ui = new PlayerUI(mockPlayer, container, { lazy: false });
      ui.setLogo({
        innerHTML: '<script>window.__pwned = true;</script><svg></svg>'
      });

      expect(ui.logoOverlay.innerHTML).toBe('');
      expect(window.__pwned).toBeUndefined();
    });

    it('prevents javascript: URLs in setPoster', () => {
      const ui = new PlayerUI(mockPlayer, container, { lazy: false, poster: 'https://example.com/initial.jpg' });
      ui.setPoster('javascript:alert(1)');
      expect(ui.posterImg.src).not.toContain('javascript:');
    });
  });
});
