import { debounce } from './util';

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
