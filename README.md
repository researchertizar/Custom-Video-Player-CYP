# Custom Video Player (CYP)

Universal, zero-dependency video player engine and Autonomous Web Component for modern web applications. Provides an architecturally unified control interface, event model, styling system, and plugin layer across native HTML5 video files and YouTube streams, with built-in stream link shielding, S.O.L.I.D. provider extensibility, Page Visibility API throttling, and an accessible floating mini-player.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/badge/npm-%40researcher--tizar%2Fcyp--player-red.svg)](https://www.npmjs.com/package/@researcher-tizar/cyp-player)
[![Tests: 74 Passed](https://img.shields.io/badge/Tests-74%20Passed-brightgreen.svg)]()
[![TypeScript: Included](https://img.shields.io/badge/TypeScript-Types%20Included-3178c6.svg)](index.d.ts)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-~24KB%20gzip-success.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20Runtime-blueviolet.svg)]()
[![WCAG 2.2 AAA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AAA-success.svg)]()

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
  - [Package Manager](#package-manager)
  - [CDN Script Tag](#cdn-script-tag)
  - [Autonomous Web Component](#autonomous-web-component)
- [Quick Start](#quick-start)
- [Dual-Mode Interaction Engine](#dual-mode-interaction-engine)
  - [Enhanced Mode (Default)](#enhanced-mode-default)
  - [Compliant Mode (Strict Policy)](#compliant-mode-strict-policy)
  - [Runtime Mode Switching](#runtime-mode-switching)
- [Universal Media Sources](#universal-media-sources)
  - [HTML5 Video Playback](#html5-video-playback)
  - [YouTube Stream Playback](#youtube-stream-playback)
  - [Dynamic Source Switching](#dynamic-source-switching)
- [Provider Architecture & Extensibility (S.O.L.I.D.)](#provider-architecture--extensibility-solid)
  - [The Open/Closed Provider Registry](#the-openclosed-provider-registry)
  - [Registering Custom Video Engines](#registering-custom-video-engines)
  - [Provider Capability Detection](#provider-capability-detection)
- [Performance & Resource Throttling](#performance--resource-throttling)
  - [Page Visibility API Optimization](#page-visibility-api-optimization)
  - [CSS Containment & Layout Isolation](#css-containment--layout-isolation)
- [Stream Shielding & Content Security](#stream-shielding--content-security)
  - [Honest Security Model: Obfuscation vs. DRM](#honest-security-model-obfuscation-vs-drm)
  - [Click Interception & Context Menu Suppression](#click-interception--context-menu-suppression)
  - [Stream Tokens](#stream-tokens)
  - [Recommended Production Architecture for Gated Media](#recommended-production-architecture-for-gated-media)
- [Embedding Restrictions & Actionable Fallbacks](#embedding-restrictions--actionable-fallbacks)
  - [Handling YouTube Error 150 / 101](#handling-youtube-error-150--101)
  - [Raw IP Normalization (127.0.0.1 vs localhost)](#raw-ip-normalization-127001-vs-localhost)
- [Picture-in-Picture & Mini-Player](#picture-in-picture--mini-player)
- [UI Presets & Theming System](#ui-presets--theming-system)
  - [Available Presets](#available-presets)
  - [CSS Custom Properties](#css-custom-properties)
- [Accessibility & WCAG 2.2 Compliance](#accessibility--wcag-22-compliance)
- [Framework Integration](#framework-integration)
  - [React / Next.js](#react--nextjs)
  - [Vue 3 / Nuxt](#vue-3--nuxt)
  - [Svelte / SvelteKit](#svelte--sveltekit)
- [API Reference](#api-reference)
  - [Constructor Options](#constructor-options)
  - [Instance Methods](#instance-methods)
  - [Static Methods](#static-methods)
  - [Events](#events)
  - [Error Codes](#error-codes)
  - [Utility Functions](#utility-functions)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Testing & Quality Verification](#testing--quality-verification)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Embedding video in web applications typically presents two contrasting problems:
1. Native HTML5 `<video>` elements suffer from inconsistent styling across operating systems and browsers, requiring bespoke controls, fullscreen management, and custom responsive layouts.
2. Embedded YouTube iframes display external watch links, recommended distraction videos, and third-party UI overlays that do not respect your application's design system.

**Custom Video Player (CYP)** resolves this by providing an abstracted, high-performance media controller built upon S.O.L.I.D. architectural principles. Whether streaming an MP4 from cloud storage, loading an encrypted token, or playing a YouTube video, your application consumes an identical, predictable API: unified playback controls, timeline scrubbing, closed captions, speed selection, keyboard navigation, and event subscriptions.

---

## Key Features

- **Unified API**: A single interface across native HTML5 video and YouTube streams.
- **Zero Runtime Dependencies**: 100% vanilla JavaScript and modern CSS; minified library bundle is ~24 KB gzipped.
- **S.O.L.I.D. Provider Architecture**: Extensible `ProviderRegistry` allows developers to plug in custom streaming engines (e.g., HLS.js, Dash.js, Vimeo) without modifying core library code.
- **Dual-Mode Interaction**: Switch seamlessly between `enhanced` (distraction-free studio UI) and `compliant` (direct platform iframe interaction) modes.
- **Page Visibility API Throttling**: Automatically suspends 200ms timeline polling when the browser tab is hidden or minimized, conserving CPU and battery life.
- **CSS Layout Containment**: Uses `contain: layout style;` and `contain: strict;` to isolate video decoding repaints from causing parent document reflows.
- **Graceful Error Recovery**: Automatically detects YouTube embedding restrictions (Error 150/101) and presents an accessible, 1-click **"Watch on YouTube ↗"** external fallback button.
- **Accessibility & WCAG 2.2 AAA Contrast**: High-contrast text badges (4.5:1 to 7:1 ratio), visible focus rings (`:focus-visible`), and touch targets enlarged to 44×44px for mobile devices (Fitts's Law).
- **Stream Link Shielding**: Reduces casual visual exposure of stream URLs in DOM markup using Base64 tokens and interaction interceptors.
- **Dual-Mode Picture-in-Picture**: Native browser Picture-in-Picture for HTML5 media, with automatic fallback to a draggable, viewport-docked mini-player.
- **6 Designer UI Presets**: Production-ready themes for Glassmorphism, Minimal, Studio Console, Cinema OLED, Cyber HUD, and Classic Dark.
- **Autonomous Web Components**: Declarative `<custom-video-player>` and `<custom-youtube-player>` custom elements.
- **Strict TypeScript Declarations**: Comprehensive type definitions included in `index.d.ts`.

---

## Installation

### Package Manager

Install using npm, yarn, or pnpm:

```bash
npm install @researcher-tizar/cyp-player
```

```bash
yarn add @researcher-tizar/cyp-player
```

```bash
pnpm add @researcher-tizar/cyp-player
```

### CDN Script Tag

For static HTML pages or quick prototyping without a build system:

```html
<link rel="stylesheet" href="https://unpkg.com/@researcher-tizar/cyp-player/dist/player.css">
<script src="https://unpkg.com/@researcher-tizar/cyp-player/dist/player.umd.js"></script>

<div id="player-container"></div>

<script>
  const player = CustomVideoPlayer.create({
    element: '#player-container',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    preset: 'glass'
  });
</script>
```

### Autonomous Web Component

Register the web component by importing the ES module:

```html
<script type="module" src="https://unpkg.com/@researcher-tizar/cyp-player/dist/player.es.js"></script>

<!-- Native HTML5 Video -->
<custom-video-player
  src="https://vjs.zencdn.net/v/oceans.mp4"
  preset="glass"
  radius="16">
</custom-video-player>

<!-- YouTube Stream -->
<custom-video-player
  video-id="dQw4w9WgXcQ"
  preset="minimal"
  accent-color="#38bdf8"
  mode="enhanced">
</custom-video-player>
```

`<custom-youtube-player>` is available as an interchangeable alias.

---

## Quick Start

```javascript
import { createPlayer } from '@researcher-tizar/cyp-player';
import '@researcher-tizar/cyp-player/dist/player.css';

const player = createPlayer({
  element: '#player-container',
  url: 'https://vjs.zencdn.net/v/oceans.mp4',
  preset: 'dark',
  accentColor: '#e50914',
  autoplay: false
});

player.on('playing', () => {
  console.log('Playback is active');
});

player.on('error', (err) => {
  console.error('Player error occurred:', err);
});
```

---

## Dual-Mode Interaction Engine

CYP features an architectural dual-mode engine allowing developers to configure the exact interaction model required by their product:

```javascript
// Mode 1: Enhanced (Default) - Seamless distraction-free studio experience
const player = createPlayer({
  element: '#player',
  videoId: 'dQw4w9WgXcQ',
  mode: 'enhanced' // or strictCompliance: false
});

// Mode 2: Compliant - Strict YouTube Developer Policy compliance
const compliantPlayer = createPlayer({
  element: '#player-compliant',
  videoId: 'dQw4w9WgXcQ',
  mode: 'compliant' // or strictCompliance: true
});
```

### Mode Comparison

| Feature | `enhanced` (Default) | `compliant` (Strict Policy) |
|---|---|---|
| **Screen Tap to Play/Pause** | Active across player container | Direct iframe pass-through |
| **Double-Click Fullscreen** | Active on player canvas | Native YouTube fullscreen |
| **Distraction-Free Surface** | Blocks external click leaks & title redirects | Native YouTube title link interaction |
| **Ad Interaction** | Automatically unlocked when ads stream | Direct native YouTube ad skip buttons |
| **Declarative HTML Attribute** | `<custom-video-player mode="enhanced">` | `<custom-video-player mode="compliant">` |
| **Runtime Mode Switch** | `player.setMode('compliant')` | `player.setMode('enhanced')` |

---

## Universal Media Sources

### HTML5 Video Playback

Direct video files (`.mp4`, `.webm`, `.ogg`) and media streams are handled by `HTML5Provider`:

```javascript
import { Player } from '@researcher-tizar/cyp-player';

const player = new Player({
  element: '#player',
  src: 'https://example.com/media/video.mp4',
  poster: 'https://example.com/media/poster.jpg'
});
```

### YouTube Stream Playback

Provide standard watch URLs, short links, embed URLs, or 11-character video IDs:

```javascript
player.load('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
player.load('https://youtu.be/dQw4w9WgXcQ?t=30');
player.load('dQw4w9WgXcQ');
```

### Dynamic Source Switching

Switch between different media types and formats on a live instance without re-creating DOM structures or leaking event listeners:

```javascript
// 1. Load a YouTube video
await player.load('dQw4w9WgXcQ');

// 2. Switch cleanly to a native MP4 video file
await player.load('https://example.com/lecture.mp4');

// 3. Switch to an obfuscated stream token starting at 1m20s
await player.load('b64:ZFF3NHc5V2dYY1E/dD04MA==');
```

---

## Provider Architecture & Extensibility (S.O.L.I.D.)

CYP is built upon the **Open/Closed Principle** and **Dependency Inversion Principle**. The core player does not hardcode provider implementations; instead, it delegates to an extensible `ProviderRegistry`.

```
┌────────────────────────────────────────────────────────┐
│                      Player Core                       │
└───────────────────────────┬────────────────────────────┘
                            │ resolves via
                            ▼
┌────────────────────────────────────────────────────────┐
│                    ProviderRegistry                    │
├───────────────────────────┬────────────────────────────┤
│ 'html5'   -> HTML5Provider│ 'youtube' -> YouTubeProvider│
│ 'hls'     -> (Custom)     │ 'dash'    -> (Custom)       │
└───────────────────────────┴────────────────────────────┘
```

### The Open/Closed Provider Registry

Developers can register custom streaming engines statically or per instance:

```javascript
import { Player, Provider, ProviderRegistry } from '@researcher-tizar/cyp-player';

// 1. Create a custom provider conforming to the Provider interface
class CustomHLSProvider extends Provider {
  constructor(emitter) {
    super(emitter);
    this._hls = null;
    this._video = null;
  }

  async init(container, source, options = {}) {
    this._video = document.createElement('video');
    container.appendChild(this._video);
    // Initialize HLS.js or custom engine...
    this._emitter.emit('provider:ready');
  }

  play() { return this._video.play(); }
  pause() { this._video.pause(); }
  getCurrentTime() { return this._video.currentTime; }
  getDuration() { return this._video.duration || 0; }
  supportsPictureInPicture() { return true; }
  supportsCaptions() { return true; }
  supportsQualityLevels() { return true; }
  destroy() {
    this._video?.remove();
  }
}

// 2. Register the provider statically
Player.registerProvider('hls', CustomHLSProvider);

// 3. Instantiate player with custom provider
const player = new Player({
  element: '#player',
  url: 'https://example.com/stream.m3u8',
  provider: 'hls'
});
```

### Provider Capability Detection

Each provider implements standardized capability detection methods:
- `provider.supportsPictureInPicture()`: Returns `true` if native PiP is supported.
- `provider.supportsCaptions()`: Returns `true` if closed caption track switching is supported.
- `provider.supportsQualityLevels()`: Returns `true` if manual quality selection is supported.

The UI automatically queries these capabilities to show or hide controls via progressive disclosure.

---

## Performance & Resource Throttling

### Page Visibility API Optimization

To prevent unnecessary CPU and battery drain on mobile and laptop devices, CYP integrates with the browser **Page Visibility API** (`document.visibilitychange`):

- **Background Throttling**: When the user switches tabs or minimizes the window (`document.hidden === true`), CYP automatically suspends the 200ms timeline and state polling loop.
- **Immediate State Resumption**: When the tab becomes visible again (`document.hidden === false`), polling resumes instantly if playback is active, and emits an immediate state synchronization update.
- **Memory Safety**: The visibility handler is bound with a named listener and cleanly unregistered upon `player.destroy()`.

### CSS Containment & Layout Isolation

Video frame decoding can trigger parent document layout thrashing if container boundaries are unconstrained. CYP applies strict modern CSS containment:

```css
.cyp-player {
  contain: layout style;
}

.cyp-video-box {
  contain: strict;
}
```

This isolates the video rendering box from the rest of the web page, preventing frame updates from causing full-page reflows.

---

## Stream Shielding & Content Security

### Honest Security Model: Obfuscation vs. DRM

A foundational principle of CYP is technical honesty regarding content protection:

> [!IMPORTANT]
> **Client-Side Obfuscation vs. Real Content Security**
>
> Client-side mechanisms such as Base64 encoding (`b64:...`), DOM element hiding, and disabling context menus represent **casual exposure reduction** only. They prevent raw stream URLs from appearing directly in client HTML source code to casual visitors.
>
> They do **not** constitute encryption, access authorization, or DRM. Any media file or stream loaded by the browser can be observed in browser developer tools (Network tab) and media pipeline decoders. Real media security requires backend authentication and signed URLs.

### Click Interception & Context Menu Suppression

Standard embedded players allow users to click titles or right-click to copy watch URLs. CYP provides an interaction shield:
1. **Click Interceptor**: A transparent interaction layer captures pointer events to handle playback toggles, preventing casual clicks from navigating away to third-party platforms.
2. **Context Menu Suppression**: Right-click events on the player container can be intercepted (`preventContextMenu: true`) to prevent default third-party context menus.

### Stream Tokens

To avoid embedding raw video identifiers in client-side HTML source:

#### Server-side generation:
```javascript
import { encodeStreamToken } from '@researcher-tizar/cyp-player';

export function getVideoHandler(req, res) {
  const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=45s';
  const token = encodeStreamToken(videoUrl); // "b64:ZFF3NHc5V2dYY1E/dD00NQ=="

  res.json({ token });
}
```

#### Client-side consumption:
```javascript
player.load('b64:ZFF3NHc5V2dYY1E/dD00NQ==');
```

CYP decodes the token in memory at runtime without writing the target URL to the DOM.

### Recommended Production Architecture for Gated Media

For commercial platforms (LMS courses, subscription streaming, membership portals):

```
┌─────────────────┐       1. Authenticate        ┌─────────────────┐
│  Client Browser ├─────────────────────────────►│ Backend Server  │
│      (CYP)      │◄─────────────────────────────┤ (Auth / Billing)│
└────────┬────────┘    2. Short-Lived Signed URL └────────┬────────┘
         │                                                │
         │ 3. Request Media (Token validated)             │ 2b. Sign URL (HMAC)
         ▼                                                ▼
┌─────────────────┐                              ┌─────────────────┐
│ CDN Edge Server ├──────────────────────────────┤  Cloud Storage  │
│ (CloudFront/GCP)│                              │ (S3 / GCS / R2) │
└─────────────────┘                              └─────────────────┘
```

1. **Authentication**: The user logs in to your web application via your standard auth system (OAuth, JWT, session cookie).
2. **Backend Authorization Gate**: Your backend checks whether the user has active subscription or access rights.
3. **Signed Token / Expiring URL**: Your backend generates a short-lived signed media URL (e.g., CloudFront Signed URL, Google Cloud CDN Signed Cookie, Cloudflare Stream token, or AWS S3 presigned URL with a 15–60 minute TTL).
4. **Playback Session**: CYP loads the temporary signed URL via `player.load(signedUrl)`.
5. **Session Expiry**: When the token expires, subsequent segment or manifest requests from unauthorized parties fail.
6. **Commercial DRM**: For studio content or anti-rip compliance, use native DRM packaging (CENC / Widevine / FairPlay / PlayReady) with standard license server endpoints.

---

## Embedding Restrictions & Actionable Fallbacks

### Handling YouTube Error 150 / 101

Some YouTube videos (music videos, content partner channels, or videos with embedding disabled in YouTube Studio) **cannot** be embedded in third-party websites or local environments. When this happens, YouTube's API fires error code `150` or `101`.

CYP handles this gracefully:
- Automatically maps error code `150` to `ErrorCode.EMBEDDING_DISABLED`.
- Displays a clean, polite explanation: *"The video owner does not allow embedding this video outside of YouTube."*
- Dynamically renders an accessible, prominent **"Watch on YouTube ↗"** button (`.cyp-error-action-btn`) that opens `https://www.youtube.com/watch?v={videoId}` in a new tab with `target="_blank" rel="noopener noreferrer"`.
- When another video is loaded, `player.hideError()` automatically dismisses the error overlay.

### Raw IP Normalization (127.0.0.1 vs localhost)

YouTube embeds reject raw IP addresses (`http://127.0.0.1:5500`) with Error 150 for many videos. When developing locally:
- CYP includes an automatic host normalizer in demo pages redirecting `127.0.0.1` to `localhost`.
- If an Error 150 occurs while accessing via a raw IP address, the error overlay displays a 1-click **"Switch to localhost"** action button.

---

## Picture-in-Picture & Mini-Player

CYP supports two Picture-in-Picture mechanisms:

1. **Native Picture-in-Picture**: Available for HTML5 media via the browser Picture-in-Picture API (`HTMLVideoElement.requestPictureInPicture()`).
2. **Floating Mini-Player**: A custom floating overlay that docks to the bottom corner of the viewport, maintaining playback, volume, and timeline controls.

```javascript
// Toggle custom mini-player
player.toggleMini();

// Request native PiP with automatic fallback to mini-player
await player.requestPictureInPicture();
```

Keyboard shortcut: <kbd>I</kbd> toggles the mini-player; <kbd>Esc</kbd> closes it.

---

## UI Presets & Theming System

### Available Presets

Apply a preset during initialization or dynamically at runtime:

```javascript
player.applyPreset('glass');
```

| Preset ID | Name | Default Accent | Border Radius | Description |
| :--- | :--- | :---: | :---: | :--- |
| `glass` | Glassmorphism | `#00f5d4` | `16px` | Frosted backdrop blur with semi-transparent panel surfaces. |
| `minimal` | Modern Minimal | `#ffffff` | `24px` | Floating pill control dock with monochrome elements. |
| `professional` | Studio Console | `#f59e0b` | `6px` | Charcoal dark layout with amber indicators and monospace metrics. |
| `cyber` | Cyber HUD | `#00ff88` | `2px` | High-contrast angular interface with green telemetry accents. |
| `cinema` | Cinema OLED | `#d4af37` | `8px` | Deep black background with gold timeline markers. |
| `dark` | Classic Dark | `#e50914` | `12px` | Standard dark theme with red accent highlights. |

### CSS Custom Properties

Override theme tokens directly in your stylesheet:

```css
.cyp-player {
  --cyp-accent: #0284c7;
  --cyp-bg-surface: rgba(18, 18, 21, 0.9);
  --cyp-border-radius: 8px;
  --cyp-timeline-height: 4px;
  --cyp-timeline-buffered: rgba(255, 255, 255, 0.25);
  --cyp-text-secondary: rgba(255, 255, 255, 0.9);
  --cyp-font-family: system-ui, -apple-system, sans-serif;
}
```

---

## Accessibility & WCAG 2.2 Compliance

CYP is hardened to satisfy **WCAG 2.2 AA and AAA** guidelines:

1. **High Contrast Ratios**: Secondary text (`--cyp-text-secondary`) is tuned to `rgba(255, 255, 255, 0.9)`, exceeding the 7:1 contrast ratio against dark video backgrounds.
2. **Readable Time Display**: The current time and duration display features a semi-transparent dark backdrop box (`background: rgba(0, 0, 0, 0.65)`), guaranteeing readability regardless of video brightness.
3. **Focus Visibility**: All interactive buttons, sliders, and menu items feature high-visibility `:focus-visible` outline rings (`2px solid var(--cyp-accent); outline-offset: 2px`).
4. **Touch Target Size (Fitts's Law)**: For mobile and touchscreen devices (`@media (pointer: coarse)`), all control buttons enforce a minimum hit target of **44×44px** to eliminate mis-taps.
5. **WAI-ARIA Sliders**: The timeline and volume sliders feature full keyboard navigation with dynamic `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` updates.

---

## Framework Integration

### React / Next.js

```tsx
import React, { useEffect, useRef } from 'react';
import { Player, PresetId } from '@researcher-tizar/cyp-player';
import '@researcher-tizar/cyp-player/dist/player.css';

interface VideoPlayerProps {
  url: string;
  preset?: PresetId;
  mode?: 'enhanced' | 'compliant';
}

export function VideoPlayer({ url, preset = 'dark', mode = 'enhanced' }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    playerRef.current = new Player({
      element: containerRef.current,
      url,
      preset,
      mode,
      lazy: true
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [url, preset, mode]);

  return <div ref={containerRef} style={{ width: '100%', aspectRatio: '16/9' }} />;
}
```

### Vue 3 / Nuxt

```vue
<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Player } from '@researcher-tizar/cyp-player';
import '@researcher-tizar/cyp-player/dist/player.css';

const props = defineProps({
  src: { type: String, required: true },
  preset: { type: String, default: 'dark' },
  mode: { type: String, default: 'enhanced' }
});

const container = ref(null);
let player = null;

onMounted(() => {
  player = new Player({
    element: container.value,
    url: props.src,
    preset: props.preset,
    mode: props.mode
  });
});

watch(() => props.src, (newSrc) => {
  player?.load(newSrc);
});

onUnmounted(() => {
  player?.destroy();
});
</script>

<template>
  <div ref="container" class="player-wrapper"></div>
</template>
```

### Svelte / SvelteKit

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { Player } from '@researcher-tizar/cyp-player';
  import '@researcher-tizar/cyp-player/dist/player.css';

  export let url;
  export let preset = 'dark';
  export let mode = 'enhanced';

  let container;
  let player;

  onMount(() => {
    player = new Player({
      element: container,
      url,
      preset,
      mode
    });
  });

  onDestroy(() => {
    player?.destroy();
  });
</script>

<div bind:this={container} class="player-container"></div>
```

---

## API Reference

### Constructor Options

```typescript
interface PlayerOptions {
  element: string | HTMLElement;       // Target container element or CSS selector
  url?: string;                        // Media source URL (HTML5 file or YouTube link)
  videoId?: string;                    // YouTube 11-character video ID
  src?: string | object | Array<any>;  // HTML5 media source
  streamToken?: string;                // Obfuscated b64:... stream token
  provider?: 'youtube' | 'html5' | 'auto' | string; // Provider type override
  mode?: 'enhanced' | 'compliant';     // Interaction mode (default: 'enhanced')
  strictCompliance?: boolean;          // Shorthand for mode: 'compliant'
  preset?: PresetId;                   // UI preset name ('glass', 'minimal', etc.)
  theme?: ThemeId;                     // Visual theme name
  accentColor?: string;                // Primary accent color (hex or CSS color)
  radius?: number | string;            // Border radius in pixels
  trackHeight?: number | string;       // Progress bar track height in pixels
  poster?: string;                     // Poster image URL
  logo?: {                             // Custom branding watermark overlay
    src?: string;
    innerHTML?: string;
    url?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    opacity?: number;
    width?: string;
  };
  autoplay?: boolean;                  // Autoplay media on load (default: false)
  lazy?: boolean;                      // Show poster facade before initializing engine (default: true)
  controls?: boolean | string[];       // Boolean or array of enabled control button keys
  plugins?: Array<any>;                // Plugin instances (resumePlugin, chaptersPlugin, etc.)
  debug?: boolean;                     // Output internal diagnostic logs (default: false)
}
```

### Instance Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `play()` | None | Resumes or starts playback. Returns Promise. |
| `pause()` | None | Pauses playback. |
| `togglePlay()` | None | Toggles between play and pause states. |
| `stop()` | None | Stops playback and resets timeline to 0. |
| `seekTo(seconds)` | `seconds: number` | Seeks to a specific timestamp in seconds. |
| `seekBy(offset)` | `offset: number` | Seeks relative to the current timestamp. |
| `setVolume(value)` | `value: 0..100` | Sets audio volume percentage. |
| `mute()` | None | Mutes audio. |
| `unmute()` | None | Unmutes audio. |
| `toggleMute()` | None | Toggles audio mute state. |
| `setPlaybackRate(rate)` | `rate: 0.25..2.0` | Sets playback speed rate. |
| `setPlaybackQuality(quality)`| `quality: string` | Sets stream quality level. |
| `setMode(mode)` | `'enhanced' \| 'compliant'` | Changes interaction mode dynamically. |
| `isEnhanced()` | None | Returns `true` if enhanced studio mode is active. |
| `isCompliant()` | None | Returns `true` if strict compliance mode is active. |
| `toggleMini()` | None | Toggles floating mini-player mode. |
| `requestPictureInPicture()` | None | Requests native PiP or falls back to mini-player. |
| `load(target, startSeconds?)` | `target: string, start?: number` | Loads a new media source dynamically. |
| `applyPreset(presetId)` | `presetId: string` | Switches the active UI preset. |
| `setAccentColor(color)` | `color: string` | Updates accent color variable at runtime. |
| `setRadius(radius)` | `radius: number` | Updates border radius at runtime. |
| `toggleCaptions(lang?)` | `languageCode?: string` | Toggles closed captions on or off. |
| `setCaptionTrack(lang)` | `languageCode: string \| null` | Sets active subtitle language track. |
| `getState()` | None | Returns complete state snapshot object. |
| `destroy()` | None | Cleanly removes DOM nodes, listeners, timers, and plugins without memory leaks. |

### Static Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `Player.registerProvider(type, ProviderClass)` | `type: string, ProviderClass: typeof Provider` | Registers a custom media provider engine statically. |
| `ProviderRegistry.register(type, ProviderClass)`| `type: string, ProviderClass: typeof Provider` | Low-level registry method to add custom provider engines. |
| `ProviderRegistry.get(type)` | `type: string` | Retrieves registered provider class. |
| `ProviderRegistry.getSupportedTypes()` | None | Returns array of all registered provider type keys. |

### Events

Subscribe to events using `player.on(eventName, handler)`:

```javascript
player.on('ready', () => { /* Player engine is initialized */ });
player.on('playing', () => { /* Playback is active */ });
player.on('pause', () => { /* Playback is paused */ });
player.on('ended', () => { /* Playback has finished */ });
player.on('timeupdate', (seconds) => { /* Current playback position */ });
player.on('volumechange', ({ volume, muted }) => { /* Volume or mute update */ });
player.on('change:playbackRate', (rate) => { /* Speed changed */ });
player.on('error', (error) => { /* Playback or provider error */ });
player.on('captions:update', ({ tracks, activeTrack, enabled }) => { /* Caption tracks update */ });
```

### Error Codes

Exported via `ErrorCode`:

| Code | Meaning |
| :--- | :--- |
| `ErrorCode.API_LOAD_FAILED` | Underlying media API or script failed to load. |
| `ErrorCode.API_TIMEOUT` | Provider initialization timed out. |
| `ErrorCode.INVALID_VIDEO_ID` | Malformed or unrecognized video identifier. |
| `ErrorCode.VIDEO_UNAVAILABLE` | Media file or YouTube video is private or removed. |
| `ErrorCode.EMBEDDING_DISABLED` | Creator has restricted external embedding (Error 150/101). |
| `ErrorCode.HTML5_ERROR` | Native HTML5 media element error (format, network, or decode failure). |

### Utility Functions

```javascript
import {
  sanitizeUrl,
  escapeHtml,
  encodeStreamToken,
  decodeStreamToken,
  parseYouTubeUrl,
  formatTime,
  mapYouTubeError
} from '@researcher-tizar/cyp-player';

// Neutralize dangerous protocols (javascript:, vbscript:, data:text/html)
const safeUrl = sanitizeUrl(untrustedUrl);

// Escape HTML entities (&, <, >, ", ')
const safeHtml = escapeHtml(untrustedText);

// Encode a stream token to reduce direct URL exposure in client DOM
const token = encodeStreamToken('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

// Format seconds into MM:SS or HH:MM:SS
const timeString = formatTime(125); // "02:05"

// Map numeric YouTube error codes to PlayerError with fallback watch URL
const playerError = mapYouTubeError(150, 'baB7VymlPw0');
console.log(playerError.watchUrl); // "https://www.youtube.com/watch?v=baB7VymlPw0"
```

---

## Keyboard Shortcuts

Shortcuts are scoped to player focus or container hover by default:

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> or <kbd>K</kbd> | Toggle play / pause |
| <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> | Seek backward / forward 5 seconds |
| <kbd>J</kbd> / <kbd>L</kbd> | Seek backward / forward 10 seconds |
| <kbd>&uarr;</kbd> / <kbd>&darr;</kbd> | Volume up / down 5% |
| <kbd>M</kbd> | Toggle mute |
| <kbd>F</kbd> | Toggle fullscreen |
| <kbd>T</kbd> | Toggle theater mode |
| <kbd>I</kbd> | Toggle floating mini-player |
| <kbd>Esc</kbd> | Exit mini-player or close open submenus |
| <kbd>C</kbd> | Toggle captions / subtitles |
| <kbd>0</kbd> &ndash; <kbd>9</kbd> | Jump to 0% &ndash; 90% of duration |

---

## Testing & Quality Verification

The project enforces automated test coverage using [Vitest](https://vitest.dev/):

```bash
# Execute unit and integration test suite (74 tests across 14 suites)
npm test

# Build production library distribution (ESM + UMD + CSS)
npm run build

# Build interactive developer showcase site
npm run build:demo
```

---

## Contributing

We welcome community contributions, bug reports, and provider plugins! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md) before submitting pull requests.

---

## License

MIT License &copy; 2026 [researchertizar](https://github.com/researchertizar). Free for personal and commercial use.
