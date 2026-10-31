import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../../src/core/events.js';
import { StateManager, PlaybackStatus } from '../../src/core/state.js';

describe('StateManager', () => {
  it('initializes with default state', () => {
    const emitter = new EventEmitter();
    const state = new StateManager(emitter);

    expect(state.getField('status')).toBe(PlaybackStatus.IDLE);
    expect(state.getField('volume')).toBe(100);
    expect(state.getField('muted')).toBe(false);
  });

  it('clamps volume between 0 and 100', () => {
    const emitter = new EventEmitter();
    const state = new StateManager(emitter);

    state.set({ volume: 150 });
    expect(state.getField('volume')).toBe(100);

    state.set({ volume: -20 });
    expect(state.getField('volume')).toBe(0);
  });

  it('emits statechange and granular change:key events', () => {
    const emitter = new EventEmitter();
    const state = new StateManager(emitter);
    const changeHandler = vi.fn();
    const volumeHandler = vi.fn();

    emitter.on('statechange', changeHandler);
    emitter.on('change:volume', volumeHandler);

    state.set({ volume: 75 });

    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(volumeHandler).toHaveBeenCalledWith(75, 100);
  });
});

