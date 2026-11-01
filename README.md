# Custom Video Player (CYP)

Universal, zero-dependency video player engine and Autonomous Web Component for web applications. Provides a unified control interface, event model, and styling layer across native HTML5 video files and YouTube streams, with built-in stream link shielding, progressive control disclosure, and a floating mini-player.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/badge/npm-%40researcher--tizar%2Fcyp--player-red.svg)](https://www.npmjs.com/package/@researcher-tizar/cyp-player)
[![Tests: 60 Passed](https://img.shields.io/badge/Tests-60%20Passed-brightgreen.svg)]()
[![TypeScript: Included](https://img.shields.io/badge/TypeScript-Types%20Included-3178c6.svg)](index.d.ts)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-~24KB%20gzip-success.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20Runtime-blueviolet.svg)]()

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
  - [Package Manager](#package-manager)
  - [CDN Script Tag](#cdn-script-tag)
  - [Autonomous Web Component](#autonomous-web-component)
- [Quick Start](#quick-start)
- [Universal Media Sources](#universal-media-sources)
  - [HTML5 Video Playback](#html5-video-playback)
  - [YouTube Stream Playback](#youtube-stream-playback)
  - [Dynamic Source Switching](#dynamic-source-switching)
- [Stream Link Shielding](#stream-link-shielding)
  - [Click Interception](#click-interception)
  - [Stream Tokens](#stream-tokens)
- [Security Model](#security-model)
- [Picture-in-Picture and Mini-Player](#picture-in-picture-and-mini-player)
- [UI Presets and Customization](#ui-presets-and-customization)
  - [Available Presets](#available-presets)
  - [CSS Custom Properties](#css-custom-properties)
- [Framework Integration](#framework-integration)
  - [React / Next.js](#react--nextjs)
  - [Vue 3 / Nuxt](#vue-3--nuxt)
  - [Svelte / SvelteKit](#svelte--sveltekit)
- [API Reference](#api-reference)
  - [Constructor Options](#constructor-options)
  - [Instance Methods](#instance-methods)
  - [Events](#events)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Testing](#testing)
- [License](#license)

---

## Overview

Embedding video in web applications typically presents two contrasting problems: native HTML5 `<video>` elements have inconsistent UI across operating systems and browsers, while embedded YouTube iframes expose watch links, show related external content, and do not conform to custom application styling.

Custom Video Player (CYP) provides a unified media controller that abstracts the underlying playback provider behind a standard interface. Whether playing an MP4 file or a YouTube stream, the player exposes identical playback controls, keyboard navigation, timeline scrubbing, and event subscriptions.

---

## Features

- Unified API: Single set of methods, events, and configuration options across HTML5 video and YouTube streams.
- Zero Runtime Dependencies: Built entirely with vanilla JavaScript and CSS custom properties; production bundle is ~24 KB minified and gzipped.
- Input & Protocol Sanitization: Strict scheme validation neutralizes `javascript:` and dangerous data URI injection in media URLs, poster frames, and watermark badges.
- Token Recursion Guard: Call stack depth bounds prevent recursion-based Denial of Service (DoS) attacks on obfuscated stream tokens.
- Stream Link Shielding: Transparent interaction layer prevents context menus and direct clicks from navigating away to third-party platforms.
- Stream Tokens: Base64 token generation utility allows passing obfuscated media identifiers instead of exposing raw URLs in the client DOM.
- Progressive Disclosure: Controls for quality, closed captions, and chapters automatically hide when unsupported by the current source.
- Dual-Mode Picture-in-Picture: Native browser Picture-in-Picture for supported HTML5 media, with automatic fallback to a draggable, corner-docked mini-player.
- 6 Built-in Presets: Pre-configured themes for glassmorphism, minimal, studio console, cinema OLED, cyber HUD, and classic dark interfaces.
- Autonomous Web Components: Custom elements (`<custom-video-player>` and `<custom-youtube-player>`) for declarative HTML integration without initialization scripts.
- TypeScript Support: Full type declarations included in `index.d.ts`.

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

For static HTML pages without a build system:

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

<!-- HTML5 Video -->
<custom-video-player
  src="https://vjs.zencdn.net/v/oceans.mp4"
  preset="glass"
  radius="16">
</custom-video-player>

<!-- YouTube Stream -->
<custom-video-player
  video-id="dQw4w9WgXcQ"
  preset="minimal"
  accent-color="#38bdf8">
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
  console.log('Playback started');
});
```

---

---

## Dual-Mode Architecture: Enhanced vs. Compliant

CYP offers an architectural dual-mode engine allowing developers to toggle between an uninterrupted, distraction-free custom UI model and strict platform policy alignment:

```javascript
// Mode 1: Enhanced (Default) - Seamless distraction-free studio experience
const player = createPlayer({
  element: '#player',
  videoId: 'dQw4w9WgXcQ',
  mode: 'enhanced' // or strictCompliance: false
});

// Mode 2: Compliant - Direct YouTube iframe pointer pass-through
const compliantPlayer = createPlayer({
  element: '#player-compliant',
  videoId: 'dQw4w9WgXcQ',
  mode: 'compliant' // or strictCompliance: true
});
```

### Mode Comparison

| Feature | `enhanced` (Default) | `compliant` (Strict Policy) |
|---|---|---|
| **Screen Tap to Play/Pause** | Active anywhere on video container | Direct iframe pass-through |
| **Double-Click Fullscreen** | Active on player canvas | Native YouTube fullscreen |
| **Smart Ad Passthrough** | Automatic unlock when ads stream (`is-ad-active`) | Native YouTube ad interaction |
| **Distraction-Free Surface** | Blocks external click leaks & unwanted menus | Direct access to native annotations/cards |
| **Web Component Syntax** | `<custom-video-player mode="enhanced">` | `<custom-video-player mode="compliant">` |
| **Runtime Mode Switch** | `player.setMode('compliant')` | `player.setMode('enhanced')` |

---

## Universal Media Sources

### HTML5 Video Playback

Direct video files (`.mp4`, `.webm`, `.ogg`) and streaming URLs are loaded via the native HTML5 provider:

```javascript
import { Player } from '@researcher-tizar/cyp-player';

const player = new Player({
  element: '#player',
  src: 'https://example.com/media/video.mp4',
  poster: 'https://example.com/media/poster.jpg',
  tracks: [
    { src: '/subtitles/en.vtt', srclang: 'en', label: 'English', default: true },
    { src: '/subtitles/es.vtt', srclang: 'es', label: 'Spanish' }
  ]
});
```

### YouTube Stream Playback

Provide standard watch URLs, short links, embed URLs, or video IDs:

```javascript
player.load('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
player.load('https://youtu.be/dQw4w9WgXcQ?t=30');
player.load('dQw4w9WgXcQ');
```

### Dynamic Source Switching

Switch between different media types on an active instance without re-creating DOM structures:

```javascript
// Load a YouTube video
await player.load('dQw4w9WgXcQ');

// Switch to a native MP4 video file
await player.load('https://example.com/lecture.mp4');

// Switch back to a YouTube video starting at 60 seconds
await player.load('https://youtu.be/dQw4w9WgXcQ?t=60');
```

---

## Stream Link Shielding

### Click Interception

Standard embedded video players allow users to click titles or right-click to copy watch URLs. CYP implements an interaction shield:

1. Click Interceptor: An overlay layer captures pointer events to handle playback toggles, preventing navigation clicks from reaching iframe anchors.
2. Context Menu Suppression: Right-click events on the player container are intercepted to prevent default third-party context menus.
3. Ad Pass-Through: When video advertisements are detected, pointer events are automatically routed to allow interaction with native ad controls (such as the Skip Ad button).

### Stream Tokens

To prevent raw video identifiers from being visible in client-side HTML source:

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

The player decodes the token in memory at runtime without exposing the target URL in the DOM.

---

## Security Model

Custom Video Player (CYP) is built for secure multi-tenant and public-facing applications:

- Zero Runtime Dependencies: Eliminates supply chain attack vectors. No third-party npm packages execute in client browsers.
- URL Scheme Allowlisting: All dynamic resource properties (`poster`, `logo.src`, `logo.url`) pass through `sanitizeUrl()`. Only explicit safe schemes (`https:`, `http:`, `blob:`, `data:image/`) and relative paths are permitted. Unsafe schemes (`javascript:`, `vbscript:`, `data:text/html`) are neutralized automatically.
- Token Recursion Guard: Obfuscated token parsing includes recursion depth bounds (`depth <= 5`) to prevent stack overflow Denial of Service (DoS) attacks from cyclic or deeply nested payloads.
- DOM Safety: Logo overlays and title text elements enforce strict validation, rejecting unescaped script tags and inline DOM event attributes.
- YouTube IFrame Isolation: Uses privacy-enhanced `youtube-nocookie.com` host by default and configures origin parameters for postMessage communications.

---

## Picture-in-Picture and Mini-Player

CYP supports two Picture-in-Picture mechanisms:

1. Native Picture-in-Picture: Available for HTML5 media via the browser Picture-in-Picture API (`HTMLVideoElement.requestPictureInPicture()`).
2. Floating Mini-Player: A custom floating overlay that docks to the bottom corner of the viewport, maintaining playback, volume, and timeline controls.

```javascript
// Toggle mini-player
player.toggleMini();

// Request native PiP with automatic fallback to mini-player
await player.requestPictureInPicture();
```

Keyboard shortcut: <kbd>I</kbd> toggles the mini-player; <kbd>Esc</kbd> closes it.

---

## UI Presets and Customization

### Available Presets

Set the `preset` property during initialization or switch presets dynamically at runtime:

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
  --cyp-font-family: system-ui, -apple-system, sans-serif;
}
```

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
}

export function VideoPlayer({ url, preset = 'dark' }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    playerRef.current = new Player({
      element: containerRef.current,
      url,
      preset,
      lazy: true
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [url, preset]);

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
  preset: { type: String, default: 'dark' }
});

const container = ref(null);
let player = null;

onMounted(() => {
  player = new Player({
    element: container.value,
    url: props.src,
    preset: props.preset
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

  let container;
  let player;

  onMount(() => {
    player = new Player({
      element: container,
      url,
      preset
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
  preset?: PresetId;                   // UI preset name ('glass', 'minimal', etc.)
  theme?: ThemeId;                     // Color theme name
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
| `play()` | None | Resumes or starts playback. |
| `pause()` | None | Pauses playback. |
| `togglePlay()` | None | Toggles between play and pause states. |
| `stop()` | None | Stops playback and resets timeline to 0. |
| `seekTo(seconds)` | `seconds: number` | Seeks to a specific timestamp in seconds. |
| `seekBy(offset)` | `offset: number` | Seeks relative to the current timestamp. |
| `setVolume(value)` | `value: 0..100` | Sets audio volume percentage. |
| `mute()` | None | Mutes audio. |
| `unmute()` | None | Unmutes audio. |
| `toggleMute()` | None | Toggles audio mute state. |
| `setPlaybackRate(rate)` | `rate: 0.25..2.0` | Sets playback speed. |
| `toggleMini()` | None | Toggles floating mini-player mode. |
| `requestPictureInPicture()` | None | Requests native PiP or falls back to mini-player. |
| `load(target, startSeconds?)` | `target: string, start?: number` | Loads a new media source dynamically. |
| `applyPreset(presetId)` | `presetId: string` | Switches the active UI preset. |
| `setAccentColor(color)` | `color: string` | Updates accent color variable at runtime. |
| `setRadius(radius)` | `radius: number` | Updates border radius at runtime. |
| `destroy()` | None | Removes event listeners, timers, DOM nodes, and plugins. |

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
```

### Helper & Security Utilities

CYP exports utility functions for safe integration in web applications:

```javascript
import {
  sanitizeUrl,
  escapeHtml,
  encodeStreamToken,
  decodeStreamToken,
  parseYouTubeUrl,
  formatTime
} from '@researcher-tizar/cyp-player';

// Strip dangerous protocols (javascript:, vbscript:, data:text/html)
const safeUrl = sanitizeUrl(untrustedUrl);

// Escape HTML entities (&, <, >, ", ')
const safeHtml = escapeHtml(untrustedText);

// Encode a stream token to hide raw URLs from client DOM
const token = encodeStreamToken('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

// Format seconds into MM:SS or HH:MM:SS
const timeString = formatTime(125); // "02:05"
```

---

## Keyboard Shortcuts

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
| <kbd>Esc</kbd> | Exit mini-player or close open menus |
| <kbd>C</kbd> | Toggle captions / subtitles |
| <kbd>0</kbd> &ndash; <kbd>9</kbd> | Jump to 0% &ndash; 90% of duration |

---

## Testing

The project uses Vitest for unit and integration testing:

```bash
# Execute test suite
npm test

# Build production library
npm run build

# Build showcase demo
npm run build:demo
```

---

## License

MIT License &copy; 2026 [researchertizar](https://github.com/researchertizar). Free for personal and commercial use.
