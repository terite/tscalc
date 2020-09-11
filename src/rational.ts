import { assert } from './util';

function num_gcd(a: number, b: number): number {
  return !b ? a : num_gcd(b, a % b);
}

function num_divmod(a: number, b: number): {
  quotient: number,
  remainder: number,
} {
  assert(Number.isSafeInteger(a));
  assert(Number.isSafeInteger(b));

  return {
    quotient: Math.floor(a / b),
    remainder: a % b,
  };
}

const FLOAT_CONVERT_PRECISION = 10000;

export class Rational {
  p: number;
  q: number;

  constructor(p: number, q: number) {
    assert(
      Number.isSafeInteger(p),
      `Numerator must be a safe integer, got ${p}`
    );
    assert(
      Number.isSafeInteger(q),
      `Denominator must be a safe integer, got ${q}`
    );
    assert(q !== 0, 'Denominator must not be zero');

    if (q < 0) {
      p = -p;
      q = -q;
    }

    if (p === 0) {
      q = 1;
    }

    const div = num_gcd(p, q);
    if (div > 1) {
      p = p / div;
      q = q / div;
    }
    this.p = p;
    this.q = q;
  }

  //
  // Operations returning Rational
  //
  floor(): Rational {
    const divmod = num_divmod(this.p, this.q);
    let result = new Rational(divmod.quotient, 1);
    if (result.less(Rational.zero) && divmod.remainder !== 0) {
      result = result.sub(Rational.one);
    }
    return result;
  }

  negate(): Rational {
    return new Rational(-this.p, this.q);
  }

  invert(): Rational {
    return new Rational(this.q, this.p);
  }

  add(other: Rational): Rational {
    return new Rational(this.p * other.q + this.q * other.p, this.q * other.q);
  }

  sub(other: Rational): Rational {
    return new Rational(this.p * other.q - this.q * other.p, this.q * other.q);
  }

  mul(other: Rational | number): Rational {
    if (typeof other == 'number') {
      other = Rational.fromFloat(other);
    }
    return new Rational(this.p * other.p, this.q * other.q);
  }

  div(other: Rational): Rational {
    return new Rational(this.p * other.q, this.q * other.p);
  }

  clamp(min: Rational | number, max: Rational | number): Rational {
    if (typeof min == 'number') {
      min = Rational.fromFloat(min);
    }
    if (typeof max == 'number') {
      max = Rational.fromFloat(max);
    }

    if (this.less(min)) return min;
    if (max.less(this)) return max;
    return this;
  }

  //
  // Operations NOT returning Rational
  //
  divmod(other: Rational): { quotient: Rational; remainder: Rational } {
    var quotient = this.div(other);
    var div = quotient.floor();
    var mod = this.sub(other.mul(div));
    return { quotient: div, remainder: mod };
  }

  equal(other: Rational): boolean {
    return this.p === other.p && this.q === other.q;
  }

  isNegative(): boolean {
    return this.p < 0;
  }
  isPositive(): boolean {
    return this.p > 0;
  }

  isOne(): boolean {
    return this.p === 1;
  }

  isZero(): boolean {
    return this.p === 0;
  }

  less(other: Rational): boolean {
    return this.p * other.q < this.q * other.p;
  }

  toFloat(): number {
    return this.p / this.q;
  }

  toString(): string {
    // TODO: smarter to string
    return this.toFraction();
  }

  toFraction(): string {
    if (this.q === 1) {
      return this.p.toString();
    }
    return this.p.toString() + '/' + this.q.toString();
  }

  toDecimal(maxDigits?: number, roundingFactor?: Rational): string {
    if (maxDigits == null) {
      maxDigits = 3;
    }
    if (roundingFactor == null) {
      roundingFactor = new Rational(5, 10 ** (maxDigits + 1));
    }

    let sign = '';
    let x: Rational = this;
    if (x.isNegative()) {
      sign = '-';
      x = x.negate();
    }
    x = x.add(roundingFactor);
    let divmod = num_divmod(x.p, x.q);
    var integerPart = divmod.quotient.toString();
    var decimalPart = '';
    var fraction = new Rational(divmod.remainder, x.q);
    let ten = new Rational(10, 1);
    while (maxDigits > 0 && !fraction.equal(roundingFactor)) {
      fraction = fraction.mul(ten);
      roundingFactor = roundingFactor.mul(ten);
      let divmod = num_divmod(fraction.p, fraction.q);
      decimalPart += divmod.quotient.toString();
      fraction = new Rational(divmod.remainder, fraction.q);
      maxDigits--;
    }
    if (fraction.equal(roundingFactor)) {
      while (decimalPart[decimalPart.length - 1] === '0') {
        decimalPart = decimalPart.slice(0, decimalPart.length - 1);
      }
    }
    if (decimalPart !== '') {
      return sign + integerPart + '.' + decimalPart;
    }
    return sign + integerPart;
  }

  toMixed(): string {
    if (this.isZero()) {
      return '0';
    }

    const { quotient, remainder } = this.divmod(Rational.one);

    let parts: string[] = [];
    if (!quotient.isZero()) {
      parts.push(quotient.toFraction());
    }
    if (!remainder.isZero()) {
      parts.push(remainder.toFraction());
    }

    return parts.join(' + ');
  }

  //
  // Statics
  //
  static fromFloat(num: number): Rational {
    if (Number.isInteger(num)) {
      return new this(num, 1);
    }

    // Sufficient precision for our data?
    const r = new Rational(
      Math.round(num * FLOAT_CONVERT_PRECISION),
      FLOAT_CONVERT_PRECISION
    );

    const divmod = r.divmod(Rational.one);
    for (const [key, value] of lookups) {
      if (divmod.remainder.equal(key)) {
        return divmod.quotient.add(value);
      }
    }

    return r;
  }
  static fromInts(p: number, q: number): Rational {
    return new this(p, q);
  }

  static fromString(str: string): Rational {
    let sum = Rational.zero;

    for (let part of str.split('+')) {
      part = part.trim();
      if (!part) continue;

      const index = part.indexOf('/');
      if (index === -1) {
        sum = sum.add(Rational.fromFloat(Number(part)));
      } else {
        const p = Number(part.slice(0, index));
        const q = Number(part.slice(index + 1));
        sum = sum.add(Rational.fromInts(p, q));
      }
    }

    return sum;
  }

  static zero = new Rational(0, 1);
  static one = new Rational(1, 1);
  static oneThird = new Rational(1, 3);
  static twoThirds = new Rational(2, 3);
}

const lookups: [Rational, Rational][] = [];

for (let q = 2; q < 100; q++) {
  for (let p = 1; p < q; p++) {
    const num = p / q;

    // Is there a better way to quickly filter out non-repeating decimals?
    if (num.toString().length < 10) {
      continue;
    }

    // Support computer input, use proper rounding
    const rounded = new Rational(
      Math.round(num * FLOAT_CONVERT_PRECISION),
      FLOAT_CONVERT_PRECISION
    );
    lookups.push([rounded, Rational.fromInts(p, q)]);

    // Support human input, who just leave off the end after a while
    const floored = new Rational(
      Math.floor(num * FLOAT_CONVERT_PRECISION),
      FLOAT_CONVERT_PRECISION
    );
    lookups.push([floored, Rational.fromInts(p, q)]);
  }
}
