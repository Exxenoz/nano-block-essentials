import ChainedError from "typescript-chained-error";

const alphabet = "13456789abcdefghijkmnopqrstuwxyz";

export class Base32ConverterError extends ChainedError {
  constructor(msg?: string, cause?: Error) {
    super(msg, cause);

    Object.setPrototypeOf(this, Base32ConverterError.prototype);
  }
}

export default class Base32Converter {
  static encodeByteArrayToNanoBase32(input: Uint8Array): string {
    const length = input.length;
    const lengthInBits = length * 8;
    const leftover = lengthInBits % 5;
    const offset = leftover === 0 ? 0 : 5 - leftover;

    let value = 0;
    let output = "";
    let bits = 0;

    for (let i = 0; i < length; i++) {
      value = (value << 8) | input[i];

      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits + offset - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - (bits + offset))) & 31];
    }

    return output;
  }

  static decodeNanoBase32ToByteArray(
    input: string
  ): Uint8Array | Base32ConverterError {
    const length = input.length;
    const leftover = (length * 5) % 8;
    const offset = leftover === 0 ? 0 : 8 - leftover;

    let bits = 0;
    let value = 0;

    let index = 0;
    let output = new Uint8Array(Math.ceil((length * 5) / 8));

    for (let i = 0; i < length; i++) {
      const alphabetIndex = alphabet.indexOf(input[i]);
      if (alphabetIndex === -1) {
        return new Base32ConverterError(
          `Invalid character found: ${input[i]}!`
        );
      }

      value = (value << 5) | alphabetIndex;
      bits += 5;

      if (bits >= 8) {
        output[index++] = (value >>> (bits + offset - 8)) & 255;
        bits -= 8;
      }
    }

    if (bits > 0) {
      output[index++] = (value << (bits + offset - 8)) & 255;
    }

    if (leftover !== 0) {
      output = output.slice(1);
    }

    return output;
  }
}
