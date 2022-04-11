import { z } from "zod";
import { AddressRegex, AddressSuperRefine } from "./model/Address";
import { Amount, AmountUnit } from "./model/Amount";
import { NftAddressRegex } from "./model/NftAddress";

export const ADDRESS_PREFIX = "nano_";
export const NFT_ADDRESS_PREFIX = "nft_";

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
export const MAX_SEED_INDEX = 4294967295; // 2^32 -1

export const HEIGHT_MIN = 0;
export const HEIGHT_MAX = Number.MAX_SAFE_INTEGER;

export { Amount } from "./model/Amount";

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
  .regex(AddressRegex)
  .superRefine(AddressSuperRefine);

export type NftAddress = z.infer<typeof NftAddress>;
export const NftAddress = z
  .string()
  .regex(NftAddressRegex)
  .superRefine(AddressSuperRefine);

export type Type = z.infer<typeof Type>;
export const Type = z
  .literal("state")
  .or(z.literal("send"))
  .or(z.literal("receive"))
  .or(z.literal("open"))
  .or(z.literal("change"));

export type Subtype = z.infer<typeof Subtype>;
export const Subtype = z
  .literal("send")
  .or(z.literal("receive"))
  .or(z.literal("open"))
  .or(z.literal("change"))
  .or(z.literal("epoch"));

export type Height = z.infer<typeof Height>;
export const Height = z.number().min(HEIGHT_MIN).max(HEIGHT_MAX);

export type HeightString = z.infer<typeof HeightString>;
export const HeightString = z
  .string()
  .regex(/^\d+$/)
  .refine((val) => Number(val) >= HEIGHT_MIN, {
    message: `Must be greater than [${HEIGHT_MIN}]!`,
  })
  .refine((val) => Number(val) <= HEIGHT_MAX, {
    message: `Must be less than [${HEIGHT_MAX}]!`,
  });

export type RawAmountString = z.infer<typeof RawAmountString>;
export const RawAmountString = z
  .string()
  .refine((val) => Amount.parse(val, AmountUnit.Raw) != null, {
    message: `Invalid raw amount!`,
  });

export type NanoAmountString = z.infer<typeof NanoAmountString>;
export const NanoAmountString = z
  .string()
  .refine((val) => Amount.parse(val, AmountUnit.Nano) != null, {
    message: `Invalid nano amount!`,
  });

export type AmountString = z.infer<typeof AmountString>;
export const AmountString = RawAmountString.or(NanoAmountString);

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
