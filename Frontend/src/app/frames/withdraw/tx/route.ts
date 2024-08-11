import { TransactionTargetResponse, getFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { Abi, createPublicClient, encodeFunctionData, http } from "viem";
import { base } from "viem/chains";
import { contractAddresses, USDC } from "@/lib/constants";
import { contractABI } from "@/lib/CapitalFi";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);

  if (!frameMessage) {
    throw new Error("No frame message");
  }

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const userShares = await publicClient.readContract({
    abi: contractABI,
    address: contractAddresses.base as `0x${string}`,
    functionName: "getUserShares",
    args: [frameMessage.connectedAddress],
  });

  const calldata = encodeFunctionData({
    abi: contractABI,
    functionName: "userWithdraw",
    args: [USDC.base, userShares],
  });

  return NextResponse.json({
    chainId: `eip155:${base.id}`,
    method: "eth_sendTransaction",
    params: {
      abi: contractABI as Abi,
      to: contractAddresses.base as `0x${string}`,
      data: calldata,
    },
  });
}
