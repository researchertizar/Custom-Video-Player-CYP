# Comprehensive Technical Audit Report: Custom Video Player (CYP)

**Project:** Custom Video Player (CYP)  
**Package:** `@researcher-tizar/cyp-player`  
**Repository:** `https://github.com/researchertizar/Custom-Video-Player-CYP`  
**Live Showcase:** `https://researchertizar.github.io/Custom-Video-Player-CYP/`  
**Audit Date:** 2026-11-01  
**Auditor:** Senior JavaScript Library Engineer, Web Components Architect, Browser Compatibility Engineer, Application Security Engineer, Accessibility Specialist  

---

## Executive Summary

Custom Video Player (CYP) is an ambitious open-source media player engine providing a unified API, custom UI presets, and autonomous Web Components across native HTML5 media and YouTube streams. The architecture exhibits strong foundations: zero runtime dependencies, modular provider abstraction (`IPlayerProvider`), high-speed polling isolation, and 60 automated unit tests.

However, an exhaustive line-by-line inspection reveals critical issues across **security claims, YouTube Terms of Service compliance, DOM XSS vectors, event listener memory leaks, keyboard focus hijacking, and accessibility (WCAG 2.2 AA)**.

This report classifies all confirmed bugs and architectural risks by severity, pinpointing the exact file, line number, root cause, impact, and required regression tests.

---

## Issue Severity Summary

| Severity | Count | Primary Impact Areas |
| :---: | :---: | :--- |
| **Critical** | 1 | Unsafe HTML parsing in `setLogo()` with potential DOM XSS vector |
| **High** | 5 | YouTube policy compliance, Playback promise swallowing, Event listener leaks, Keyboard focus hijacking, WAI-ARIA slider accessibility |
| **Medium** | 6 | Memory leaks in `Controls.destroy()`, Resume plugin key collisions on HTML5, Base64 token terminology, Web Component attribute removals, Missing native PiP exit events |
| **Low** | 3 | HLS/DASH format fallback detection, TypeScript declaration mismatches, Documentation wording |

---

## Confirmed Technical Findings

### 1. Security & Stream Protection (Phase 2)

#### ISSUE-01 (Critical): Insufficient SVG & HTML Sanitization in `setLogo()`
* **File & Location:** `src/ui/player-ui.js` lines 538–546
* **Description:** When `logoOptions.innerHTML` is passed, the player uses a simple regex check:
  ```javascript
  if (!/<script|javascript:|on\w+=/i.test(rawHtml)) {
    inner = safeUrl ? `<a ...>${rawHtml}</a>` : rawHtml;
  }
  this.logoOverlay.innerHTML = inner;
  ```
  This naive blacklist does not block `<svg><animate onbegin=...>`, `<svg><set ...>`, `<object data="...">`, `<embed>`, `<iframe src="data:text/html,...">`, or CDATA sections.
* **Why it matters:** Attackers passing SVG strings or host applications loading external logo configurations could execute arbitrary JavaScript in the context of the host application (DOM-based XSS).
* **Recommended Fix:** Deprecate arbitrary `innerHTML` in logo options or parse strings using `DOMParser` (`image/svg+xml`) and strictly allowlist only safe SVG tags (`<svg>`, `<path>`, `<rect>`, `<circle>`, `<polygon>`, `<g>`, `<line>`) with no scripts, foreignObjects, or event attributes.
* **Test Needed:** Security unit test with malicious SVG payloads (`<svg><animate onbegin="alert(1)">`, `<object data="javascript:alert(1)">`) asserting that execution payloads are completely sanitized.

---

#### ISSUE-02 (High): Misleading Security Terminology Regarding Base64 "Stream Tokens"
* **File & Location:** `src/utils/youtube-url.js` lines 107–129, `README.md` lines 204–237, `index.d.ts` line 49
* **Description:** The library uses the terms "Stream Link Shielding", "Stream Tokens", "URL Protection", and "Preventing raw URLs from being exposed". The implementation merely prefixes a Base64 string (`b64:ZFF3NHc5V2dYY1E=`).
* **Why it matters:** Base64 is encoding/obfuscation, not encryption, authentication, or DRM. Developers could mistakenly believe CYP protects paid courses or copyrighted media from being inspected or captured via browser developer tools or network requests.
* **Recommended Fix:** Clearly re-document `encodeStreamToken` and `decodeStreamToken` as **"Client-Side Attribute Obfuscation"** intended strictly for casual DOM inspection reduction. Add prominent documentation explaining that real video protection requires server-side token authentication, signed URLs, and DRM (Widevine/FairPlay).
* **Test Needed:** Documentation audit test ensuring no claims of "encryption" or "DRM" exist.

