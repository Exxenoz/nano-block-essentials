import { z } from "zod";
import { ZERO_HASH, ZERO_ADDRESS } from "..";
import { NanoBlockSchema } from "./NanoBlockSchema";

export type ChangeBlock = z.infer<typeof ChangeBlock>;
export const ChangeBlock = NanoBlockSchema.merge(
  z.object({
    subtype: z.literal("change"),
    link: z.literal(ZERO_HASH),
    link_as_account: z.literal(ZERO_ADDRESS),
  })
);
