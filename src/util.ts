export function assert(check: any, message?: string): void {
    if (!check) {
        throw new Error(message || "Assertion failed")
    }
}

export function values<T>(obj: { [s: string]: T }): T[] {
    const values = []
    for (let key in obj) {
        values.push(obj[key])
    }
    return values
}

export function nbsp(input: string) {
    return input.replace(/ /g, "\u00A0")
}

export function clone<T>(orig: T): T {
    return Object.assign( Object.create( Object.getPrototypeOf(orig)), orig)
}


const isArray = Array.isArray;
const keyList = Object.keys;
const hasProp = Object.prototype.hasOwnProperty;

export function deepEqual(a: any, b: any) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray(a)
      , arrB = isArray(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!deepEqual(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return a!==a && b!==b;
};

type Resetable<F> = F & { reset(): void }

// export function debounce<U extends any[]>(delay: number, fn: (...args: U) => any): (...args: U) => void {
export function debounce
<F extends (...args: any[]) => void>
(delay: number, fn: F): Resetable<F>{
    let timeoutId: any = null

    let debounced = (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            fn(...args)
        }, delay)
    }

    (debounced as Resetable<F>).reset = () => {
        clearTimeout(timeoutId)
        timeoutId = null
    }

    return debounced as Resetable<F>
}



type RateLimitReturn<U extends any[]> = {
    (...args: U): void
    reset(): void
}

/**
 * Wrap a function so that it can only be called once per X milliseconds
 */
export function rateLimit
<U extends any[]>
(rate: number, maxGrace: number, fn: (...args: U) => any): RateLimitReturn<U>{
    assert(rate > 0)
    assert(maxGrace > 0)
    let intervalId: any = null
    let grace = maxGrace

    let hasNextArgs = false
    let nextArgs: U|null = null

    const tick = () => {
        if (hasNextArgs) {
            let args = nextArgs
            hasNextArgs = false
            nextArgs = null
            fn(...args!)
        } else if (grace < maxGrace) {
            grace++
        } else {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    const limitedFn = (...args: U) => {
        if (grace > 0) {
            grace--
            fn(...args)

            if (!intervalId) {
                setInterval(tick, rate)
            }
        } else {
            nextArgs = args
            hasNextArgs = true
        }
    }

    (limitedFn as RateLimitReturn<U>).reset = () => {
        clearInterval(intervalId)
        intervalId = null
        grace = maxGrace
        hasNextArgs = false
        nextArgs = null
    }

    return limitedFn as RateLimitReturn<U>
}

type Primitive = undefined | null | boolean | string | number | Function

export type DeepReadonly<T> =
  T extends Primitive ? T :
    T extends Array<infer U> ? DeepReadonlyArray<U> :
      T extends Map<infer K, infer V> ? DeepReadonlyMap<K, V> : DeepReadonlyObject<T>

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
interface DeepReadonlyMap<K, V> extends ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> {}
type DeepReadonlyObject<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>
}

export function round2(num: number, places: number) {
    const mag = Math.pow(10, places)
    return Math.round(num * mag) / mag
}
