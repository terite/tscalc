import { debounce, relativeTime } from './util';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it('should call after expiration time', () => {
    const fn = jest.fn((...args: any[]) => 'ret');
    const deb = debounce(fn, 20);

    expect(fn).not.toHaveBeenCalled();

    expect(deb('hello', 'world')).toBeUndefined();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(10);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('hello', 'world');
  });

  it('should be cancelable', () => {
    const fn = jest.fn((...args: any[]) => {});
    const deb = debounce(fn, 20);

    expect(deb('hello', 'world')).toBeUndefined();

    jest.advanceTimersByTime(10);
    deb.cancel();

    jest.advanceTimersByTime(10);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should reset the timer after subsequent calls', () => {
    const fn = jest.fn((...args: any[]) => {});
    const deb = debounce(fn, 20);

    expect(deb('hello', 'world')).toBeUndefined();

    jest.advanceTimersByTime(10);
    expect(deb('goodnight', 'moon')).toBeUndefined();

    jest.advanceTimersByTime(10);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('goodnight', 'moon');
  });
});

describe.only('relativeTime', () => {
  it('should support seconds in the past (singular)', () => {
    const oneSecondAgo = new Date(Date.now() - 1000);
    const rt = relativeTime(oneSecondAgo);
    expect(rt[0]).toBe('1 second ago');
    expect(rt[1]).toBe(1000);
  });

  it('should support seconds in the past (plural)', () => {
    const eightSecondsAgo = new Date(Date.now() - 8000);
    const rt = relativeTime(eightSecondsAgo);
    expect(rt[0]).toBe('8 seconds ago');
    expect(rt[1]).toBe(1000);
  });

  it('should support seconds in the future', () => {
    const eightSecondsFromNow = new Date(Date.now() + 8000);
    const rt = relativeTime(eightSecondsFromNow);
    expect(rt[0]).toBe('8 seconds from now');
    expect(rt[1]).toBe(1000);
  });

  it('should support minutes in the past', () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const rt = relativeTime(oneMinuteAgo);
    expect(rt[0]).toBe('1 minute ago');
    expect(rt[1]).toBe(60 * 1000);
  });

  it('should support minutes in the past (plural)', () => {
    const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000);
    const rt = relativeTime(eightMinutesAgo);
    expect(rt[0]).toBe('8 minutes ago');
    expect(rt[1]).toBe(60 * 1000);
  });

  it('should support partial minutes in the past', () => {
    // 3m 20s ago -- 40s until 4 minutes ago
    const twoHundredSecondsAgo = new Date(Date.now() - 200 * 1000);
    const rt = relativeTime(twoHundredSecondsAgo);
    expect(rt[0]).toBe('3 minutes ago');
    expect(rt[1]).toBe(40 * 1000);
  });
});
