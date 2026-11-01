/**
 * Dynamic Provider Registry supporting the Open/Closed Principle.
 * Allows core and third-party plugins to register and resolve media engines.
 */

export class ProviderRegistry {
  /** @type {Map<string, typeof import('./provider.js').Provider>} */
  static _registry = new Map();

  /**
   * Registers a provider class for a given media source type.
   * @param {string} type - Identifier (e.g. 'youtube', 'html5', 'hls')
   * @param {typeof import('./provider.js').Provider} ProviderClass
   */
  static register(type, ProviderClass) {
    if (!type || typeof type !== 'string') {
      throw new TypeError('[ProviderRegistry] Provider type must be a non-empty string.');
    }
    if (typeof ProviderClass !== 'function') {
      throw new TypeError('[ProviderRegistry] ProviderClass must be a constructor function.');
    }
    this._registry.set(type.toLowerCase(), ProviderClass);
  }

  /**
   * Retrieves registered provider class by type.
   * @param {string} type
   * @returns {typeof import('./provider.js').Provider|undefined}
   */
  static get(type) {
    if (!type || typeof type !== 'string') return undefined;
    return this._registry.get(type.toLowerCase());
  }

  /**
   * Checks if a provider type is registered.
   * @param {string} type
   * @returns {boolean}
   */
  static has(type) {
    if (!type || typeof type !== 'string') return false;
    return this._registry.has(type.toLowerCase());
  }

  /**
   * Returns list of all registered provider types.
   * @returns {string[]}
   */
  static getSupportedTypes() {
    return Array.from(this._registry.keys());
  }

  /**
   * Clears all custom providers, preserving default built-ins if provided.
   */
  static reset() {
    this._registry.clear();
  }
}
