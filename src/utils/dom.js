/**
 * Native DOM helper utilities.
 */

/**
 * Creates a DOM element with specified properties and attributes.
 * @param {string} tag
 * @param {object} [options]
 * @param {string} [options.className]
 * @param {object} [options.attributes]
 * @param {string} [options.textContent]
 * @param {string} [options.innerHTML] - Caution: must be pre-sanitized or internal SVGs only.
 * @param {Array<HTMLElement>} [options.children]
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.className) {
    el.className = options.className;
  }

  if (options.attributes) {
    for (const [key, val] of Object.entries(options.attributes)) {
      if (val !== null && val !== undefined) {
        el.setAttribute(key, String(val));
      }
    }
  }

  if (options.textContent !== undefined) {
    el.textContent = options.textContent;
  } else if (options.innerHTML !== undefined) {
    el.innerHTML = options.innerHTML;
  }

  if (Array.isArray(options.children)) {
    for (const child of options.children) {
      if (child instanceof Node) {
        el.appendChild(child);
      }
    }
  }

  return el;
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Safe text escaping for dynamic titles.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes URLs to prevent javascript: or data: XSS injection.
 * Only allows safe protocols (http, https, blob, data:image) and relative URLs.
 * @param {string} url
 * @returns {string} Safe URL string or empty string if unsafe.
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Strip control characters
  const clean = trimmed.replace(/[\x00-\x1f\x7f-\x9f]/g, '');

  // Check against dangerous protocols
  const lower = clean.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('data:application/')
  ) {
    return '';
  }

  // Safe schemes and relative paths
  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('blob:') ||
    lower.startsWith('data:image/') ||
    clean.startsWith('/') ||
    clean.startsWith('./') ||
    clean.startsWith('../') ||
    clean.startsWith('#')
  ) {
    return clean;
  }

  return '';
}


