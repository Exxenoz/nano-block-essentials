import { blake2b } from "blakejs";
import { z } from "zod";
import Base32Converter from "../conversion/Base32Converter";

export const AddressRegex = /^(xrb_|nano_)[13][13-9a-km-uw-z]{59}$/;
export const AddressSuperRefine = (val: string, ctx: z.RefinementCtx): any => {
  const encodedPubKeyLength = 52;
  const encodedChecksumLength = 8;

  const pubKeyByteArray = Base32Converter.decodeBase32(
    val.substring(
      val.length - encodedPubKeyLength - encodedChecksumLength,
      val.length - encodedChecksumLength
    )
  );
  if (pubKeyByteArray instanceof Error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: pubKeyByteArray.message,
    });
    return;
  }

  const checksumByteArray = Base32Converter.decodeBase32(
    val.substring(val.length - encodedChecksumLength)
  );
  if (checksumByteArray instanceof Error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: checksumByteArray.message,
    });
    return;
  }

  const computedChecksumByteArray = blake2b(
    pubKeyByteArray,
    undefined,
    5
  ).reverse();

  for (let i = 0; i < checksumByteArray.length; i++) {
    if (checksumByteArray[i] !== computedChecksumByteArray[i]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Checksum mismatch",
      });
      return;
    }
  }
};
