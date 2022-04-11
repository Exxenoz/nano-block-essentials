import { blake2b } from "blakejs";
import HexConverter from "./HexConverter";
import Base32Converter from "./Base32Converter";
import ChainedError from "typescript-chained-error";
import { Address, PubKey } from "..";

export class AddressConverterError extends ChainedError {
  constructor(msg?: string, cause?: Error) {
    super(msg, cause);

    Object.setPrototypeOf(this, AddressConverterError.prototype);
  }
}

export default class AddressConverter {
  static convertPubKeyToAddress(
    pubKey: PubKey,
    prefix = "nano_"
  ): Address | AddressConverterError {
    const pPubKey = PubKey.safeParse(pubKey);
    if (!pPubKey.success) {
      return new AddressConverterError(undefined, pPubKey.error);
    }

    pubKey = pPubKey.data;

    const pubKeyByteArray = HexConverter.convertHexToByteArray(pubKey);
    if (pubKeyByteArray instanceof Error) {
      return new AddressConverterError(undefined, pubKeyByteArray);
    }

    const checksumByteArray = blake2b(pubKeyByteArray, undefined, 5).reverse();

    const encodedPubKey = Base32Converter.encodeByteArray(pubKeyByteArray);
    const encodedChecksum = Base32Converter.encodeByteArray(checksumByteArray);

    return prefix + encodedPubKey + encodedChecksum;
  }

  static convertAddressToPubKey(
    address: Address
  ): PubKey | AddressConverterError {
    const pAddress = Address.safeParse(address);
    if (!pAddress.success) {
      return new AddressConverterError(undefined, pAddress.error);
    }

    address = pAddress.data;

    const encodedPubKeyLength = 52;
    const encodedChecksumLength = 8;

    const pubKeyByteArray = Base32Converter.decodeBase32(
      address.substring(
        address.length - encodedPubKeyLength - encodedChecksumLength,
        address.length - encodedChecksumLength
      )
    );
    if (pubKeyByteArray instanceof Error) {
      return new AddressConverterError(undefined, pubKeyByteArray);
    }

    return HexConverter.convertByteArrayToHex(pubKeyByteArray);
  }
}
