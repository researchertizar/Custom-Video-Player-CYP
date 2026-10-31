# Custom Video Player (CYP) &middot; `@researcher-tizar/cyp-player`

> A modern, zero-runtime-dependency universal video player engine and Autonomous Web Component. Plays both **native HTML5 video files** (MP4, WebM, OGG, direct streams) and **YouTube streams** with identical luxury UI, link shielding, progressive disclosure, and 6 battle-tested developer UI presets.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/badge/npm-%40researcher--tizar%2Fcyp--player-red.svg)](https://www.npmjs.com/package/@researcher-tizar/cyp-player)
[![Tests: 51 Passed](https://img.shields.io/badge/Tests-51%20Passed-brightgreen.svg)]()
[![TypeScript: Included](https://img.shields.io/badge/TypeScript-Types%20Included-3178c6.svg)](index.d.ts)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-~24KB%20gzip-success.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20Runtime-blueviolet.svg)]()

---

## 📑 Table of Contents

1. [Why Custom Video Player (CYP)?](#-why-custom-video-player-cyp)
2. [Key Architecture & Features](#-key-architecture--features)
3. [Installation & Quick Start](#-installation--quick-start)
   - [Modern Bundlers (NPM / Vite / Next.js)](#1-modern-bundlers-npm--vite--nextjs--nuxt)
   - [CDN / HTML Script Tag](#2-via-cdn--html-script-tag)
   - [Autonomous Web Component](#3-autonomous-native-web-component)
4. [Universal Media Support: HTML5 & YouTube](#-universal-media-support-html5--youtube)
   - [Playing HTML5 Video Files (.mp4, .webm, .ogg)](#1-playing-html5-video-files)
   - [Playing YouTube Streams](#2-playing-youtube-streams)
   - [Dynamic Source Hot-Swapping](#3-dynamic-source-hot-swapping)
5. [Shielding & Hiding Video Links (Stream Privacy)](#-shielding--hiding-video-links-stream-privacy)
   - [The Problem with Standard Video Embeds](#the-problem-with-standard-video-embeds)
   - [How Link Shielding Works](#how-link-shielding-works)
   - [Generating Stream Tokens (Server & Client)](#generating-stream-tokens)
6. [Picture-in-Picture & Floating Mini-Player](#-picture-in-picture--floating-mini-player)
7. [Developer UI Models & Design Presets](#-developer-ui-models--design-presets)
8. [Progressive Disclosure System](#-progressive-disclosure-system)
9. [Framework Integration Guides](#-framework-integration-guides)
   - [React / Next.js](#react--nextjs-integration)
   - [Vue 3 / Nuxt](#vue-3--nuxt-integration)
   - [Svelte / SvelteKit](#svelte--sveltekit-integration)
10. [Plugins Ecosystem](#-plugins-ecosystem)
11. [Deep Customization & Styling Tokens](#-deep-customization--styling-tokens)
12. [Public API Reference](#-public-api-reference)
    - [Constructor Options](#constructor-options)
    - [Player Instance Methods](#player-instance-methods)
    - [Event Bus](#player-events)
13. [Keyboard Shortcuts](#-keyboard-shortcuts)
14. [Testing & Verification](#-testing--verification)
15. [License](#-license)

---

## 💡 Why Custom Video Player (CYP)?

Standard HTML5 video elements look plain, inconsistent across operating systems, and lack responsive luxury styling. Meanwhile, standard YouTube `<iframe>` embeds leak user traffic to third-party sites, show aggressive related video popups, redirect users away when clicked, and clutter clean web designs.

**Custom Video Player (CYP)** solves this with a unified, zero-dependency engine:

- 🎬 **Unified Experience:** Identical luxury design, seeker timeline, speed controller, and shortcuts across both direct MP4 files and YouTube videos.
- 🛡️ **Stream Link Shielding:** Transparent click interceptors and context menu blockers prevent users from right-clicking to copy video URLs or inspecting YouTube watch links.
- 🔒 **Obfuscated Stream Tokens:** Feed base64-shielded tokens (`b64:...`) to hide direct media links from DOM scrapers.
- 🪟 **Floating Mini-Player & PiP:** Native Picture-in-Picture with automatic fallback to a sleek floating mini-player with draggable controls and instant return.
- 🎨 **6 One-Click UI Models:** Switch between Glassmorphism, Modern Minimal, Professional Studio, Cinema OLED, Cyber HUD, and Classic Dark with a single config flag.
- 🧩 **Zero Runtime Bloat:** Exactly 0 external npm dependencies in production (~24KB gzip).

---

## 🚀 Installation & Quick Start

### 1. Modern Bundlers (NPM / Vite / Next.js / Nuxt)

```bash
npm install @researcher-tizar/cyp-player
# or
yarn add @researcher-tizar/cyp-player
# or
pnpm add @researcher-tizar/cyp-player
```

```javascript
import { createPlayer } from '@researcher-tizar/cyp-player';
import '@researcher-tizar/cyp-player/dist/player.css';

// Initialize with an MP4 video or YouTube URL
const player = createPlayer({
  element: '#player-container',
  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  preset: 'glass',
  autoplay: false
});
```

### 2. Via CDN / HTML Script Tag

No build tools required. Place in your static HTML:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://unpkg.com/@researcher-tizar/cyp-player/dist/player.css">

<!-- Container -->
<div id="my-player" style="max-width: 860px; margin: 40px auto;"></div>

<!-- Library UMD Bundle -->
<script src="https://unpkg.com/@researcher-tizar/cyp-player/dist/player.umd.js"></script>
<script>
  const player = CustomVideoPlayer.create({
    element: '#my-player',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    preset: 'professional'
  });
</script>
```

### 3. Autonomous Native Web Component

No JavaScript initialization needed! Use declarative HTML tags:

```html
<script type="module" src="https://unpkg.com/@researcher-tizar/cyp-player/dist/player.es.js"></script>

<!-- For direct HTML5 videos -->
<custom-video-player
  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  preset="glass"
  radius="16">
</custom-video-player>

<!-- For YouTube videos -->
<custom-video-player
  video-id="dQw4w9WgXcQ"
  preset="cyber"
  accent-color="#06b6d4">
</custom-video-player>
```

*(Note: `<custom-youtube-player>` is also registered as an interchangeable alias).*

---

## 🎞️ Universal Media Support: HTML5 & YouTube

The player includes built-in source detection that automatically routes your media to the native HTML5 backend or the YouTube IFrame engine:

### 1. Playing HTML5 Video Files

Direct MP4, WebM, OGG, and adaptive HLS/DASH streams are supported natively:

```javascript
import { Player } from '@researcher-tizar/cyp-player';

const player = new Player({
  element: '#player',
  src: 'https://example.com/videos/movie.mp4',
  poster: 'https://example.com/poster.jpg',
  tracks: [
    { src: '/captions/en.vtt', srclang: 'en', label: 'English', default: true },
    { src: '/captions/es.vtt', srclang: 'es', label: 'Español' }
  ]
});
```

### 2. Playing YouTube Streams

You can provide a standard YouTube URL, short URL, embed link, or plain 11-character video ID:

```javascript
// Accepts any of the following formats:
player.load('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
player.load('https://youtu.be/dQw4w9WgXcQ?t=45');
player.load('dQw4w9WgXcQ');
```

### 3. Dynamic Source Hot-Swapping

Switch seamlessly between different video files and YouTube streams at runtime on the same player instance without re-instantiating DOM elements:

```javascript
// Currently playing YouTube video:
await player.load('dQw4w9WgXcQ');

// Seamlessly switch to an MP4 video file:
await player.load('https://example.com/presentation.mp4');

// Switch back to YouTube at an exact timestamp (90s):
await player.load('https://youtu.be/L_LUpnjgPso?t=90');
```

---

## 🛡️ Shielding & Hiding Video Links (Stream Privacy)

### The Problem with Standard Video Embeds

Standard YouTube players leak video URLs in several ways:
1. **Title and Share overlays** contain clickable links that navigate users directly to `youtube.com`.
2. **Right-click context menu** allows users to copy video URLs or debug info.
3. **HTML source code** exposes raw IDs (`dQw4w9WgXcQ`) that web scrapers can extract.

### How Link Shielding Works

`@researcher-tizar/cyp-player` employs a multi-tiered privacy shield:

```
[ User Interaction ]
        │
        ▼
[ Click Interceptor Layer (z-index: 2) ]  <-- Captures play/pause/gestures
        │                                  <-- Absorbs redirect clicks
        ▼
[ YouTube IFrame / HTML5 Video (z-index: 1) ] (pointer-events: none)
```

1. **Click Interception Layer:** A transparent layer sits on top of the media surface. Clicks trigger custom play/pause animations instead of YouTube's redirection links.
2. **Context Menu Suppression:** Right-clicks on the player are intercepted, blocking the default browser and YouTube context menus.
3. **Smart Ad Pass-Through:** When an ad plays, the interceptor automatically relaxes `pointer-events` so viewers can click YouTube's official **"Skip Ad"** button.

### Generating Stream Tokens

To completely hide video URLs from client-side DOM scrapers, encode them into **Stream Tokens**:

#### On Your Backend (Node.js / Express / Next.js API):
```javascript
import { encodeStreamToken } from '@researcher-tizar/cyp-player';

// In your API route:
export async function getVideo(req, res) {
  const rawUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s';
  const token = encodeStreamToken(rawUrl); 
  // Yields: "b64:ZFF3NHc5V2dYY1E/dD0zMA=="

  res.json({ streamToken: token });
}
```

#### On Your Frontend:
```javascript
// Feed the token directly to the player:
player.load('b64:ZFF3NHc5V2dYY1E/dD0zMA==');
```

The player decodes the token in-memory at runtime without exposing the raw URL in the DOM.

---

## 🪟 Picture-in-Picture & Floating Mini-Player

CYP includes dual-mode Picture-in-Picture:
1. **Native PiP:** For HTML5 videos, calls the browser's native `HTMLVideoElement.requestPictureInPicture()`.
2. **Floating Mini-Player:** An elegant bottom-corner floating dock with smooth slide-in animations, responsive controls, title display, and 1-click expand/close actions.

```javascript
// Toggle mini-player via JavaScript API:
player.toggleMini();

// Or request native PiP with mini-player fallback:
await player.requestPictureInPicture();
```

Users can also press the <kbd>I</kbd> key to enter/exit mini-player, or <kbd>Esc</kbd> to exit.

---

## 🎨 Developer UI Models & Design Presets

Switch between 6 production UI models using the `preset` configuration option:

```javascript
const player = createPlayer({
  element: '#player',
  url: 'https://example.com/video.mp4',
  preset: 'glass' // 'glass' | 'minimal' | 'professional' | 'cyber' | 'cinema' | 'dark'
});
```

| Preset ID | Name | Accent | Radius | Seeker | Character & Best Use Case |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `glass` | **Glassmorphism** | `#00f5d4` | `16px` | `4px` | Frosted-glass backdrop blur, cyan glow. Modern SaaS & web apps. |
| `minimal` | **Modern Minimal** | `#ffffff` | `24px` | `3px` | Distraction-free floating pill dock, pure monochrome. Portfolios. |
| `professional` | **Studio Console** | `#f59e0b` | `6px` | `4px` | Broadcast dark charcoal, amber tally, monospace time. B2B & courses. |
| `cyber` | **Cyber Advanced** | `#00ff88` | `2px` | `6px` | High-tech HUD console, sharp corners, cyber green glow. Gaming. |
| `cinema` | **Cinema OLED** | `#d4af37` | `8px` | `4px` | Pitch-black OLED background, champagne gold accent. Movies & films. |
| `dark` | **Classic Dark** | `#e50914` | `12px` | `5px` | Standard video player with signature crimson accent. Universal default. |

---

## 👁️ Progressive Disclosure System

CYP adheres to strict UI hygiene: **no dead controls or clutter**.

- **Quality Menu:** Hidden automatically until the media source confirms multiple resolution streams.
- **Subtitles Button:** Hidden until WebVTT tracks or closed captions are detected.
- **Chapters Button:** Hidden until chapters are configured.
- **Watermark Logo:** Hidden until a logo is provided.
- **Ad Detection:** Skip Ad controls only reveal themselves during active ad playback.

---

## 💻 Framework Integration Guides

### React / Next.js Integration

```tsx
import React, { useEffect, useRef } from 'react';
import { Player } from '@researcher-tizar/cyp-player';
import '@researcher-tizar/cyp-player/dist/player.css';

export function VideoPlayer({ url, preset = 'glass' }: { url: string; preset?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    playerRef.current = new Player({
      element: containerRef.current,
      url,
      preset: preset as any,
      lazy: true
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [url, preset]);

  return <div ref={containerRef} className="my-video-container" />;
}
```

### Vue 3 / Nuxt Integration

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Player } from '@researcher-tizar/cyp-player';
import '@researcher-tizar/cyp-player/dist/player.css';

const props = defineProps({
  src: { type: String, required: true },
  preset: { type: String, default: 'minimal' }
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

onUnmounted(() => {
  player?.destroy();
});
</script>

<template>
  <div ref="container" class="player-wrapper"></div>
</template>
```

---

## ⚙️ Public API Reference

### Constructor Options (`PlayerOptions`)

```typescript
const player = new Player({
  element: string | HTMLElement,   // Container element or CSS selector (Required)
  url?: string,                    // Media URL (HTML5 file or YouTube link)
  videoId?: string,                // 11-char YouTube ID
  src?: string | object | Array,   // Alternative HTML5 source definition
  streamToken?: string,            // Obfuscated b64:... token
  preset?: PresetId,               // 'glass' | 'minimal' | 'professional' | 'cyber' | 'cinema' | 'dark'
  theme?: ThemeId,                 // 'dark' | 'cinema' | 'glass' | 'minimal' | 'professional' | 'cyber'
  accentColor?: string,            // Custom accent color ('#e50914', '#0284c7', etc.)
  radius?: number | string,        // Corner radius (e.g. 12 or '12px')
  trackHeight?: number | string,   // Seeker bar height in px (e.g. 4 or 6)
  poster?: string,                 // Custom poster facade image URL
  logo?: {                         // Custom watermark branding logo
    src?: string,
    innerHTML?: string,
    url?: string,
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
    opacity?: number,
    width?: string
  },
  autoplay?: boolean,              // Autoplay on load (default: false)
  lazy?: boolean,                  // Render facade before loading engine (default: true)
  controls?: boolean | string[],   // True or array of enabled button names
  plugins?: Array<any>,            // Registered plugin instances
  debug?: boolean                  // Output internal diagnostics (default: false)
});
```

### Player Instance Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `player.play()` | `None` | Starts or resumes video playback. |
| `player.pause()` | `None` | Pauses video playback. |
| `player.togglePlay()` | `None` | Toggles playback between play and pause. |
| `player.stop()` | `None` | Stops video and resets position to `0`. |
| `player.seekTo(sec)` | `seconds: number` | Seeks to a specific timestamp in seconds. |
| `player.seekBy(offset)` | `offset: number` | Seeks relative to current position (e.g. `+10` or `-10`). |
| `player.setVolume(val)` | `volume: 0..100` | Adjusts volume level. |
| `player.mute()` | `None` | Mutes audio. |
| `player.unmute()` | `None` | Unmutes audio. |
| `player.toggleMute()` | `None` | Toggles audio mute state. |
| `player.setPlaybackRate(r)` | `rate: 0.5..2.0` | Sets playback speed. |
| `player.toggleMini()` | `None` | Toggles floating mini-player mode. |
| `player.requestPictureInPicture()` | `None` | Triggers native PiP or falls back to mini-player. |
| `player.load(target, sec?)` | `target, start?` | Loads a new video (URL, ID, file, or token). |
| `player.applyPreset(id)` | `presetId: string` | Hot-swaps UI model preset. |
| `player.setAccentColor(hex)` | `color: string` | Updates accent highlight color dynamically. |
| `player.setRadius(r)` | `radius: number` | Updates corner radius dynamically. |
| `player.setLogo(options)` | `logoOptions` | Sets custom watermark branding overlay. |
| `player.destroy()` | `None` | Tears down timers, plugins, listeners, and DOM elements. |

### Player Events

Subscribe using `player.on(eventName, callback)`:

```javascript
player.on('ready', () => console.log('Player initialized'));
player.on('playing', () => console.log('Video is playing'));
player.on('pause', () => console.log('Video paused'));
player.on('ended', () => console.log('Video playback finished'));
player.on('timeupdate', (time) => console.log('Current time:', time));
player.on('volumechange', ({ volume, muted }) => console.log('Volume:', volume, muted));
player.on('change:theme', (theme) => console.log('Active theme:', theme));
player.on('error', (err) => console.error('Player error:', err));
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> or <kbd>K</kbd> | Toggle Play / Pause |
| <kbd>←</kbd> / <kbd>→</kbd> | Seek Backward / Forward 5 seconds |
| <kbd>J</kbd> / <kbd>L</kbd> | Seek Backward / Forward 10 seconds |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume Up / Down 5% |
| <kbd>M</kbd> | Toggle Mute |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>T</kbd> | Toggle Theater Mode |
| <kbd>I</kbd> | Toggle Floating Mini-Player |
| <kbd>Esc</kbd> | Exit Mini-Player / Close Settings Menu |
| <kbd>C</kbd> | Toggle Subtitles / Closed Captions |
| <kbd>0</kbd> – <kbd>9</kbd> | Seek to 0% – 90% of duration |

---

## 🧪 Testing & Verification

CYP contains a complete unit and integration test suite powered by **Vitest**:

```bash
# Run all tests
npm test

# Run build bundle verification
npm run build
```

---

## 📄 License

MIT License &copy; 2026 [researchertizar](https://github.com/researchertizar). Free for personal and commercial use.
