export function assert(check: any, message?: string): void {
    if (!check) {
        throw new Error(message || "Assertion failed")
    }
}
