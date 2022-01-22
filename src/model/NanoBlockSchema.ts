import { z } from "zod";
import {
  Hash,
  Type,
  Subtype,
  Address,
  BalanceString,
  Link,
  Signature,
  Work,
} from "..";

export type NanoBlockSchema = z.infer<typeof NanoBlockSchema>;
export const NanoBlockSchema = z.object({
  hash: Hash,
  type: Type,
  subtype: Subtype,
  account: Address,
  previous: Hash,
  representative: Address,
  balance: BalanceString.transform((val) => val.toString()),
  link: Link,
  link_as_account: Address,
  signature: Signature,
  work: Work,
});
