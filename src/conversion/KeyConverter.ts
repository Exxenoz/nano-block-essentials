import { blake2bFinal, blake2bInit, blake2bUpdate } from "blakejs";
import HexConverter from "./HexConverter";
import Nacl from "../util/Nacl";
import ChainedError from "typescript-chained-error";
import { PrvKey, PubKey, Seed, SeedIndex } from "..";

export class KeyConverterError extends ChainedError {
  constructor(msg?: string, cause?: Error) {
    super(msg, cause);

    Object.setPrototypeOf(this, KeyConverterError.prototype);
  }
}

export default class KeyConverter {
  static derivePrvKeyFromSeed(
    seed: Seed,
    index: SeedIndex
  ): PrvKey | KeyConverterError {
    const pSeed = PubKey.safeParse(seed);
    if (!pSeed.success) {
      return new KeyConverterError(undefined, pSeed.error);
    }

    const pIndex = SeedIndex.safeParse(index);
    if (!pIndex.success) {
      return new KeyConverterError(undefined, pIndex.error);
    }

    seed = pSeed.data;
    index = pIndex.data;

    const seedByteArray = HexConverter.convertHexToByteArray(seed);
    if (seedByteArray instanceof Error) {
      return new KeyConverterError(undefined, seedByteArray);
    }

    const indexBuffer = new ArrayBuffer(4);
    const indexView = new DataView(indexBuffer);
    indexView.setUint32(0, index);
    const indexByteArray = new Uint8Array(indexBuffer);

    const context = blake2bInit(32);
    blake2bUpdate(context, seedByteArray);
    blake2bUpdate(context, indexByteArray);
    return HexConverter.convertByteArrayToHex(blake2bFinal(context));
  }

  static derivePubKeyFromPrvKey(prvKey: PrvKey): PubKey | KeyConverterError {
    const pPrvKey = PrvKey.safeParse(prvKey);
    if (!pPrvKey.success) {
      return new KeyConverterError(undefined, pPrvKey.error);
    }

    prvKey = pPrvKey.data;

    const privKeyByteArray = HexConverter.convertHexToByteArray(prvKey);
    if (privKeyByteArray instanceof Error) {
      return new KeyConverterError(undefined, privKeyByteArray);
    }

    return HexConverter.convertByteArrayToHex(
      Nacl.derivePublicFromSecret(privKeyByteArray)
    );
  }
}
