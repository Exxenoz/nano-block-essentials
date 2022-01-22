import { z } from "zod";
import { Hash } from "..";
import { NanoBlockSchema } from "./NanoBlockSchema";

export type EpochBlock = z.infer<typeof EpochBlock>;
export const EpochBlock = NanoBlockSchema.merge(
  z.object({
    subtype: z.literal("epoch"),
    link: Hash,
  })
);
