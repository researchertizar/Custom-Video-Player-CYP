# Changelog

All notable changes to Custom Video Player (CYP) (`@researcher-tizar/cyp-player`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-11-01

### Added
- **Strict SVG Sanitization (`sanitizeSvg`)**: XML `DOMParser` and element allowlist prevents script execution, `<foreignObject>`, `<animate>`, and inline `on*` event handlers in watermark badges and logo overlays.
- **WAI-ARIA Slider Keyboard Navigation**: Timeline now supports `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`, `End`, `PageUp`, and `PageDown` with dynamic `aria-valuenow` and `aria-valuetext` updates.
- **Native Picture-in-Picture Control**: Added `exitPictureInPicture()` and `isPictureInPicture()` alongside existing `requestPictureInPicture()`, maintaining clear separation from the floating mini-player.
- **Dynamic Provider Swapping Event Cleanup**: Added `this._providerEventUnsubs` tracker to prevent zombie listener accumulation when switching sources between YouTube and HTML5.
- **HTML5 Progress Key Unification**: Resume plugin now generates sanitized, distinct storage keys for HTML5 video URLs instead of sharing `null`.
- **Comprehensive Test Suite**: Expanded test coverage from 60 tests across 13 files to 82 tests across 16 files, covering security, keyboard navigation, web components, provider switching, and resume caching.
- **Documentation**: Added comprehensive [`SECURITY.md`](SECURITY.md), [`CONTRIBUTING.md`](CONTRIBUTING.md), and honest threat model documentation.

### Changed
- **YouTube Policy Compliance**: Interceptor layer on YouTube streams now passes pointer events directly to the YouTube iframe (`pointer-events: none !important`), ensuring standard YouTube player controls, annotations, and ad interactions (Skip Ad, advertiser links) work without interference.
- **Removed Undocumented Ad Detection**: Stripped internal `getAdState()` polling and unsupported ad toasts in adherence to YouTube Developer Policies.
- **Context Menu Suppression**: Changed context menu and drag suppression to opt-in (`preventContextMenu: true`, `preventDrag: true`) rather than unconditionally hijacking browser context menus.
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
