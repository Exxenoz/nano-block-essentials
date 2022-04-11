import { NftAddress } from "../src";

const invalidNftAddresses = [
  "nft_1111111111111111111111111111111111111111111111111111hifc8np1",
  "nft_1111111111111111111111111111111111111111111111111111hifc8np1",
  "nft_1nfinity",
  "nft_1nfinity",
  "nft_3e1ybt49ibofh4a4814g3f9jcnb7oo1ooyhzdh7dunre1otgaiq8k99t1br",
  "nft_1czq645991excwo6na4hsthu96kr8pbkggyazgkcfnnowywq5dkfonponymhs",
  "nft_3euns1bz4nas6g834cs49au3act15mhniebxabd58ojpnr4mnhn7ndef61z3",
  "abc_1111111111111111111111111111111111111111111111111111hifc8npp",
  "1111111111111111111111111111111111111111111111111111hifc8npp",
  "xrb_1mks6o86y1ufdqhzaah4hpf4bqtecezbf6c97bsnnj7muy4qm4pobogourjm",
  "xrb_3cmdgdhy5qyx9du6dyt5ryydeemhtmffq6xakapknm35d7gpzz7dqy61133c",
  "nano_1nap56sq98zmtcp5kzyteibncdkkfhabmw13a778u3eccozypommm35ra1s8",
  "nano_33mebu673cr7c65srjt7i7i9sq68gcxs5ynu46hyc55am6uiaygxb58urtm4",
];

const validNftAddresses = [
  "nft_1111111111111111111111111111111111111111111111111111hifc8npp",
  "nft_1nfinityzdq6c13hyhzfjn57rf987nzfcb7brxd8akxna7fhhh55j14s8tif",
  "nft_3e1ybt49ibofh4a481u4g3f9jcnb7oo1ooyhzdh7dunre1otgaiq8k99t1br",
  "nft_1czq645991excwo6n4hsthu96kr8pbkggyazgkcfnnowywq5dkfonponymhs",
  "nft_3euns1bz4nas6g834cs49au3act15mhniebxabd58ojpnr4mnhn7ndefc1z3",
];

describe(`NftAddress`, () => {
  test(`invalid`, async () => {
    for (const address of invalidNftAddresses) {
      const result = NftAddress.safeParse(address);
      expect(result.success).toBe(false);
    }
  });

  test(`valid`, async () => {
    for (const address of validNftAddresses) {
      const result = NftAddress.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(address);
      }
    }
  });
});
