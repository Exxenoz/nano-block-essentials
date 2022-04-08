import { blake2bFinal, blake2bInit, blake2bUpdate } from "blakejs";
import ChainedError from "typescript-chained-error";
import { RefinementCtx, z } from "zod";
import {
  PubKey,
  AddressConverter,
  Address,
  KeyConverter,
  Work,
  PrvKey,
  Hash,
  Link,
  Signature,
  ZERO_HASH,
  ZERO_ADDRESS,
  ZERO_SIGNATURE,
  ZERO_WORK,
  HexConverter,
  RawAmountString,
  Amount,
} from "..";
import { AmountUnit } from "../model/Amount";
import { ChangeBlock } from "../model/ChangeBlock";
import { NanoBlock } from "../model/NanoBlock";
import { OpenBlock } from "../model/OpenBlock";
import { ReceiveBlock } from "../model/ReceiveBlock";
import { SendBlock } from "../model/SendBlock";
import Nacl from "../util/Nacl";

/**
 * This class should only be used directly in test cases.
 * For other purposes, use a more specific error derived from this.
 */
export class FactoryError extends ChainedError {
  constructor(message?: string, cause?: Error) {
    super(message, cause);

    Object.setPrototypeOf(this, FactoryError.prototype);
  }
}

/**
 * An argument of a method is invalid.
 */
export class InvalidArgumentError extends FactoryError {
  constructor(arg: unknown) {
    super(JSON.stringify(arg));

    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}

/**
 * Method call resulted in an error.
 */
export class BadCallError extends FactoryError {
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(fn: Function, cause: Error) {
    super(`[${fn.name}] call resulted in [${cause.name}]!`, cause);

    Object.setPrototypeOf(this, BadCallError.prototype);
  }
}

const BlockInputTransform = <T extends BlockInput>(val: T) => {
  if (PubKey.safeParse(val.account).success) {
    const pAddress = AddressConverter.convertPubKeyToAddress(val.account);
    if (pAddress instanceof Error) {
      val.account = pAddress.message;
    } else {
      val.account = pAddress;
    }
  }
  if (PubKey.safeParse(val.representative).success) {
    const pAddress = AddressConverter.convertPubKeyToAddress(
      val.representative
    );
    if (pAddress instanceof Error) {
      val.representative = pAddress.message;
    } else {
      val.representative = pAddress;
    }
  }

  return val;
};

const BlockInputValidation = (val: BlockInput, ctx: RefinementCtx) => {
  if (!Address.safeParse(val.account).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: val.account,
    });
    return;
  }
  if (!Address.safeParse(val.representative).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: val.representative,
    });
    return;
  }

  if (!val.prvKey) {
    return;
  }

  const pubKey = KeyConverter.derivePubKeyFromPrvKey(val.prvKey);
  if (pubKey instanceof Error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: pubKey.message });
    return;
  }

  const address = AddressConverter.convertPubKeyToAddress(pubKey);
  if (address instanceof Error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: address.message });
    return;
  }

  if (address !== val.account) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Private key mismatch",
    });
    return;
  }
};

type BlockInput = z.infer<typeof BlockInput>;
const BlockInput = z.object({
  account: Address.or(PubKey),
  representative: Address.or(PubKey),
  balance: RawAmountString,
  work: Work.or(z.undefined()),
  prvKey: PrvKey.or(z.undefined()),
});

export type ChangeBlockInput = z.infer<typeof ChangeBlockInput>;
export const ChangeBlockInput = BlockInput.merge(
  z.object({
    previous: Hash,
  })
)
  .transform(BlockInputTransform)
  .superRefine(BlockInputValidation);

export type OpenBlockInput = z.infer<typeof OpenBlockInput>;
export const OpenBlockInput = BlockInput.merge(
  z.object({
    sendBlockHash: Hash,
  })
)
  .transform(BlockInputTransform)
  .superRefine(BlockInputValidation);

