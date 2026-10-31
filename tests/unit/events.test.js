import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../../src/core/events.js';

describe('EventEmitter', () => {
  it('registers and emits listeners', () => {
    const emitter = new EventEmitter();
    const fn = vi.fn();

    emitter.on('test', fn);
    emitter.emit('test', 'hello', 123);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('hello', 123);
  });

  it('unsubscribes with returned function or off()', () => {
    const emitter = new EventEmitter();
    const fn = vi.fn();

    const unsub = emitter.on('test', fn);
    unsub();
    emitter.emit('test');
    expect(fn).not.toHaveBeenCalled();

    emitter.on('test', fn);
    emitter.off('test', fn);
    emitter.emit('test');
    expect(fn).not.toHaveBeenCalled();
  });

  it('executes once() only once', () => {
    const emitter = new EventEmitter();
    const fn = vi.fn();

    emitter.once('single', fn);
    emitter.emit('single', 1);
    emitter.emit('single', 2);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });
});

