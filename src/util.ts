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



export function debounce<U extends any[]>(delay: number, fn: (...args: U) => any): (...args: U) => void {
    let timeoutId: any = null

    return (...args: U) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}
