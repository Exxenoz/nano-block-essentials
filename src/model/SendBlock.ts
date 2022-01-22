import { z } from "zod";
import { PubKey } from "..";
import { NanoBlockSchema } from "./NanoBlockSchema";

export type SendBlock = z.infer<typeof SendBlock>;
export const SendBlock = NanoBlockSchema.merge(
  z.object({
    subtype: z.literal("send"),
    link: PubKey,
  })
);
