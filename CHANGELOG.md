# Changelog

All notable changes to Custom Video Player (CYP) (`@researcher-tizar/cyp-player`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-11-01

### Added
- **S.O.L.I.D. Open/Closed Provider Architecture**: Introduced `ProviderRegistry` (`register`, `get`, `has`, `getSupportedTypes`, `reset`) and static `Player.registerProvider()`. Third-party streaming engines (HLS.js, Dash.js, Vimeo) can now be dynamically plugged in without altering core library code.
- **Provider Capability Detection**: Added `supportsPictureInPicture()`, `supportsCaptions()`, and `supportsQualityLevels()` methods on `Provider`, `HTML5Provider`, and `YouTubeProvider` for automated UI progressive disclosure.
- **Actionable YouTube Embedding Error Recovery**: When YouTube Error 150/101 (`ErrorCode.EMBEDDING_DISABLED`) occurs, CYP now automatically surfaces an accessible, high-contrast **"Watch on YouTube ↗"** button linking directly to `https://www.youtube.com/watch?v={videoId}` in a new tab.
- **Page Visibility API Background Throttling**: Added `document.visibilitychange` handler. When the browser tab is hidden or minimized, CYP suspends the 200ms timeline and polling loop to conserve CPU and laptop battery, resuming immediately upon returning to the tab.
- **Mobile Touch Optimization (Fitts's Law)**: Added `@media (pointer: coarse)` CSS rules enforcing minimum **44×44px** hit targets across all control buttons on touch devices.
- **WCAG 2.2 AAA Contrast Enhancement**: Adjusted secondary text tokens (`--cyp-text-secondary`) to `rgba(255, 255, 255, 0.9)` (>7:1 contrast ratio against player background) and wrapped time displays in semi-transparent backdrop boxes (`rgba(0, 0, 0, 0.65)`).
- **Strict SVG Sanitization (`sanitizeSvg`)**: XML `DOMParser` and element allowlist prevents script execution, `<foreignObject>`, `<animate>`, and inline `on*` event handlers in watermark badges and logo overlays.
- **WAI-ARIA Slider Keyboard Navigation**: Timeline now supports `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`, `End`, `PageUp`, and `PageDown` with dynamic `aria-valuenow` and `aria-valuetext` updates.
- **Native Picture-in-Picture Control**: Added `exitPictureInPicture()` and `isPictureInPicture()` alongside existing `requestPictureInPicture()`, maintaining clear separation from the floating mini-player.
- **Dynamic Provider Swapping Event Cleanup**: Added `this._providerEventUnsubs` tracker to prevent zombie listener accumulation when switching sources between YouTube and HTML5.
- **HTML5 Progress Key Unification**: Resume plugin now generates sanitized, distinct storage keys for HTML5 video URLs instead of sharing `null`.
- **Comprehensive Test Suite**: Expanded automated test coverage from 60 to 74 tests across 14 test suites, covering security, keyboard navigation, provider registry, and controls lifecycle.
- **Documentation**: Added comprehensive [`SECURITY.md`](SECURITY.md), [`CONTRIBUTING.md`](CONTRIBUTING.md), [`AUDIT_REPORT.md`](AUDIT_REPORT.md), and honest threat model documentation.

### Changed
- **Dual-Mode Interaction Model**: Refactored interaction layer to support `mode: 'enhanced'` (distraction-free studio controls with automatic ad unlock) and `mode: 'compliant'` (direct pointer pass-through to the iframe for strict YouTube embedding policy compliance).
- **Memory Leak Elimination**: Refactored `Controls` and `PlayerUI` to store document listeners as named instance references (`this._onDocClick`, `this._onDocKeyDown`, `this._onFullscreenChange`), cleanly detaching them upon `destroy()`.
- **Preset Chip Synchronization**: Demo page now synchronizes manual URL input with preset chips, immediately clearing the `.active` state when the input no longer matches the preset.
- **Async Playback Promises**: `HTML5Provider.play()` and `Player.play()` now return promises directly from `video.play()`, emitting `'playback:blocked'` upon browser autoplay rejections.
- **Base64 Token Extraction**: Fixed colon splitting bug in `parseYouTubeUrl` using `slice(indexOf(':') + 1)`.
- **Keyboard Shortcut Scoping**: Shortcuts now scope to player container hover or focus by default (`global: false`), preventing key hijacking across the host page.
- **Web Component Attribute Removal**: Removing attributes (`theme`, `preset`, `accent-color`, `radius`, `captions`) now cleanly resets player state to default values.

## [0.1.0] - 2026-10-30

- Initial release of Custom Video Player (CYP).
- Unified API across HTML5 media and YouTube streams.
- Zero runtime dependencies (~24KB minified bundle).
- 6 built-in UI presets (Glass, Minimal, Professional, Cyber, Cinema, Dark).
- Autonomous Web Component (`<custom-video-player>` and `<custom-youtube-player>`).
