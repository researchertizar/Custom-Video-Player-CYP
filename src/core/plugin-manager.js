/**
 * Plugin lifecycle manager.
 */

export class PluginManager {
  /**
   * @param {import('./player.js').Player} player
   */
  constructor(player) {
    this._player = player;
    /** @type {Map<string, object>} */
    this._plugins = new Map();
  }

  /**
   * Installs and registers a plugin.
   * @param {object|Function} pluginDefinition - Plugin instance or factory function.
   * @returns {import('./player.js').Player}
   */
  use(pluginDefinition) {
    const plugin = typeof pluginDefinition === 'function' ? pluginDefinition() : pluginDefinition;

    if (!plugin || typeof plugin !== 'object') {
      throw new TypeError('[PluginManager] Plugin must be an object or factory returning an object');
    }

    const name = plugin.name;
    if (!name || typeof name !== 'string') {
      throw new Error('[PluginManager] Plugin must have a valid string "name"');
    }

    if (this._plugins.has(name)) {
      console.warn(`[PluginManager] Plugin "${name}" is already registered. Skipping.`);
      return this._player;
    }

    if (typeof plugin.install === 'function') {
      plugin.install(this._player);
    }

    this._plugins.set(name, plugin);
    return this._player;
  }

  /**
   * Check if a plugin is registered.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._plugins.has(name);
  }

  /**
   * Retrieves a registered plugin instance.
   * @param {string} name
   * @returns {object|undefined}
   */
  get(name) {
    return this._plugins.get(name);
  }

  /**
   * Destroys and cleans up all registered plugins.
   */
  destroy() {
    for (const [name, plugin] of this._plugins.entries()) {
      if (typeof plugin.destroy === 'function') {
        try {
          plugin.destroy();
        } catch (err) {
          console.error(`[PluginManager] Error destroying plugin "${name}":`, err);
        }
      }
    }
    this._plugins.clear();
  }
}

