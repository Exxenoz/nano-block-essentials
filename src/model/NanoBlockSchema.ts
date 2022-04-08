import { z } from "zod";
import {
  Hash,
  Type,
  Subtype,
  Address,
  Link,
  Signature,
  Work,
  RawAmountString,
} from "..";

export type NanoBlockSchema = z.infer<typeof NanoBlockSchema>;
export const NanoBlockSchema = z.object({
  hash: Hash,
  type: Type,
  subtype: Subtype,
  account: Address,
  previous: Hash,
  representative: Address,
  balance: RawAmountString,
  link: Link,
  link_as_account: Address,
  signature: Signature,
  work: Work,
});
