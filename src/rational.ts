import {assert} from "./util";

function num_gcd(a: number, b: number): number {
    return (!b) ? a : num_gcd(b, a % b);
}

function num_divmod(a: number, b: number) {
    assert(Number.isSafeInteger(a));
    assert(Number.isSafeInteger(b));

    return {
        quotient: Math.floor(a / b),
        remainder: a % b
    }
}

export class Rational {
    p: number;
    q: number;

    constructor(p: number, q: number) {
        assert(Number.isSafeInteger(p));
        assert(Number.isSafeInteger(q));

        if (q < 0) {
            p = -p;
            q = -q;
        }

        if (p == 0) {
            q = 1;
        }

        const div = num_gcd(p, q)
        if (div > 1) {
            p = p / div
            q = q / div
        }
        this.p = p;
        this.q = q;
    }

    //
    // Operations returning Rational
    //
    floor() {
        const divmod = num_divmod(this.p, this.q)
        let result = new Rational(divmod.quotient, 1)
        if (result.less(Rational.zero) && divmod.remainder != 0) {
            result = result.sub(Rational.one)
        }
        return result
    }

    negate() {
        return new Rational(-this.p, this.q);
    }

    add(other: Rational) {
        return new Rational(
            (this.p * other.q) + (this.q * other.p),
            this.q * other.q
        )
    }

    sub(other: Rational) {
        return new Rational(
            (this.p * other.q) - (this.q * other.p),
            this.q * other.q
        )
    }

    mul(other: Rational | number): Rational {
        if (typeof other == 'number') {
            other = Rational.fromFloat(other)
        }
        return new Rational(this.p * other.p, this.q * other.q)
    }

    div(other: Rational) {
        return new Rational(this.p * other.q, this.q * other.p);
    }

    //
    // Operations NOT returning Rational
    //
    divmod(other: Rational) {
        var quotient = this.div(other)
        var div = quotient.floor()
        var mod = this.sub(other.mul(div))
        return {quotient: div, remainder: mod}
    }

    equal(other: Rational) {
        return this.p == other.p && this.q == other.q
    }

    isOne() {
        return this.p == 1
    }

    isZero() {
        return this.p == 0
    }

    less(other: Rational) {
        return (this.p * other.q) < (this.q * other.p)
    }

    toFloat() {
        return this.p / this.q
    }

    toString() {
        if (this.q == 1) {
            return this.p.toString()
        }
        return this.p.toString() + "/" + this.q.toString()
    }

    //
    // Statics
    //
    static fromFloat(num: number) {
        if (Number.isInteger(num)) {
            return new this(num, 1);
        }

        // Sufficient precision for our data?
        var r = new Rational(Math.round(num * 10000), 10000)
        // Recognize 1/3 and 2/3 explicitly.
        var divmod = r.divmod(Rational.one)
        if (divmod.remainder.equal(_one_third)) {
            return divmod.quotient.add(Rational.oneThird)
        } else if (divmod.remainder.equal(_two_thirds)) {
            return divmod.quotient.add(Rational.twoThirds)
        }
        return r
    }
    static fromInts(p: number, q: number) {
        return new this(p, q);
    }

    static zero = new Rational(0, 1);
    static one = new Rational(1, 1);
    static oneThird = new Rational(1, 3);
    static twoThirds = new Rational(2, 3);

}

// Decimal approximations.
const _one_third = new Rational(3333, 10000)
const _two_thirds = new Rational(3333, 5000)

