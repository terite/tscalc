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
