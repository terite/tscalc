import { Rational } from './rational';

function expectToEqualRational(actual: Rational, expected: Rational) {
    return expect(actual.toFraction()).toEqual(expected.toFraction());
}

describe('Rational', () => {
    describe('.fromFloat', () => {
        it.each([
            [1, 1],
            [1, 2],
            [1, 3],
            [2, 3],
            [3, 2],
            [1, 8],
            [4, 3],
            [5, 3],
            [6, 8],
        ])('should support %s/%s', (p, q) => {
            const actual = Rational.fromFloat(p / q);
            const expected = Rational.fromInts(p, q);
            expectToEqualRational(actual, expected);
        });

        it('should accurately represent many nums', () => {
            for (let p = 1; p < 10; p++) {
                for (let q = 1; q < 10; q++) {
                    if (p == q) {
                        continue;
                    }
                    expect(Rational.fromInts(p, q).equal(Rational.fromFloat(p / q))).toBe(true);
                }
            }
        });
    });
    describe('.fromString', () => {
        it.each<[string, number,number]>([
            ['1', 1, 1],
            ['0.1', 1, 10],
            ['1.5', 3, 2],
            ['0.3333', 1, 3],
        ])('should convert %s to %i/%i', (str, p, q) => {
            const actual = Rational.fromString(str);
            const expected = Rational.fromInts(p, q);
            expect(actual).toEqual(expected);
        });

        it('should not support floats when it sees a divison symbol', () => {
            expect(() => {
                Rational.fromString('1.5 / 2');
            }).toThrowError('Numerator must be an integer');
        });
    });

    describe('constructor', () => {
        it.each([
            [1.5, 1],
            [1, 1.5],
            [NaN, 1],
            [1, NaN],
            [Number.MAX_SAFE_INTEGER + 1, 1],
        ])('should reject invalid input (%s, %s)', (p, q) => {
            expect(() => {
                new Rational(p, q);
            }).toThrowError('must be an integer');
        });

        it('should not allow division by zero', () => {
            expect(() => {
                new Rational(1, 0);
            }).toThrowError('Denominator must not be zero');
        });
    });
})
