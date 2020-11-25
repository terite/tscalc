import { useEffect, useState } from 'react';

export function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

export function mapValues<T, V>(
  obj: { [s: string]: T },
  fn: (v: T) => V
): { [s: string]: V } {
  let ret: { [key: string]: V } = {};
  for (const [key, value] of Object.entries(obj)) {
    ret[key] = fn(value);
  }
  return ret;
}

export function clone<T>(orig: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig);
}

export function round2(num: number, places: number): number {
  const mag = Math.pow(10, places);
  return Math.round(num * mag) / mag;
}

export function format_magnitude(amount: number, suffixes: string[]): string {
  let i = 0;
  for (; i < suffixes.length; i++) {
    if (amount >= 1000) {
      amount = amount / 1000;
    } else {
      break;
    }
  }

  return `${round2(amount, 2)} ${suffixes[i]}`;
}

export function format_watts(watts: number): string {
  return format_magnitude(watts, ['W', 'kW', 'MW', 'GW', 'TW', 'PW']);
}

export function format_joules(joules: number): string {
  return format_magnitude(joules, ['J', 'kJ', 'MJ', 'GJ', 'TJ', 'PJ']);
}

interface Func<T extends any[]> {
  (...args: T): void;
}

interface DebouncedFunc<T extends any[]> extends Func<T> {
  cancel(): void;
}

export function debounce<T extends any[]>(
  fn: Func<T>,
  ms: number
): DebouncedFunc<T> {
  let pendingId: number | undefined;

  function debounced(...args: T): void {
    if (pendingId !== undefined) {
      clearTimeout(pendingId);
    }
    pendingId = setTimeout(() => {
      pendingId = undefined;
      fn(...args);
    }, ms);
  }

  function cancel(): void {
    if (pendingId !== undefined) {
      clearTimeout(pendingId);
      pendingId = undefined;
    }
  }

  Object.defineProperty(debounced, 'cancel', {
    value: cancel,
  });

  return debounced as DebouncedFunc<T>;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function relativeTime(when: Date): [string, number] {
  const whenUnix = when.valueOf();
  const nowUnix = Date.now();
  const suffix = nowUnix > whenUnix ? 'ago' : 'from now';

  const secDiff = Math.floor(Math.abs(nowUnix - whenUnix) / 1000);
  if (secDiff >= 60) {
    const minDiff = Math.floor(secDiff / 60);
    const unit = minDiff === 1 ? 'minute' : 'minutes';
    const changeTime = (60 - (secDiff % 60)) * 1000;
    return [`${minDiff} ${unit} ${suffix}`, changeTime];
  } else {
    const unit = secDiff === 1 ? 'second' : 'seconds';
    return [`${secDiff} ${unit} ${suffix}`, 1000];
  }
}

export function useRelativeTime(when: Date): string {
  const [reltime, change] = relativeTime(when);

  const [renderInc, setRenderInc] = useState(0);
  void renderInc;

  useEffect(() => {
    const tId = setInterval(() => {
      // Force re-render?
      setRenderInc((r) => r + 1);
    }, change);

    return () => {
      clearInterval(tId);
    };
  }, [change]);

  return reltime;
}
