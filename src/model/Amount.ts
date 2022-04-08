import BigNumber from "bignumber.js";

const InternalAmount = BigNumber.clone({
  EXPONENTIAL_AT: 1e9,
  DECIMAL_PLACES: 30,
});

const INTERNAL_AMOUNT_IN_RAW_MIN = new InternalAmount("0");
const INTERNAL_AMOUNT_IN_RAW_MAX = new InternalAmount(
  "340282366920938463463374607431768211455"
); // 2^128 - 1

const INTERNAL_AMOUNT_IN_NANO_MIN = new InternalAmount("0");
const INTERNAL_AMOUNT_IN_NANO_MAX = new InternalAmount(
  "340282366.920938463463374607431768211455"
);

export enum AmountUnit {
  Raw = "RAW",
  Nano = "NANO",
}

export class Amount {
  private value: BigNumber;

  private static minAmount: Amount = new Amount(INTERNAL_AMOUNT_IN_RAW_MIN);
  private static maxAmount: Amount = new Amount(INTERNAL_AMOUNT_IN_RAW_MAX);

  private constructor(value: BigNumber) {
    this.value = value;
  }

  static parse(
    value: string,
    unit: AmountUnit = AmountUnit.Raw
  ): Amount | null {
    if (unit == AmountUnit.Raw) {
      const internalAmountInRaw = this.parseInternalAmountInRaw(value);
      if (internalAmountInRaw == null) {
        return null;
      }
      return new Amount(internalAmountInRaw);
    } else if (unit == AmountUnit.Nano) {
      const internalAmountInNano = this.parseInternalAmountInNano(value);
      if (internalAmountInNano == null) {
        return null;
      }
      const internalAmountInRaw = this.parseInternalAmountInRaw(
        internalAmountInNano.shiftedBy(30)
      );
      if (internalAmountInRaw == null) {
        return null;
      }
      return new Amount(internalAmountInRaw);
    }
    return null;
  }

  private static parseInternalAmountInNano(
    value: string | BigNumber
  ): BigNumber | null {
    const internalAmountInNano = new InternalAmount(value);
    if (!internalAmountInNano.isFinite()) {
      return null;
    }
    if (internalAmountInNano.isLessThan(INTERNAL_AMOUNT_IN_NANO_MIN)) {
      return null;
    }
    if (internalAmountInNano.isGreaterThan(INTERNAL_AMOUNT_IN_NANO_MAX)) {
      return null;
    }
    return internalAmountInNano;
  }

  private static parseInternalAmountInRaw(
    value: string | BigNumber
  ): BigNumber | null {
    const internalAmountInRaw = new InternalAmount(value);
    if (!internalAmountInRaw.isFinite()) {
      return null;
    }
    if (internalAmountInRaw.isLessThan(INTERNAL_AMOUNT_IN_RAW_MIN)) {
      return null;
    }
    if (internalAmountInRaw.isGreaterThan(INTERNAL_AMOUNT_IN_RAW_MAX)) {
      return null;
    }
    if (!internalAmountInRaw.modulo(1).isZero()) {
      return null;
    }
    return internalAmountInRaw;
  }

  plus(amount: Amount): Amount | null {
    const result = this.value.plus(amount.value);
    if (result.isGreaterThan(INTERNAL_AMOUNT_IN_RAW_MAX)) {
      return null;
    }
    return new Amount(result);
  }

  minus(amount: Amount): Amount | null {
    const result = this.value.minus(amount.value);
    if (result.isLessThan(INTERNAL_AMOUNT_IN_RAW_MIN)) {
      return null;
    }
    return new Amount(result);
  }

  isGreaterThan(amount: Amount): boolean {
    return this.value.isGreaterThan(amount.value);
  }

  isGreaterThanOrEqualTo(amount: Amount): boolean {
    return this.value.isGreaterThanOrEqualTo(amount.value);
  }

  isLessThan(amount: Amount): boolean {
    return this.value.isLessThan(amount.value);
  }

  isLessThanOrEqualTo(amount: Amount): boolean {
    return this.value.isLessThanOrEqualTo(amount.value);
  }

  isEqualTo(amount: Amount): boolean {
    return this.value.isEqualTo(amount.value);
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  isFinite(): boolean {
    return this.value.isFinite();
  }

  isNaN(): boolean {
    return this.value.isNaN();
  }

  static min(): Amount {
    return this.minAmount;
  }

  static max(): Amount {
    return this.maxAmount;
  }

  getInternalValue(): BigNumber {
    return this.value;
  }

  toNanoString(decimalPlaces = 30): string {
    return this.value.shiftedBy(-30).toFixed(decimalPlaces);
  }

  toRawString(): string {
    return this.value.toFixed();
  }

  toString(): string {
    return this.toRawString();
  }
}
