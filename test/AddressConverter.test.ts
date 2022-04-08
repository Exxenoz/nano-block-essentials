import AddressConverter from "../src/conversion/AddressConverter";

const validPairs = [
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

describe(AddressConverter.convertAddressToPubKey.name, () => {
  test(`valid`, async () => {
    for (const pair of validPairs) {
      const result = AddressConverter.convertAddressToPubKey(pair.address);
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(pair.pubKey);
    }
  });
});

describe(AddressConverter.convertPubKeyToAddress.name, () => {
  test(`valid`, async () => {
    for (const pair of validPairs) {
      const result = AddressConverter.convertPubKeyToAddress(
        pair.pubKey,
        pair.prefix
      );
      console.log(result);
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(pair.address);
    }
  });
});
