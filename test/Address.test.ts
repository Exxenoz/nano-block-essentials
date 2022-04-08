import { Address } from "../src";

const invalidAddresses = [
  "xrb_1111111111111111111111111111111111111111111111111111hifc8np1",
  "nano_1111111111111111111111111111111111111111111111111111hifc8np1",
  "xrb_1nfinity",
  "nano_1nfinity",
  "xrb_3e1ybt49ibofh4a4814g3f9jcnb7oo1ooyhzdh7dunre1otgaiq8k99t1br",
  "nano_1czq645991excwo6na4hsthu96kr8pbkggyazgkcfnnowywq5dkfonponymhs",
  "nano_3euns1bz4nas6g834cs49au3act15mhniebxabd58ojpnr4mnhn7ndef61z3",
  "abc_1111111111111111111111111111111111111111111111111111hifc8npp",
  "1111111111111111111111111111111111111111111111111111hifc8npp",
];
const validAddresses = [
  "xrb_1111111111111111111111111111111111111111111111111111hifc8npp",
  "nano_1111111111111111111111111111111111111111111111111111hifc8npp",
  "xrb_1nfinityzdq6c13hyhzfjn57rf987nzfcb7brxd8akxna7fhhh55j14s8tif",
  "nano_1nfinityzdq6c13hyhzfjn57rf987nzfcb7brxd8akxna7fhhh55j14s8tif",
  "xrb_3e1ybt49ibofh4a481u4g3f9jcnb7oo1ooyhzdh7dunre1otgaiq8k99t1br",
  "nano_1czq645991excwo6n4hsthu96kr8pbkggyazgkcfnnowywq5dkfonponymhs",
  "nano_3euns1bz4nas6g834cs49au3act15mhniebxabd58ojpnr4mnhn7ndefc1z3",
];

describe(`Address`, () => {
  test(`invalid`, async () => {
    for (const address of invalidAddresses) {
      const result = Address.safeParse(address);
      expect(result.success).toBe(false);
    }
  });

  test(`valid`, async () => {
    for (const address of validAddresses) {
      const result = Address.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(address);
      }
    }
  });
});
