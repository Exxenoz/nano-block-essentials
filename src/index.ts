import { blake2b } from "blakejs";
import { z } from "zod";
import Base32Converter from "./conversion/Base32Converter";

export const ADDRESS_PREFIX = "nano_";

export const ZERO_ADDRESS =
  "nano_1111111111111111111111111111111111111111111111111111hifc8npp";
export const ZERO_PRV_KEY =
  "0000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_PUB_KEY =
  "0000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_SIGNATURE =
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_WORK = "0000000000000000";

export const MIN_SEED_INDEX = 0;
export const MAX_SEED_INDEX = 2 ** 32 - 1;

export const HEIGHT_MIN = 0n;
export const HEIGHT_MAX = 18446744073709551615n; // 2^64 - 1

export const BALANCE_MIN = 0n;
export const BALANCE_MAX = 340282366920938463463374607431768211455n; // 2^128 - 1

export type Hex = z.infer<typeof Hex>;
export const Hex = z.string().regex(/^[0-9a-fA-F]+$/);

export type Hash = z.infer<typeof Hash>;
export const Hash = Hex.length(64);

export type Seed = z.infer<typeof Seed>;
export const Seed = Hex.length(64);

export type SeedIndex = z.infer<typeof SeedIndex>;
export const SeedIndex = z
  .number()
  .int()
  .min(MIN_SEED_INDEX)
  .max(MAX_SEED_INDEX);

export type PrvKey = z.infer<typeof PrvKey>;
export const PrvKey = Hex.length(64);

export type PubKey = z.infer<typeof PubKey>;
export const PubKey = Hex.length(64);

export type Address = z.infer<typeof Address>;
export const Address = z
  .string()
  .regex(/^(xrb_|nano_)[13][13-9a-km-uw-z]{59}$/)
  .superRefine((val, ctx) => {
    const pubKeyByteArray = Base32Converter.decodeNanoBase32ToByteArray(
      val.substr(val.length - 52 /* Encoded PubKey */ - 8 /* Checksum */, 52)
    );
    if (pubKeyByteArray instanceof Error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: pubKeyByteArray.message,
      });
      return;
    }

    const checksumByteArray = Base32Converter.decodeNanoBase32ToByteArray(
      val.substr(val.length - 8 /* Checksum */)
    );
    if (checksumByteArray instanceof Error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: checksumByteArray.message,
      });
      return;
    }

    const computedChecksumByteArray = blake2b(
      pubKeyByteArray,
      undefined,
      5
    ).reverse();

    for (let i = 0; i < checksumByteArray.length; i++) {
      if (checksumByteArray[i] !== computedChecksumByteArray[i]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Checksum mismatch",
        });
        return;
      }
    }
  });

export type Type = z.infer<typeof Type>;
export const Type = z.literal("state");

export type Subtype = z.infer<typeof Subtype>;
export const Subtype = z
  .literal("send")
  .or(z.literal("receive"))
  .or(z.literal("open"))
  .or(z.literal("change"))
  .or(z.literal("epoch"));

export type Height = z.infer<typeof Height>;
export const Height = z
  .bigint()
  .refine((val) => val >= HEIGHT_MIN, {
    message: `Must be greater than [${HEIGHT_MIN}]!`,
  })
  .refine((val) => val <= HEIGHT_MAX, {
    message: `Must be less than [${HEIGHT_MAX}]!`,
  });

export type HeightString = z.infer<typeof HeightString>;
export const HeightString = z
  .string()
  .regex(/^\d+$/)
  .transform((val) => BigInt(val))
  .refine((val) => val >= HEIGHT_MIN, {
    message: `Must be greater than [${HEIGHT_MIN}]!`,
  })
  .refine((val) => val <= HEIGHT_MAX, {
    message: `Must be less than [${HEIGHT_MAX}]!`,
  });

export type Balance = z.infer<typeof Balance>;
export const Balance = z
  .bigint()
  .refine((val) => val >= BALANCE_MIN, {
    message: `Must be greater than [${BALANCE_MIN}]!`,
  })
  .refine((val) => val <= BALANCE_MAX, {
    message: `Must be less than [${BALANCE_MAX}]!`,
  });

export type BalanceString = z.infer<typeof BalanceString>;
export const BalanceString = z
  .string()
  .regex(/^\d+$/)
  .transform((val) => BigInt(val))
  .refine((val) => val >= BALANCE_MIN, {
    message: `Must be greater than [${BALANCE_MIN}]!`,
  })
  .refine((val) => val <= BALANCE_MAX, {
    message: `Must be less than [${BALANCE_MAX}]!`,
  });

export type Link = z.infer<typeof Link>;
export const Link = Hash.or(PubKey);

export type Signature = z.infer<typeof Signature>;
export const Signature = Hex.length(128);

export type Work = z.infer<typeof Work>;
export const Work = Hex.length(16);

// conversion
export {
  default as AddressConverter,
  AddressConverterError,
} from "./conversion/AddressConverter";
export {
  default as Base32Converter,
  Base32ConverterError,
} from "./conversion/Base32Converter";
export {
  default as HexConverter,
  HexConverterError,
} from "./conversion/HexConverter";
export {
  default as KeyConverter,
  KeyConverterError,
} from "./conversion/KeyConverter";

// block factory
export {
  default as NanoBlockFactory,
  FactoryError,
  InvalidArgumentError,
  BadCallError,
  ChangeBlockInput,
  OpenBlockInput,
  ReceiveBlockInput,
  SendBlockInput,
  HashInput,
  SignInput,
} from "./factory/NanoBlockFactory";

// blocks
export { ChangeBlock } from "./model/ChangeBlock";
export { EpochBlock } from "./model/EpochBlock";
export { NanoBlock } from "./model/NanoBlock";
export { NanoBlockSchema } from "./model/NanoBlockSchema";
export { OpenBlock } from "./model/OpenBlock";
export { ReceiveBlock } from "./model/ReceiveBlock";
export { SendBlock } from "./model/SendBlock";