export type ReceiveBlockInput = z.infer<typeof ReceiveBlockInput>;
export const ReceiveBlockInput = BlockInput.merge(
  z.object({
    previous: Hash,
    sendBlockHash: Hash,
  })
)
  .transform(BlockInputTransform)
  .superRefine(BlockInputValidation);

export type SendBlockInput = z.infer<typeof SendBlockInput>;
export const SendBlockInput = BlockInput.merge(
  z.object({
    previous: Hash,
    destinationAddress: Address,
  })
)
  .transform(BlockInputTransform)
  .superRefine(BlockInputValidation);

export type HashInput = z.infer<typeof HashInput>;
export const HashInput = z.object({
  account: Address,
  representative: Address,
  balance: RawAmountString,
  previous: Hash,
  link: Link,
});

export type SignInput = z.infer<typeof SignInput>;
export const SignInput = z.object({
  hash: Hash,
  prvKey: PrvKey,
});

export type VerifyInput = z.infer<typeof VerifyInput>;
export const VerifyInput = z.object({
  hash: Hash,
  signature: Signature,
  pubKey: PubKey,
});

export default class NanoBlockFactory {
  static ChangeBlock(input: ChangeBlockInput): NanoBlock | FactoryError {
    const pInput = ChangeBlockInput.safeParse(input);
    if (!pInput.success) {
      return new InvalidArgumentError(input);
    }

    input = pInput.data;

    const hash = NanoBlockFactory.Hash({
      account: input.account,
      previous: input.previous,
      representative: input.representative,
      balance: input.balance,
      link: ZERO_HASH,
    });
    if (hash instanceof Error) {
      return new BadCallError(NanoBlockFactory.Hash, hash);
    }

    let signature = undefined;
    if (input.prvKey) {
      signature = NanoBlockFactory.Sign({ hash: hash, prvKey: input.prvKey });
      if (signature instanceof Error) {
        return new BadCallError(NanoBlockFactory.Sign, signature);
      }
    }

    const block = ChangeBlock.safeParse({
      hash: hash,
      type: "state",
      subtype: "change",
      account: input.account,
      previous: input.previous,
      representative: input.representative,
      balance: input.balance,
      link: ZERO_HASH,
      link_as_account: ZERO_ADDRESS,
      signature: signature ? signature : ZERO_SIGNATURE,
      work: input.work ? input.work : ZERO_WORK,
    });
    if (!block.success) {
      return new BadCallError(ChangeBlock.safeParse, block.error);
    }

    return block.data;
  }

  static OpenBlock(input: OpenBlockInput): NanoBlock | FactoryError {
    const pInput = OpenBlockInput.safeParse(input);
    if (!pInput.success) {
      return new InvalidArgumentError(input);
    }

    input = pInput.data;

    const sendBlockHashAsAddress = AddressConverter.convertPubKeyToAddress(
      input.sendBlockHash
    );
    if (sendBlockHashAsAddress instanceof Error) {
      return new BadCallError(
        AddressConverter.convertPubKeyToAddress,
        sendBlockHashAsAddress
      );
    }

    const hash = NanoBlockFactory.Hash({
      account: input.account,
      previous: ZERO_HASH,
      representative: input.representative,
      balance: input.balance,
      link: input.sendBlockHash,
    });
    if (hash instanceof Error) {
      return new BadCallError(NanoBlockFactory.Hash, hash);
    }

    let signature = undefined;
    if (input.prvKey) {
      signature = NanoBlockFactory.Sign({ hash: hash, prvKey: input.prvKey });
      if (signature instanceof Error) {
        return new BadCallError(NanoBlockFactory.Sign, signature);
      }
    }

    const block = OpenBlock.safeParse({
      hash: hash,
      type: "state",
      subtype: "open",
      account: input.account,
      previous: ZERO_HASH,
      representative: input.representative,
      balance: input.balance,
      link: input.sendBlockHash,
      link_as_account: sendBlockHashAsAddress,
      signature: signature ? signature : ZERO_SIGNATURE,
      work: input.work ? input.work : ZERO_WORK,
    });
    if (!block.success) {
      return new BadCallError(OpenBlock.safeParse, block.error);
    }

    return block.data;
  }

