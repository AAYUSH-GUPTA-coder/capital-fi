import { contractAddresses, USDC } from "@/lib/constants";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { contractABI } from "../../../ABI/CapitalFi";

export const supplyAmountToDefiBase = async () => {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  const tx = await client.writeContract({
    address: contractAddresses.baseSepolia as `0x${string}`,
    abi: contractABI,
    functionName: "supplyToDefi",
    args: [USDC.baseSepolia],
  });

  console.log("tx", tx);
};

export const supplyAmountToDefiOp = async () => {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  const client = createWalletClient({
    account,
    chain: optimismSepolia,
    transport: http(),
  });

  const tx = await client.writeContract({
    address: contractAddresses.opSepolia as `0x${string}`,
    abi: contractABI,
    functionName: "supplyToDefi",
    args: [USDC.opSepolia],
  });

  console.log("tx", tx);
};
