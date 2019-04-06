export function assert(check: any, message?: string): void {
    if (!check) {
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
    for (let key in obj) {
        ret[key] = fn(obj[key]);
    }
    return ret;
}

export function values<T>(obj: { [s: string]: T }): T[] {
    const values = [];
    for (let key in obj) {
        values.push(obj[key]);
    }
    return values;
}

export function clone<T>(orig: T): T {
    return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig);
}

export function round2(num: number, places: number) {
    const mag = Math.pow(10, places);
    return Math.round(num * mag) / mag;
}
