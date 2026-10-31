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

