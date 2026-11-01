# Contributing to Custom Video Player (CYP)

Thank you for your interest in contributing to Custom Video Player (CYP)! We welcome bug reports, documentation improvements, feature suggestions, and pull requests.

## Code of Conduct

Please maintain a respectful, welcoming, and inclusive atmosphere when participating in this project.

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
To run tests in watch mode:
```bash
npm run test:watch
```

### Building the Project
CYP uses [Vite](https://vitejs.dev/) to produce ESM, CJS, and UMD bundles:
```bash
npm run build
```
Build outputs are placed in `dist/`.

### Building the Interactive Showcase / Demo
To test demo builds:
```bash
npm run build:demo
```
Outputs are compiled to `demo-dist/`.

---

## Architectural Principles & Rules

When submitting contributions, please keep these non-negotiable architectural rules in mind:

1. **Zero Runtime Dependencies**: The core player bundle must remain zero-dependency. Do not introduce mandatory third-party npm packages.
2. **Technical Honesty**: Never misrepresent client-side Base64 obfuscation or DOM hiding as encryption, authorization, or DRM. See [`SECURITY.md`](SECURITY.md).
3. **YouTube Policy Adherence**: Never attempt to block, hide, bypass, or manipulate YouTube ads, tracking, or standard player controls. Overlays must not interfere with native YouTube functionality.
4. **WCAG 2.2 AA Accessibility**: Controls, sliders, and interactive overlays must support keyboard navigation (`Tab`, `Space`, `Enter`, arrow keys), clear focus states, and appropriate ARIA attributes.
5. **Universal API Consistency**: New features must work predictably across both HTML5 and YouTube backends, or document supported capabilities explicitly.
6. **Tests Required**: Every bug fix and new feature must include automated regression tests in `tests/`.

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
