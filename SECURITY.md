# Security Policy & Architecture

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## Reporting a Vulnerability

If you discover a security vulnerability or security concern in Custom Video Player (CYP), please do **NOT** open a public issue on GitHub. Instead, report it privately to the maintainers:

- **Security Contact**: Maintainers via GitHub Security Advisories or direct email: `ahayas.contact@gmail.com`
- **Response Timeline**: Acknowledgement within 48 hours, technical evaluation within 7 days.
- **Coordinated Disclosure**: We follow coordinated vulnerability disclosure practices to ensure patches and advisories are released before technical details are published.

---

## Security Architecture & Threat Model

### 1. Honest Content Protection Realism

A foundational architectural requirement of CYP is technical transparency and honesty regarding media security:

> [!IMPORTANT]
> **Client-Side Obfuscation vs. Content Protection**
>
> Client-side mechanisms such as Base64 encoding (`b64:...`), DOM element hiding, and disabling context menus represent **casual exposure reduction** only. They prevent direct raw media URLs from appearing in raw page source markup to casual visitors.
>
> They do **not** constitute encryption, access authorization, or Digital Rights Management (DRM). Any media URL or stream loaded by the browser can be observed in browser developer tools (Network tab) and media pipeline decoders. Real media protection requires backend authorization gates and expiring signed URLs.

```
+-----------------------------------------------------------------------------------+
|                        CONTENT SECURITY HIERARCHY                                 |
+-----------------------------------------------------------------------------------+
| Casual Obfuscation (CYP)   | Prevents raw URLs from appearing in client DOM source |
| Authentication             | Verifies user identity via session / JWT             |
| Authorization              | Validates entitlement permissions on backend server  |
| Signed URLs / Tokens       | Time-limited access signed by media origin (HMAC)    |
| Commercial DRM             | Hardware-level decryption (Widevine / FairPlay)      |
+-----------------------------------------------------------------------------------+
```

### 2. Recommended Production Architecture for Protected Media

For applications offering paid, gated, or proprietary video content (e.g., LMS platforms, subscription portals, enterprise training):

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

1. **Authentication**: The user logs in to your web application via your standard authentication system (OAuth 2.0, JWT, session cookie).
2. **Backend Authorization Gate**: When the user requests a lesson or video, your application backend checks whether the user has active subscription or access rights.
3. **Signed Token / Expiring URL**: Your backend generates a short-lived signed media URL (e.g., CloudFront Signed URL, Google Cloud CDN Signed Cookie, Cloudflare Stream signed token, or AWS S3 presigned URL with a 15–60 minute TTL).
4. **Playback Session**: CYP loads the temporary signed URL via `player.load(signedUrl)`.
5. **Session Expiry**: When the token expires, subsequent segment or manifest requests from unauthorized parties fail.
6. **Commercial DRM**: For studio content or anti-rip compliance, use native DRM packaging (CENC / Widevine / FairPlay / PlayReady) with standard license server endpoints.

CYP integrates seamlessly with any backend signed URL architecture by accepting dynamic video targets via `player.load(signedUrl)`.

---

## DOM & Input Security

CYP implements defense-in-depth sanitization on all user-supplied inputs and configurations:

### 1. SVG Logo & Watermark Sanitization (`sanitizeSvg`)
Watermark overlays and logo components accept SVG strings or URLs. To prevent DOM Cross-Site Scripting (XSS):
- Markup is parsed strictly with XML `DOMParser` (`image/svg+xml`).
- Forbidden elements are stripped: `<script>`, `<foreignObject>`, `<animate>`, `<set>`, `<handler>`, `<discard>`, `<listener>`, `<object>`, `<embed>`, `<iframe>`, `<audio>`, `<video>`.
- All inline event attributes (`onclick`, `onload`, `onerror`, `on*`) are unconditionally stripped.
- Link attributes (`href`, `xlink:href`, `src`) are validated to ensure only safe protocols (`http`, `https`, `blob`, `data:image`) or local anchor fragments (`#icon-id`) are retained. Dangerous schemes (`javascript:`, `vbscript:`, `data:text/html`) are neutralized.
- Any document with XML parser errors or non-`<svg>` root tags is safely rejected.

### 2. URL Protocol Sanitization (`sanitizeUrl`)
All poster image links, video sources, and anchor destinations pass through strict protocol filtering:
- **Allowed protocols**: `https://`, `http://`, `blob:`, `data:image/`, and safe relative paths (`/`, `./`, `../`, `#`).
- **Blocked protocols**: `javascript:`, `vbscript:`, `data:text/html`, `data:application/`. Control characters (`\x00-\x1f`) are stripped prior to verification.

### 3. Safe Dynamic Text Escaping (`escapeHtml`)
Dynamic video titles, chapter names, and tooltip strings are escaped against HTML entity injection before DOM insertion.

### 4. Token Recursion Guard (`maxDepth`)
The Base64 stream token parser enforces a strict recursion depth limit (`depth <= 3`). This neutralizes recursive or cyclic token payloads designed to trigger stack-overflow Denial of Service (DoS) attacks.

---

## YouTube API & Platform Policy Compliance

CYP is designed to operate in full accordance with platform guidelines:

- **Dual-Mode Interaction**:
  - `mode: 'enhanced'` (Default): Provides a custom, high-contrast, distraction-free control layer over the video container while automatically passing pointer events to native YouTube ad controls when video ads stream.
  - `mode: 'compliant'`: Enforces direct, unintercepted pointer-events pass-through to the underlying iframe, fully aligning with strict third-party embedding policies.
- **Official APIs Only**: YouTube streams are loaded exclusively via the official YouTube IFrame Player API. Undocumented private methods or internal ad-sniffing hooks are prohibited.
- **Graceful Embedding Fallback**: If a content creator disables embedding (Error 150/101), CYP displays a polite explanation and provides an accessible, 1-click **"Watch on YouTube ↗"** external link.
