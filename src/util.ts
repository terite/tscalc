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
  for (const key in obj) {
    ret[key] = fn(obj[key]);
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
