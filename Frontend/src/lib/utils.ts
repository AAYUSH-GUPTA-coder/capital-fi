import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Chain, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { contractABI } from "./CapitalFi";
import { contractAddresses } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTotalValue = async (address: string, chain: Chain) => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const userShares = (await publicClient.readContract({
    abi: contractABI,
    address:
      chain.id === base.id
        ? (contractAddresses.base as `0x${string}`)
        : (contractAddresses.op as `0x${string}`),
    functionName: "getUserShares",
    args: [address],
  })) as number;

  return Number(userShares) / 1e6;
};
