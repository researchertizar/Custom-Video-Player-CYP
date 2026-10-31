/**
 * Lightweight, zero-dependency Event Emitter.
 */

export class EventEmitter {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} listener
   * @returns {() => void} Unsubscribe function.
   */
  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }

    this._listeners.get(event).add(listener);

    return () => this.off(event, listener);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this._listeners.delete(event);
      }
    }
  }

  /**
   * Subscribe to an event once.
   * @param {string} event
   * @param {Function} listener
   * @returns {() => void}
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Emit an event to all subscribers.
   * @param {string} event
   * @param {...any} args
   */
  emit(event, ...args) {
    const listeners = this._listeners.get(event);
    if (!listeners || listeners.size === 0) return;

    // Clone to prevent mutation issues during emission
    for (const listener of Array.from(listeners)) {
      try {
        listener.apply(this, args);
      } catch (err) {
        console.error(`[EventEmitter] Error in listener for event "${event}":`, err);
      }
    }
  }

  /**
   * Removes all listeners for a given event, or all listeners if no event provided.
   * @param {string} [event]
   */
  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }
}

