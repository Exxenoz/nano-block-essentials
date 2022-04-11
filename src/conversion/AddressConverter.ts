import { blake2b } from "blakejs";
import HexConverter from "./HexConverter";
import Base32Converter from "./Base32Converter";
import ChainedError from "typescript-chained-error";
import {
  Address,
  ADDRESS_PREFIX,
  NftAddress,
  NFT_ADDRESS_PREFIX,
  PubKey,
} from "..";

export class AddressConverterError extends ChainedError {
  constructor(msg?: string, cause?: Error) {
    super(msg, cause);

    Object.setPrototypeOf(this, AddressConverterError.prototype);
  }
}

export default class AddressConverter {
  private static convertPubKeyToAddressString(
    pubKey: PubKey,
    prefix: string
  ): string | AddressConverterError {
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

  static convertPubKeyToAddress(
    pubKey: PubKey,
    prefix: "nano_" | "xrb_" = ADDRESS_PREFIX
  ): Address | AddressConverterError {
    const addressString = this.convertPubKeyToAddressString(pubKey, prefix);
    if (addressString instanceof Error) {
      return addressString;
    }
    const addressParse = Address.safeParse(addressString);
    if (!addressParse.success) {
      return new AddressConverterError(undefined, addressParse.error);
    }
    return addressParse.data;
  }

  static convertPubKeyToNftAddress(
    pubKey: PubKey
  ): NftAddress | AddressConverterError {
    const addressString = this.convertPubKeyToAddressString(
      pubKey,
      NFT_ADDRESS_PREFIX
    );
    if (addressString instanceof Error) {
      return addressString;
    }
    const nftAddressParse = NftAddress.safeParse(addressString);
    if (!nftAddressParse.success) {
      return new AddressConverterError(undefined, nftAddressParse.error);
    }
    return nftAddressParse.data;
  }

  private static convertAddressStringToPubKey(
    address: string
  ): PubKey | AddressConverterError {
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

    const hexString = HexConverter.convertByteArrayToHex(pubKeyByteArray);
    const pubKeyParse = PubKey.safeParse(hexString);
    if (!pubKeyParse.success) {
      return new AddressConverterError(undefined, pubKeyParse.error);
    }
    return pubKeyParse.data;
  }

  static convertAddressToPubKey(
    address: Address
  ): PubKey | AddressConverterError {
    const addressParse = Address.safeParse(address);
    if (!addressParse.success) {
      return new AddressConverterError(undefined, addressParse.error);
    }
    return AddressConverter.convertAddressStringToPubKey(addressParse.data);
  }

  static convertNftAddressToPubKey(
    address: NftAddress
  ): PubKey | AddressConverterError {
    const nftAddressParse = NftAddress.safeParse(address);
    if (!nftAddressParse.success) {
      return new AddressConverterError(undefined, nftAddressParse.error);
    }
    return AddressConverter.convertAddressStringToPubKey(nftAddressParse.data);
  }
}
