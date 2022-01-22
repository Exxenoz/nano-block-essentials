import { z } from "zod";
import { ZERO_HASH, Hash } from "..";
import { NanoBlockSchema } from "./NanoBlockSchema";

export type OpenBlock = z.infer<typeof OpenBlock>;
export const OpenBlock = NanoBlockSchema.merge(
  z.object({
    subtype: z.literal("open"),
    previous: z.literal(ZERO_HASH),
    link: Hash,
  })
);
