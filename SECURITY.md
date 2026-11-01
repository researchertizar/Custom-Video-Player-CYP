# Security Policy & Architecture

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Custom Video Player (CYP), please do **NOT** open a public issue on GitHub. Instead, report it privately to the maintainers:

- **Security Contact**: Maintainers via GitHub Security Advisories or email `ahayas.contact@gmail.com`
- **Response Timeline**: Acknowledgement within 48 hours, status updates within 7 days.
- **Coordinated Disclosure**: We follow coordinated vulnerability disclosure practices to ensure patches are released before technical details are published.

---

## Security Architecture & Threat Model

### 1. Honest Content Protection Realism

A core principle of CYP is technical honesty regarding content protection:

> [!IMPORTANT]
> **Client-Side Obfuscation vs. Content Security**
>
> Client-side mechanisms such as Base64 encoding (`b64:...`), DOM element hiding, and disabling context menus represent **casual exposure reduction** only. They prevent direct raw URLs from appearing in raw page source markup to casual visitors.
>
> They do **not** constitute encryption, access authorization, or DRM. Any media URL or stream loaded by the browser can be observed in the browser developer tools (Network tab) and media pipeline.

```
+-------------------------------------------------------------------------------+
|                       CONTENT PROTECTION ARCHITECTURE                         |
+-------------------------------------------------------------------------------+
| Casual Obfuscation (CYP)   | Reduces immediate visual exposure in HTML DOM    |
| Authentication             | Verifies user identity via session / JWT         |
| Authorization              | Verifies permissions on your backend server      |
| Signed URLs / Tokens       | Time-limited access signed by your media origin  |
| DRM (Widevine / FairPlay)  | Encrypted content keys requiring hardware decoders|
+-------------------------------------------------------------------------------+
```

### 2. Recommended Production Architecture for Protected Media

For applications offering paid, gated, or proprietary video content (e.g., LMS courses, member portals, premium media):

1. **Authentication**: The user logs in to your web application via your standard authentication system (OAuth, JWT, session cookie).
2. **Backend Authorization Gate**: When the user requests a lesson or video, your application backend checks whether the user has active subscription or access rights.
3. **Signed Token / Expiring URL**: Your backend generates a short-lived signed media URL (e.g., CloudFront Signed URL, Google Cloud CDN Signed Cookie, Cloudflare Stream signed token, or AWS S3 presigned URL with a 15–60 minute TTL).
4. **Playback Session**: CYP loads the temporary signed URL.
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
- Link attributes (`href`, `xlink:href`, `src`) are validated to ensure only safe protocols (`http`, `https`, `blob`, `data:image`) or local anchor fragments (`#icon-id`) are retained. Dangerous schemes (`javascript:`, `vbscript:`, `data:text/html`) are stripped.
- Any document with XML parser errors or non-`<svg>` root tags is safely rejected.

### 2. URL Protocol Sanitization (`sanitizeUrl`)
All poster image links, video sources, and anchor destinations pass through protocol filtering:
- Allowed protocols: `https://`, `http://`, `blob:`, `data:image/`, and safe relative paths (`/`, `./`, `../`, `#`).
- Blocked protocols: `javascript:`, `vbscript:`, `data:text/html`, `data:application/`. Control characters (`\x00-\x1f`) are stripped prior to verification.

### 3. Safe Dynamic Text Escaping (`escapeHtml`)
Dynamic video titles, chapter names, and tooltip strings are escaped against HTML entity injection before DOM insertion.

---

## YouTube API & Developer Policy Compliance

CYP strictly adheres to the [YouTube Developer Terms of Service and Policies](https://developers.google.com/youtube/terms/developer-policies):

- **No Advertisement Manipulation**: CYP does **not** hide, block, bypass, or alter YouTube video advertisements. Undocumented ad-detection hooks are prohibited.
- **Pointer Events & Overlays**: When playing YouTube sources (`provider-youtube`), pointer events pass directly through to the YouTube iframe, ensuring users can interact with native controls, ad skip buttons, sponsor links, and channel branding.
- **Permitted Context Menus**: Context menu interception is opt-in via explicit configuration (`preventContextMenu: true`, default `false`), preserving standard browser and player context menus by default.
- **Supported APIs Only**: All interactions are driven via the official YouTube IFrame Player API.
