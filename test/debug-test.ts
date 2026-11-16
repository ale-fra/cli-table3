import * as debug from '../dist/debug';

describe('debug', () => {
  const collector = (level: number): debug.DebugCollector => ({ level, messages: [] });

  it('records nothing outside of collect()', () => {
    const c = collector(debug.DEBUG);
    debug.warn('lost');
    debug.collect(c, () => debug.warn('kept'));
    debug.warn('lost too');

    expect(c.messages).toEqual(['kept']);
  });

  it.each([
    [0, []],
    [debug.WARN, ['w']],
    [debug.INFO, ['w', 'i']],
    [debug.DEBUG, ['w', 'i', 'd']],
  ])('level %i records messages up to that level', (level, expected) => {
    const c = collector(level);
    debug.collect(c, () => {
      debug.warn('w');
      debug.info('i');
      debug.debug('d');
    });

    expect(c.messages).toEqual(expected);
  });

  it('returns the result of the function', () => {
    expect(debug.collect(collector(debug.WARN), () => 42)).toBe(42);
  });

  it('restores the previous collector after a nested collect()', () => {
    const outer = collector(debug.WARN);
    const inner = collector(debug.WARN);
    debug.collect(outer, () => {
      debug.warn('outer 1');
      debug.collect(inner, () => debug.warn('inner'));
      debug.warn('outer 2');
    });

    expect(outer.messages).toEqual(['outer 1', 'outer 2']);
    expect(inner.messages).toEqual(['inner']);
  });

  it('restores the previous collector when the function throws', () => {
    const outer = collector(debug.WARN);
    debug.collect(outer, () => {
      expect(() =>
        debug.collect(collector(debug.WARN), () => {
          throw new Error('boom');
        })
      ).toThrow('boom');
      debug.warn('after');
    });

    expect(outer.messages).toEqual(['after']);
  });
});
