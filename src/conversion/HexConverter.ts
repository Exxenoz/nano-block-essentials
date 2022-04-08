import ChainedError from "typescript-chained-error";
import { Hex } from "..";

export class HexConverterError extends ChainedError {
  constructor(msg?: string, cause?: Error) {
    super(msg, cause);

    Object.setPrototypeOf(this, HexConverterError.prototype);
  }
}

export default class HexConverter {
  static convertHexToByteArray(hex: Hex): Uint8Array | HexConverterError {
    const pHex = Hex.safeParse(hex);
    if (!pHex.success) {
      return new HexConverterError(undefined, pHex.error);
    }

    hex = pHex.data;

    if (hex.length % 2 != 0) {
      return new HexConverterError(
        `Hex [${hex}] must contain a multiple of 2 characters!`
      );
    }

    const byteArray = [];

    for (let i = 0; i < hex.length; i += 2) {
      byteArray.push(parseInt(hex.substring(i, i + 2), 16));
    }

    return new Uint8Array(byteArray);
  }

  static convertByteArrayToHex(byteArray: Uint8Array): Hex {
    let hex = "";

    for (let i = 0; i < byteArray.length; i++) {
      let currentByteAsHexString = (byteArray[i] & 0xff).toString(16);
      currentByteAsHexString =
        currentByteAsHexString.length === 1
          ? `0${currentByteAsHexString}`
          : currentByteAsHexString;
      hex += currentByteAsHexString;
    }

    return hex.toUpperCase();
  }
}
