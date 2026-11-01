# Contributing to Custom Video Player (CYP)

Thank you for your interest in contributing to Custom Video Player (CYP)! We welcome bug reports, documentation improvements, feature suggestions, and pull requests.

---

## Code of Conduct

Please maintain a respectful, welcoming, and inclusive atmosphere when participating in this project.

---

## Development Workflow

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/researchertizar/Custom-Video-Player-CYP.git
cd Custom-Video-Player-CYP
npm install
```

### Running Tests
The project uses [Vitest](https://vitest.dev/) for unit and integration testing:
```bash
npm test
```
To run tests in watch mode during development:
```bash
npm run test:watch
```

### Building the Project
CYP uses [Vite](https://vitejs.dev/) to produce ESM and UMD library bundles and CSS:
```bash
npm run build
```
Build outputs are placed in `dist/`.

### Building the Interactive Showcase / Demo
To test demo builds:
```bash
npm run build:demo
```
Outputs are compiled to `dist-demo/`.

---

## Architectural Principles & Rules

When submitting contributions, please keep these non-negotiable architectural rules in mind:

1. **Zero Runtime Dependencies**: The core player bundle must remain zero-dependency. Do not introduce mandatory third-party npm packages.
2. **S.O.L.I.D. Principles**:
   - **Single Responsibility**: Each module handles a focused responsibility (e.g. `Timeline`, `Controls`, `ProviderRegistry`, `YouTubeProvider`).
   - **Open/Closed**: The player core is closed for modification but open for extension. Add new media formats by registering classes with `ProviderRegistry` rather than modifying `Player._createProvider()`.
   - **Liskov Substitution**: Any subclass of `Provider` must implement the standard contract (`play`, `pause`, `seekTo`, `getCurrentTime`, `getDuration`, etc.) without throwing unexpected errors.
   - **Interface Segregation**: Providers declare explicit capabilities (`supportsPictureInPicture()`, `supportsCaptions()`, `supportsQualityLevels()`).
   - **Dependency Inversion**: Core components depend on abstractions (`Provider`), not concrete implementations.
3. **Memory Safety**: Any listener attached to `window` or `document` must be stored as a named instance reference and cleanly detached in `destroy()` to eliminate memory leaks.
4. **Technical Honesty**: Never misrepresent client-side Base64 obfuscation or DOM hiding as encryption, authorization, or DRM. See [`SECURITY.md`](SECURITY.md).
5. **YouTube Policy Adherence**: Never attempt to block, hide, bypass, or manipulate YouTube ads, tracking, or standard player controls. Overlays must not interfere with native YouTube functionality.
6. **WCAG 2.2 AAA Accessibility**: Controls, sliders, and interactive overlays must support keyboard navigation (`Tab`, `Space`, `Enter`, arrow keys), clear `:focus-visible` states, 44×44px mobile touch targets, and appropriate ARIA attributes.
7. **Tests Required**: Every bug fix and new feature must include automated regression tests in `tests/`.

---

## Implementing a Custom Provider

To add support for a new media backend (e.g. HLS.js, Dash.js, Vimeo):

1. Extend the abstract `Provider` class from `src/providers/provider.js`:
   ```javascript
   import { Provider } from '../providers/provider.js';

   export class CustomProvider extends Provider {
     constructor(emitter) {
       super(emitter);
       this._video = null;
     }

     async init(container, source, options = {}) {
       this._video = document.createElement('video');
       container.appendChild(this._video);
       // Engine initialization...
       this._emitter.emit('provider:ready');
     }

     play() { return this._video.play(); }
     pause() { this._video.pause(); }
     getCurrentTime() { return this._video.currentTime; }
     getDuration() { return this._video.duration || 0; }
     supportsPictureInPicture() { return true; }
     supportsCaptions() { return false; }
     supportsQualityLevels() { return true; }
     destroy() { this._video?.remove(); }
   }
   ```
2. Register the provider with `ProviderRegistry`:
   ```javascript
   import { ProviderRegistry } from '@researcher-tizar/cyp-player';
   ProviderRegistry.register('my-format', CustomProvider);
   ```
3. Add automated test coverage in `tests/unit/`.

---

## Submitting Pull Requests

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```
2. Make your changes in small, verifiable commits following [Conventional Commits](https://www.conventionalcommits.org/):
   - `fix: resolve slider keyboard navigation in timeline`
   - `feat: add exitPictureInPicture method`
   - `docs: update security model documentation`
3. Ensure all tests pass (`npm test`) and code builds cleanly (`npm run build`).
4. Push to your fork and submit a Pull Request with a clear description of the problem and the solution.
