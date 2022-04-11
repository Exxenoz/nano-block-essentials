import { Address, NftAddress, PubKey } from "../src";
import AddressConverter from "../src/conversion/AddressConverter";

interface ValidAddressPair {
  address: Address;
  pubKey: PubKey;
  prefix: "nano_" | "xrb_";
}

const validAddressPairs: Array<ValidAddressPair> = [
  {
    address: "xrb_1111111111111111111111111111111111111111111111111111hifc8npp",
    pubKey: "0000000000000000000000000000000000000000000000000000000000000000",
    prefix: "xrb_",
  },
  {
    address: "xrb_1nfinityzdq6c13hyhzfjn57rf987nzfcb7brxd8akxna7fhhh55j14s8tif",
    pubKey: "51B0A435EFAEE45002FF3FED8D065C34E62D3ED524A9C756644BB4415AF7BC63",
    prefix: "xrb_",
  },
  {
    address:
      "nano_1nfinityzdq6c13hyhzfjn57rf987nzfcb7brxd8akxna7fhhh55j14s8tif",
    pubKey: "51B0A435EFAEE45002FF3FED8D065C34E62D3ED524A9C756644BB4415AF7BC63",
    prefix: "nano_",
  },
  {
    address: "xrb_1zaf4qeion3w6iaxwsrxjzeumhxz9akdq4tb51tur5p7dowyqsisk5bfmurm",
    pubKey: "7D0D15D90AD03C2411DE671D8FD9B9BFBF3A24BB8B491835BC0EC55D79EBE619",
    prefix: "xrb_",
  },
  {
    address:
      "nano_11q3k15mwa19dnpwe9pgwoe8xqucjxdqabkoabrmbsn9zza93wwimf3cwu6q",
    pubKey: "02E190073E20075D2DC61ECEE5586EDF6A8F57742655427134E687FFD070F390",
    prefix: "nano_",
  },
];

interface ValidNftAddressPair {
  address: NftAddress;
  pubKey: PubKey;
}

const validNftAddressPairs: Array<ValidNftAddressPair> = [
  {
    address: "nft_1111111111111111111111111111111111111111111111111111hifc8npp",
    pubKey: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    address: "nft_18xd6ktksfjbch6kxi55yeaa1ycdq6zm16gf8fe8cwcxc54odw4bwrntnk36",
    pubKey: "1BAB24B52CB62953C92EC063F31080794BB93F3011CD335865715D50C555F049",
  },
  {
    address: "nft_3fge77n8pigw9xs8cxox1w6wzf44skif5jcc3xb8phqsnng18mmwbwh9imt7",
    pubKey: "B5CC29686B41DC3F726576BD0709CFB442CCA0D1C54A0F526B3EF9A51C034E7C",
  },
  {
    address: "nft_3rj8owjr5nky4q1pifbqxscod1y99593br3xt8dgnhzde4sxhminkizygcbr",
    pubKey: "E226AF2381D25E15C1683537EE555583C738CE14E03DD196EA3FEB60B3D7CE14",
  },
];

describe(AddressConverter.convertAddressToPubKey.name, () => {
  test(`valid`, async () => {
    for (const pair of validAddressPairs) {
      const result = AddressConverter.convertAddressToPubKey(pair.address);
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(pair.pubKey);
    }
  });
});

describe(AddressConverter.convertPubKeyToAddress.name, () => {
  test(`valid`, async () => {
    for (const pair of validAddressPairs) {
      const result = AddressConverter.convertPubKeyToAddress(
        pair.pubKey,
        pair.prefix
      );
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(pair.address);
    }
  });
});

describe(AddressConverter.convertNftAddressToPubKey.name, () => {
  test(`valid`, async () => {
    for (const pair of validNftAddressPairs) {
      const result = AddressConverter.convertNftAddressToPubKey(pair.address);
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(pair.pubKey);
    }
  });
});

describe(AddressConverter.convertPubKeyToNftAddress.name, () => {
  test(`valid`, async () => {
    for (const pair of validNftAddressPairs) {
      const result = AddressConverter.convertPubKeyToNftAddress(pair.pubKey);
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(pair.address);
    }
  });
});