---

#### ISSUE-03 (Medium): Token Parsing String Splitting Bug
* **File & Location:** `src/utils/youtube-url.js` line 23:
  ```javascript
  const payload = trimmed.split(':')[1];
  ```
* **Description:** If a token string contains additional colons (e.g. `b64:aHR0cHM6Ly9...`), `split(':')[1]` only takes the segment before the next colon and discards the rest.
* **Why it matters:** Tokens containing Base64 encoded URLs or query parameters with colons fail to decode properly.
* **Recommended Fix:** Use `trimmed.slice(trimmed.indexOf(':') + 1)`.
* **Test Needed:** Unit test with `b64:` tokens containing Base64 strings with colons.

---

### 2. YouTube API & Developer Policy Compliance (Phase 3)

#### ISSUE-04 (High): Click Interceptor & Ad Detection Conflicts with YouTube Developer Policies
* **File & Location:** `src/providers/youtube/youtube-provider.js` lines 170–174; `src/ui/player-ui.js` lines 298–304; `styles/player.css` lines 86–96
* **Description:** The player places `.cyp-click-interceptor` (an absolute positioned transparent overlay) over the video box. When using YouTube, this intercepts clicks to toggle play/pause, blocking users from clicking YouTube annotations, links, and native ad controls. To work around this, the code attempts to call an undocumented private method `this._yt.getAdState() === 1` to pass pointer events through.
* **Why it matters:** 
  1. YouTube Developer Policies Section III.A explicitly states: *"You must not: ... obscure, hide, or manipulate any part of the YouTube player, including advertisements, controls, branding, or viewing options."*
  2. `getAdState()` is a private, undocumented method that can break at any time without warning.
  3. If ad detection fails, users cannot click "Skip Ad" or interact with video sponsorships.
* **Recommended Fix:**
  - For YouTube playback, disable the overlay click interceptor (`pointer-events: none` on the overlay when provider is YouTube).
  - Allow YouTube to handle its own interactions, ads, and annotations natively.
  - Keep custom controls as an external floating dock around the player.
  - Remove dependency on undocumented `getAdState()`.
* **Test Needed:** Integration test verifying that when `providerType === 'youtube'`, `.cyp-click-interceptor` does not trap clicks over the iframe.

---

#### ISSUE-05 (Medium): Aggressive Global Context Menu Interception
* **File & Location:** `src/ui/player-ui.js` lines 318–322
* **Description:** `this._root.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); }, true);` is unconditionally bound on the player root.
* **Why it matters:** Suppressing the browser context menu unconditionally violates user expectations and accessibility tools without providing actual security. Over YouTube iframes, it attempts to block native YouTube context items ("Stats for nerds", "Copy video URL at current time").
* **Recommended Fix:** Make context menu suppression an optional opt-in flag (`preventContextMenu: false` by default).
* **Test Needed:** Test asserting contextmenu fires normally unless `preventContextMenu: true` is configured.

---

### 3. Unified Player API & Playback Promises (Phase 4)

#### ISSUE-06 (High): Swallowed `play()` Promise Rejection in HTML5 Provider
* **File & Location:** `src/providers/html5/html5-provider.js` lines 201–210; `src/core/player.js` lines 268–275
* **Description:** In `HTML5Provider.play()`:
  ```javascript
  play() {
    if (this._video) {
      const p = this._video.play();
      if (p !== undefined) {
        p.catch((err) => { console.warn('[HTML5Provider] Play interrupted or blocked:', err); });
      }
    }
  }
  ```
  `HTML5Provider.play()` returns `void`, and in `Player.play()`:
  ```javascript
  async play() {
    ...
    this.provider.play();
  }
  ```
* **Why it matters:** Browsers frequently reject `play()` with `NotAllowedError` when autoplay restrictions are triggered without a user gesture. Because the rejection is caught and discarded, `await player.play()` resolves successfully even though the video never played!
* **Recommended Fix:** `HTML5Provider.play()` must return the `play()` promise. `Player.play()` must return and propagate the promise, while emitting an `'error'` or `'playback:blocked'` event.
* **Test Needed:** Unit test simulating `video.play()` rejection and asserting `await player.play()` rejects with the matching error.

---

#### ISSUE-07 (High): Event Listener Accumulation on Dynamic Provider Switch
* **File & Location:** `src/core/player.js` line 436
* **Description:** In `Player.load()`, when switching provider types (e.g. from YouTube to HTML5):
  ```javascript
  this._providerType = detection.type;
  this.provider = this._createProvider(this._providerType);
  this._bindProviderEvents();
  ```
  `_bindProviderEvents()` registers 8 event listeners on `this.events`. The previous listeners on `this.events` are never unsubscribed!
