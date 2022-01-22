import { z } from "zod";
import { Hash } from "..";
import { NanoBlockSchema } from "./NanoBlockSchema";

export type ReceiveBlock = z.infer<typeof ReceiveBlock>;
export const ReceiveBlock = NanoBlockSchema.merge(
  z.object({
    subtype: z.literal("receive"),
    link: Hash,
  })
);
