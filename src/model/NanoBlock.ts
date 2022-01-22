import { z } from "zod";
import { ChangeBlock } from "./ChangeBlock";
import { EpochBlock } from "./EpochBlock";
import { OpenBlock } from "./OpenBlock";
import { ReceiveBlock } from "./ReceiveBlock";
import { SendBlock } from "./SendBlock";

export type NanoBlock = z.infer<typeof NanoBlock>;
export const NanoBlock = SendBlock.or(ReceiveBlock)
  .or(OpenBlock)
  .or(ChangeBlock)
  .or(EpochBlock);