* **Why it matters:** Every provider switch adds another set of listeners. After 4 switches, progress polling, state updates, and error handlers trigger 4 times per event tick, creating CPU spikes and memory leaks.
* **Recommended Fix:** Store listener unbind callbacks in an array (`this._providerUnsubs`) and invoke them before binding a new provider.
* **Test Needed:** Integration test switching between YouTube and HTML5 3 times, verifying listener count on `this.events` remains constant.

---

### 4. Accessibility (WCAG 2.2 AA) (Phase 7)

#### ISSUE-08 (High): Timeline Slider Lacks Keyboard Event Handlers
* **File & Location:** `src/ui/timeline.js` lines 22–32, 50–60
* **Description:** `Timeline.element` has `role="slider"`, `tabindex="0"`, `aria-label="Video progress bar"`, `aria-valuemin="0"`, and `aria-valuenow="0"`, but attaches zero `keydown` listeners!
* **Why it matters:** Keyboard-only users who tab to the timeline slider cannot scrub using arrow keys. This is a direct failure of **WCAG 2.1.1 (Keyboard)** and the WAI-ARIA Slider Authoring Practice.
* **Recommended Fix:** Add a `keydown` handler on `this.element`:
  - `ArrowLeft` / `ArrowDown`: Seek backward by 5 seconds (or 1%).
  - `ArrowRight` / `ArrowUp`: Seek forward by 5 seconds (or 1%).
  - `PageDown`: Seek backward by 10% of duration.
  - `PageUp`: Seek forward by 10% of duration.
  - `Home`: Seek to 0 seconds.
  - `End`: Seek to video duration.
* **Test Needed:** Unit test simulating `keydown` with `ArrowRight`, `ArrowLeft`, `Home`, and `End` on `timeline.element` and asserting `player.seekTo` is called with correct values.

---

#### ISSUE-09 (High): Document-Level Memory Leak in `Controls.destroy()`
* **File & Location:** `src/ui/controls.js` lines 374–386, 773–780
* **Description:** In `Controls._bindEvents()`:
  ```javascript
  document.addEventListener('click', (e) => { ... });
  document.addEventListener('keydown', (e) => { ... });
  ```
  These two anonymous handlers are added to `document`. In `Controls.destroy()`, they are never removed!
* **Why it matters:** Every time a player instance is created and destroyed (e.g. in single-page apps or test runs), 2 zombie listeners remain attached to `document`, retaining references to the DOM and player instance.
* **Recommended Fix:** Store references to the handlers (`this._onDocClick`, `this._onDocKeyDown`) and call `document.removeEventListener` in `Controls.destroy()`.
* **Test Needed:** Test verifying that after `player.destroy()`, document event listeners do not fire.

---

### 5. Keyboard Shortcuts Plugin (Phase 6)

#### ISSUE-10 (High): Global Keyboard Hijacking on Single-Player Pages
* **File & Location:** `src/plugins/keyboard.js` lines 54–64
* **Description:** The multi-player disambiguation check only activates if `allPlayers.length > 1`. If there is only 1 player on the page, the key handler intercepts `Space`, `k`, `j`, `l`, `m`, `f`, and numbers `0–9` regardless of whether the player is focused, hovered, or visible!
* **Why it matters:** If a user is scrolling a long article or interacting with an unrelated dropdown/slider on the page, pressing `Space` or `m` will unexpectedly start or mute the player.
* **Recommended Fix:**
  - Add an option `global: false` by default, requiring the player container to contain focus or be actively playing.
  - Provide an option to disable keyboard shortcuts completely (`keyboard: false`).
* **Test Needed:** Unit test verifying that when container does not have focus and `global: false`, keydown events do not trigger playback.

---

### 6. Plugins & State (Phase 12)

#### ISSUE-11 (Medium): LocalStorage Key Collision for HTML5 in `resumePlugin`
* **File & Location:** `src/plugins/resume.js` line 22
* **Description:** The storage key is generated as:
  ```javascript
  const getKey = () => `${config.storageKeyPrefix}${playerInstance._currentVideoId}`;
  ```
  For HTML5 video, `_currentVideoId` is always `null`!
* **Why it matters:** All HTML5 videos on the same domain share the exact same key: `cyp_resume_null`. Playing video A will overwrite the resume position of video B.
* **Recommended Fix:** Use `playerInstance._currentVideoTarget || playerInstance._currentVideoId` (with a lightweight hash or URL sanitization).
* **Test Needed:** Unit test with two different HTML5 video URLs verifying they use distinct localStorage keys.