  static ReceiveBlock(input: ReceiveBlockInput): NanoBlock | FactoryError {
    const pInput = ReceiveBlockInput.safeParse(input);
    if (!pInput.success) {
      return new InvalidArgumentError(input);
    }

    input = pInput.data;

    const sendBlockHashAsAddress = AddressConverter.convertPubKeyToAddress(
      input.sendBlockHash
    );
    if (sendBlockHashAsAddress instanceof Error) {
      return new BadCallError(
        AddressConverter.convertPubKeyToAddress,
        sendBlockHashAsAddress
      );
    }

    const hash = NanoBlockFactory.Hash({
      account: input.account,
      previous: input.previous,
      representative: input.representative,
      balance: input.balance,
      link: input.sendBlockHash,
    });
    if (hash instanceof Error) {
      return new BadCallError(NanoBlockFactory.Hash, hash);
    }

    let signature = undefined;
    if (input.prvKey) {
      signature = NanoBlockFactory.Sign({ hash: hash, prvKey: input.prvKey });
      if (signature instanceof Error) {
        return new BadCallError(NanoBlockFactory.Sign, signature);
      }
    }

    const block = ReceiveBlock.safeParse({
      hash: hash,
      type: "state",
      subtype: "receive",
      account: input.account,
      previous: input.previous,
      representative: input.representative,
      balance: input.balance,
      link: input.sendBlockHash,
      link_as_account: sendBlockHashAsAddress,
      signature: signature ? signature : ZERO_SIGNATURE,
      work: input.work ? input.work : ZERO_WORK,
    });
    if (!block.success) {
      return new BadCallError(ReceiveBlock.safeParse, block.error);
    }

    return block.data;
  }

  static SendBlock(input: SendBlockInput): NanoBlock | FactoryError {
    const pInput = SendBlockInput.safeParse(input);
    if (!pInput.success) {
      return new InvalidArgumentError(input);
    }

    input = pInput.data;

    const destinationPubKey = AddressConverter.convertAddressToPubKey(
      input.destinationAddress
    );
    if (destinationPubKey instanceof Error) {
      return new BadCallError(
        AddressConverter.convertAddressToPubKey,
        destinationPubKey
      );
    }

    const hash = NanoBlockFactory.Hash({
      account: input.account,
      previous: input.previous,
      representative: input.representative,
      balance: input.balance,
      link: destinationPubKey,
    });
    if (hash instanceof Error) {
      return new BadCallError(NanoBlockFactory.Hash, hash);
    }

    let signature = undefined;
    if (input.prvKey) {
      signature = NanoBlockFactory.Sign({ hash: hash, prvKey: input.prvKey });
      if (signature instanceof Error) {
        return new BadCallError(NanoBlockFactory.Sign, signature);
      }
    }

    const block = SendBlock.safeParse({
      hash: hash,
      type: "state",
      subtype: "send",
      account: input.account,
      previous: input.previous,
      representative: input.representative,
      balance: input.balance,
      link: destinationPubKey,
      link_as_account: input.destinationAddress,
      signature: signature ? signature : ZERO_SIGNATURE,
      work: input.work ? input.work : ZERO_WORK,
    });
    if (!block.success) {
      return new BadCallError(SendBlock.safeParse, block.error);
    }

    return block.data;
  }

