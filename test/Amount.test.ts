import { mockDeep, mockReset } from "jest-mock-extended";
import { Amount, AmountUnit } from "../src/model/Amount";

const obj = mockDeep<Amount>();

afterEach(() => {
  mockReset(obj);
});

describe(Amount.parse.name, () => {
  test(`invalid raw amount`, async () => {
    const values = [
      "",
      "a",
      "!",
      " ",
      "NaN",
      "Infinity",
      "-1.1",
      "-1",
      ".1",
      "1.123456",
      "1,1",
      "340282366920938463463374607431768211456",
      "1e40",
    ];
    for (const value of values) {
      expect(Amount.parse(value, AmountUnit.Raw)).toBeNull();
    }
  });

  test("valid raw amount", async () => {
    const values = [
      {
        input: "0",
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        input: "05",
        expectRaw: "5",
        expectNano: "0.000000000000000000000000000005",
      },
      {
        input: "007",
        expectRaw: "7",
        expectNano: "0.000000000000000000000000000007",
      },
      {
        input: "42",
        expectRaw: "42",
        expectNano: "0.000000000000000000000000000042",
      },
      {
        input: "1e+5",
        expectRaw: "100000",
        expectNano: "0.000000000000000000000000100000",
      },
      {
        input: "340282366920938463463374607431768211455",
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
    ];
    for (const value of values) {
      const a = Amount.parse(value.input, AmountUnit.Raw);
      expect(a).not.toBeNull();
      expect(a).toBeInstanceOf(Amount);
      expect(a?.toRawString()).toEqual(value.expectRaw);
      expect(a?.toNanoString()).toEqual(value.expectNano);
    }
  });

  test(`invalid nano amount`, async () => {
    const values = [
      "",
      "a",
      "!",
      " ",
      "NaN",
      "Infinity",
      "-1.1",
      "-1",
      "1,1",
      "340282366.920938463463374607431768211456",
      "340282367",
      "1e+9",
    ];
    for (const value of values) {
      expect(Amount.parse(value, AmountUnit.Nano)).toBeNull();
    }
  });

  test("valid nano amount", async () => {
    const values = [
      {
        input: "0",
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        input: "05",
        expectRaw: "5000000000000000000000000000000",
        expectNano: "5.000000000000000000000000000000",
      },
      {
        input: "007",
        expectRaw: "7000000000000000000000000000000",
        expectNano: "7.000000000000000000000000000000",
      },
      {
        input: "42",
        expectRaw: "42000000000000000000000000000000",
        expectNano: "42.000000000000000000000000000000",
      },
      {
        input: "1e-5",
        expectRaw: "10000000000000000000000000",
        expectNano: "0.000010000000000000000000000000",
      },
      {
        input: "1e+5",
        expectRaw: "100000000000000000000000000000000000",
        expectNano: "100000.000000000000000000000000000000",
      },
      {
        input: "1.5",
        expectRaw: "1500000000000000000000000000000",
        expectNano: "1.500000000000000000000000000000",
      },
      {
        input: "0.920938463463374607431768211455",
        expectRaw: "920938463463374607431768211455",
        expectNano: "0.920938463463374607431768211455",
      },
      {
        input: "1337.348573498578397594875984234778",
        expectRaw: "1337348573498578397594875984234778",
        expectNano: "1337.348573498578397594875984234778",
      },
      {
        input: "340282366.920938463463374607431768211455",
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
    ];
    for (const value of values) {
      const a = Amount.parse(value.input, AmountUnit.Nano);
      expect(a).not.toBeNull();
      expect(a).toBeInstanceOf(Amount);
      expect(a?.toRawString()).toEqual(value.expectRaw);
      expect(a?.toNanoString()).toEqual(value.expectNano);
    }
  });
});

describe(Amount.prototype.plus.name, () => {
  test(`invalid`, async () => {
    const values = [
      {
        a: "340282366920938463463374607431768211455",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Raw,
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "340282366920938463463374607431768211455",
        bu: AmountUnit.Raw,
      },
      {
        a: "340282366.920938463463374607431768211455",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Raw,
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "340282366.920938463463374607431768211455",
        bu: AmountUnit.Nano,
      },
      {
        a: "340282365.920938463463374607431768211456",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Nano,
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "340282365.920938463463374607431768211456",
        bu: AmountUnit.Nano,
      },
    ];
    for (const value of values) {
      const a = Amount.parse(value.a, value.au);
      const b = Amount.parse(value.b, value.bu);
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(a).toBeInstanceOf(Amount);
      expect(b).toBeInstanceOf(Amount);
      if (a != null && b != null) {
        const c = a.plus(b);
        expect(c).toBeNull();
      }
    }
  });

  test("valid", async () => {
    const values = [
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Raw,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "1",
        expectNano: "0.000000000000000000000000000001",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Raw,
        expectRaw: "1",
        expectNano: "0.000000000000000000000000000001",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "2",
        expectNano: "0.000000000000000000000000000002",
      },
      {
        a: "123456789000000000000000000000000008",
        au: AmountUnit.Raw,
        b: "123456789000000000000000000000000008",
        bu: AmountUnit.Raw,
        expectRaw: "246913578000000000000000000000000016",
        expectNano: "246913.578000000000000000000000000016",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "340282366920938463463374607431768211454",
        bu: AmountUnit.Raw,
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
      {
        a: "340282366920938463463374607431768211454",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Nano,
        expectRaw: "1000000000000000000000000000000",
        expectNano: "1.000000000000000000000000000000",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "1",
        expectNano: "0.000000000000000000000000000001",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Nano,
        expectRaw: "1000000000000000000000000000001",
        expectNano: "1.000000000000000000000000000001",
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "1000000000000000000000000000001",
        expectNano: "1.000000000000000000000000000001",
      },
      {
        a: "1000002000300004000050000600007",
        au: AmountUnit.Raw,
        b: "123456.920938463463374607431768211455",
        bu: AmountUnit.Nano,
        expectRaw: "123457920940463763378607481768811462",
        expectNano: "123457.920940463763378607481768811462",
      },
      {
        a: "123456.920938463463374607431768211455",
        au: AmountUnit.Nano,
        b: "1000002000300004000050000600007",
        bu: AmountUnit.Raw,
        expectRaw: "123457920940463763378607481768811462",
        expectNano: "123457.920940463763378607481768811462",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "340282366.920938463463374607431768211454",
        bu: AmountUnit.Nano,
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
      {
        a: "340282366.920938463463374607431768211454",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
      {
        a: "0",
        au: AmountUnit.Nano,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "1000000000000000000000000000000",
        expectNano: "1.000000000000000000000000000000",
      },
      {
        a: "0",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Nano,
        expectRaw: "1000000000000000000000000000000",
        expectNano: "1.000000000000000000000000000000",
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Nano,
        expectRaw: "2000000000000000000000000000000",
        expectNano: "2.000000000000000000000000000000",
      },
      {
        a: "1.5",
        au: AmountUnit.Nano,
        b: "1.5",
        bu: AmountUnit.Nano,
        expectRaw: "3000000000000000000000000000000",
        expectNano: "3.000000000000000000000000000000",
      },
      {
        a: "1.123456789123456789123456789123",
        au: AmountUnit.Nano,
        b: "1.987654321987654321987654321987",
        bu: AmountUnit.Nano,
        expectRaw: "3111111111111111111111111111110",
        expectNano: "3.111111111111111111111111111110",
      },
      {
        a: "340282365.920938463463374607431768211455",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Nano,
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "340282365.920938463463374607431768211455",
        bu: AmountUnit.Nano,
        expectRaw: "340282366920938463463374607431768211455",
        expectNano: "340282366.920938463463374607431768211455",
      },
    ];
    for (const value of values) {
      const a = Amount.parse(value.a, value.au);
      const b = Amount.parse(value.b, value.bu);
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(a).toBeInstanceOf(Amount);
      expect(b).toBeInstanceOf(Amount);
      if (a != null && b != null) {
        const c = a.plus(b);
        expect(c).not.toBeNull();
        expect(c).toBeInstanceOf(Amount);
        expect(c?.toRawString()).toEqual(value.expectRaw);
        expect(c?.toNanoString()).toEqual(value.expectNano);
      }
    }
  });
});

describe(Amount.prototype.minus.name, () => {
  test(`invalid`, async () => {
    const values = [
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Raw,
      },
      {
        a: "0",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Raw,
      },
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "0.000000000000000000000000000001",
        bu: AmountUnit.Nano,
      },
      {
        a: "0",
        au: AmountUnit.Nano,
        b: "0.000000000000000000000000000001",
        bu: AmountUnit.Nano,
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "1.000000000000000000000000000001",
        bu: AmountUnit.Nano,
      },
    ];
    for (const value of values) {
      const a = Amount.parse(value.a, value.au);
      const b = Amount.parse(value.b, value.bu);
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(a).toBeInstanceOf(Amount);
      expect(b).toBeInstanceOf(Amount);
      if (a != null && b != null) {
        const c = a.minus(b);
        expect(c).toBeNull();
      }
    }
  });

  test("valid", async () => {
    const values = [
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Raw,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Raw,
        expectRaw: "1",
        expectNano: "0.000000000000000000000000000001",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "123456789000000000000000000000000008",
        au: AmountUnit.Raw,
        b: "123456789000000000000000000000000008",
        bu: AmountUnit.Raw,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "340282366920938463463374607431768211454",
        au: AmountUnit.Raw,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "340282366920938463463374607431768211453",
        expectNano: "340282366.920938463463374607431768211453",
      },
      {
        a: "0",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "1",
        au: AmountUnit.Raw,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "1",
        expectNano: "0.000000000000000000000000000001",
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "999999999999999999999999999999",
        expectNano: "0.999999999999999999999999999999",
      },
      {
        a: "1000002000300004000050000600007",
        au: AmountUnit.Raw,
        b: "0.920938463463374607431768211455",
        bu: AmountUnit.Nano,
        expectRaw: "79063536836629392618232388552",
        expectNano: "0.079063536836629392618232388552",
      },
      {
        a: "123456.920938463463374607431768211455",
        au: AmountUnit.Nano,
        b: "1000002000300004000050000600007",
        bu: AmountUnit.Raw,
        expectRaw: "123455920936463163370607381767611448",
        expectNano: "123455.920936463163370607381767611448",
      },
      {
        a: "340282366.920938463463374607431768211455",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Raw,
        expectRaw: "340282366920938463463374607431768211454",
        expectNano: "340282366.920938463463374607431768211454",
      },
      {
        a: "0",
        au: AmountUnit.Nano,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "1",
        au: AmountUnit.Nano,
        b: "0",
        bu: AmountUnit.Nano,
        expectRaw: "1000000000000000000000000000000",
        expectNano: "1.000000000000000000000000000000",
      },
      {
        a: "1.5",
        au: AmountUnit.Nano,
        b: "1.5",
        bu: AmountUnit.Nano,
        expectRaw: "0",
        expectNano: "0.000000000000000000000000000000",
      },
      {
        a: "1.987654321987654321987654321987",
        au: AmountUnit.Nano,
        b: "1.123456789123456789123456789123",
        bu: AmountUnit.Nano,
        expectRaw: "864197532864197532864197532864",
        expectNano: "0.864197532864197532864197532864",
      },
      {
        a: "340282366.920938463463374607431768211455",
        au: AmountUnit.Nano,
        b: "1",
        bu: AmountUnit.Nano,
        expectRaw: "340282365920938463463374607431768211455",
        expectNano: "340282365.920938463463374607431768211455",
      },
    ];
    for (const value of values) {
      const a = Amount.parse(value.a, value.au);
      const b = Amount.parse(value.b, value.bu);
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(a).toBeInstanceOf(Amount);
      expect(b).toBeInstanceOf(Amount);
      if (a != null && b != null) {
        const c = a.minus(b);
        expect(c).not.toBeNull();
        expect(c).toBeInstanceOf(Amount);
        expect(c?.toRawString()).toEqual(value.expectRaw);
        expect(c?.toNanoString()).toEqual(value.expectNano);
      }
    }
  });
});