---

### 7. Web Component Attribute Lifecycle (Phase 5)

#### ISSUE-12 (Medium): Attribute Removal Ignored in `attributeChangedCallback`
* **File & Location:** `src/web-component.js` lines 87–119
* **Description:** `attributeChangedCallback` only acts when `newValue` is truthy:
  ```javascript
  } else if (name === 'theme' && newValue) {
    this.player.setTheme(newValue);
  ```
  If an attribute is removed via `removeAttribute('theme')` or `removeAttribute('preset')`, `newValue` is `null` and the change is completely ignored.
* **Recommended Fix:** Handle `newValue === null` by resetting to default theme, radius, or options.
* **Test Needed:** Test asserting that removing an attribute resets the player property.

---

### 8. Native Picture-in-Picture & Mini-Player Separation (Phase 9)

#### ISSUE-13 (Medium): Ambiguous Picture-in-Picture Fallback without Exit Handling
* **File & Location:** `src/core/player.js` lines 487–496; `src/providers/html5/html5-provider.js` lines 403–407
* **Description:** `requestPictureInPicture()` conflates native OS Picture-in-Picture with the custom floating mini-player. Furthermore, there is no `exitPictureInPicture()` method or `pictureInPictureElement` check.
* **Recommended Fix:** Provide distinct API methods: `requestPictureInPicture()`, `exitPictureInPicture()`, and `toggleMini()`. Listen to `enterpictureinpicture` and `leavepictureinpicture` native video events.
* **Test Needed:** Unit test checking native PiP request and exit events.

---

### 9. Streaming Architecture & Format Detection (Phase 13)

#### ISSUE-14 (Low / Improvement): HLS (`.m3u8`) and DASH (`.mpd`) Detection Without Engine Support
* **File & Location:** `src/utils/source-detector.js` line 8
* **Description:** `.m3u8` and `.mpd` extensions are recognized as HTML5 video. However, on Chromium and Firefox, native `<video>` elements cannot play HLS or DASH manifests without a JavaScript demuxer (such as `hls.js` or `dash.js`).
* **Recommended Fix:** Check `video.canPlayType('application/vnd.apple.mpegurl')`. If unsupported natively, check if `window.Hls` is available and attach seamlessly, or provide an optional adapter interface without bloating the core bundle with heavy dependencies.
* **Test Needed:** Test verifying that native HLS is detected on Safari and a clear error is emitted on browsers without HLS support when no HLS engine is supplied.

---

### 10. TypeScript Declarations Completeness (Phase 11)

#### ISSUE-15 (Low): Type Definition Inconsistencies
* **File & Location:** `index.d.ts`
* **Description:** `CustomVideoPlayerElement` and `CustomYouTubePlayerElement` are not fully typed as HTMLElement subclasses. `Player.play()` return type is typed as `Promise<void>`, but the runtime was returning `undefined`.
* **Recommended Fix:** Update `index.d.ts` to strictly match the audited runtime behavior, with discriminated unions for provider-specific capabilities.
* **Test Needed:** TypeScript compilation test (`tsc --noEmit`) on consumer example.

---

## Prioritized Implementation Roadmap

Following the non-negotiable engineering rules, fixes will be applied in prioritized, verifiable stages:

1. **Stage 1 (Security & DOM Hardening):** Fix SVG parsing in `setLogo()` with strict DOMParser allowlist; fix token parsing colon truncation.
2. **Stage 2 (YouTube Policy & IFrame Interaction):** Disable intrusive click-interception overlay over YouTube iframes; remove undocumented `getAdState()` polling; make contextmenu suppression opt-in.
3. **Stage 3 (Unified API & Promise Handling):** Propagate `video.play()` rejection promises in HTML5 provider; prevent listener accumulation in `Player.load()`.
4. **Stage 4 (Accessibility & Keyboard Fixes):** Implement WAI-ARIA slider keyboard handlers on `Timeline`; fix document-level listener leaks in `Controls.destroy()`; isolate keyboard shortcut plugin to focused/hovered player.
5. **Stage 5 (Web Component & Plugin Polish):** Handle attribute removal in `web-component.js`; fix HTML5 localStorage key collision in `resumePlugin`.
6. **Stage 6 (TypeScript, HLS Adapter & Docs Repair):** Update `index.d.ts`; add optional HLS detection; update `README.md` and `SECURITY.md` removing false security claims.
7. **Stage 7 (Automated Regression Testing & Package Validation):** Run all existing 60 tests plus new regression tests; run `npm pack` verification.