  static Hash(input: HashInput): Hash | FactoryError {
    const pInput = HashInput.safeParse(input);
    if (!pInput.success) {
      return new InvalidArgumentError(input);
    }

    input = pInput.data;

    const balanceAmount = Amount.parse(input.balance, AmountUnit.Raw);
    if (balanceAmount == null) {
      return new InvalidArgumentError(input.balance);
    }

    const balanceHex = balanceAmount
      .getInternalValue()
      .toString(16)
      .padStart(32, "0")
      .toUpperCase();

    const accountHex = AddressConverter.convertAddressToPubKey(input.account);
    if (accountHex instanceof Error) {
      return new BadCallError(
        AddressConverter.convertAddressToPubKey,
        accountHex
      );
    }

    const representativeHex = AddressConverter.convertAddressToPubKey(
      input.representative
    );
    if (representativeHex instanceof Error) {
      return new BadCallError(
        AddressConverter.convertAddressToPubKey,
        representativeHex
      );
    }

    const accountByteArray = HexConverter.convertHexToByteArray(accountHex);
    if (accountByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        accountByteArray
      );
    }

    const previousByteArray = HexConverter.convertHexToByteArray(
      input.previous
    );
    if (previousByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        previousByteArray
      );
    }

    const representativeByteArray =
      HexConverter.convertHexToByteArray(representativeHex);
    if (representativeByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        representativeByteArray
      );
    }

    const balanceByteArray = HexConverter.convertHexToByteArray(balanceHex);
    if (balanceByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        balanceByteArray
      );
    }

    const linkByteArray = HexConverter.convertHexToByteArray(input.link);
    if (linkByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        linkByteArray
      );
    }

    const STATE_BLOCK_PREAMBLE_BYTES = new Uint8Array(32);
    STATE_BLOCK_PREAMBLE_BYTES[31] = 6;

    const context = blake2bInit(32);
    blake2bUpdate(context, STATE_BLOCK_PREAMBLE_BYTES);
    blake2bUpdate(context, accountByteArray);
    blake2bUpdate(context, previousByteArray);
    blake2bUpdate(context, representativeByteArray);
    blake2bUpdate(context, balanceByteArray);
    blake2bUpdate(context, linkByteArray);
    const hashByteArray = blake2bFinal(context);

    return HexConverter.convertByteArrayToHex(hashByteArray);
  }

  static Sign(input: SignInput): Signature | FactoryError {
    const pInput = SignInput.safeParse(input);
    if (!pInput.success) {
      return new InvalidArgumentError(input);
    }

    input = pInput.data;

    const hashByteArray = HexConverter.convertHexToByteArray(input.hash);
    if (hashByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        hashByteArray
      );
    }

    const prvKeyByteArray = HexConverter.convertHexToByteArray(input.prvKey);
    if (prvKeyByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        prvKeyByteArray
      );
    }

    let signatureByteArray;
    try {
      signatureByteArray = Nacl.signDetached(hashByteArray, prvKeyByteArray);
    } catch (err: any) {
      return new BadCallError(Nacl.signDetached, err);
    }

    return HexConverter.convertByteArrayToHex(signatureByteArray);
  }

  static Verify(input: VerifyInput): boolean | FactoryError {
    const pInput = VerifyInput.safeParse(input);
    if (!pInput.success) {
      return new InvalidArgumentError(input);
    }

    input = pInput.data;

    const hashByteArray = HexConverter.convertHexToByteArray(input.hash);
    if (hashByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        hashByteArray
      );
    }

    const signatureByteArray = HexConverter.convertHexToByteArray(
      input.signature
    );
    if (signatureByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        signatureByteArray
      );
    }

    const pubKeyByteArray = HexConverter.convertHexToByteArray(input.pubKey);
    if (pubKeyByteArray instanceof Error) {
      return new BadCallError(
        HexConverter.convertHexToByteArray,
        pubKeyByteArray
      );
    }

    try {
      return Nacl.verifyDetached(
        hashByteArray,
        signatureByteArray,
        pubKeyByteArray
      );
    } catch (err: any) {
      return new BadCallError(Nacl.verifyDetached, err);
    }
  }
}
