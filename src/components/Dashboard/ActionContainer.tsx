import {
  amountVariance,
  contractAddresses,
  networks,
  USDC,
  USDCABI,
} from "@/lib/constants";
import Dropdown from "../ui/Dropdown";
import { useEffect, useState } from "react";
import { Network } from "@/lib/types";
import Tabs from "../ui/Tabs";
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { contractABI } from "../../../ABI/CapitalFi";
import { Chain, parseUnits } from "viem";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { supplyAmountToDefiBase, supplyAmountToDefiOp } from "@/app/_actions";

export default function ActionContainer() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[0]);
  const [amount, setAmount] = useState<number>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [txnState, setTxnState] = useState<"idle" | "approve" | "deposit">(
    "idle"
  );

  const { data: approveHash, writeContractAsync: callApproval } =
    useWriteContract();
  const { isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { data: depositHash, writeContractAsync: depositAmount } =
    useWriteContract();

  const { isSuccess: isDeposited } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  useEffect(() => {
    if (isApproved) {
      setTxnState("deposit");
      const deposit = async () =>
        await depositAmount({
          address: contractAddress(chain!),
          abi: contractABI,
          functionName: "userDeposit",
          args: [
            chain?.id === baseSepolia.id ? USDC.baseSepolia : USDC.opSepolia,
            parseUnits(amount?.toString() ?? "0", 6),
          ],
        });
      deposit();
    }
  }, [isApproved]);

  useEffect(() => {
    if (isDeposited) {
      chain?.id === baseSepolia.id
        ? supplyAmountToDefiBase()
        : supplyAmountToDefiOp();
      setTxnState("idle");
    }
  }, [isDeposited]);

  const contractAddress = (chain: Chain) => {
    return chain === baseSepolia
      ? (contractAddresses.baseSepolia as `0x${string}`)
      : (contractAddresses.opSepolia as `0x${string}`);
  };

  return (
    <div className='flex flex-col w-full md:w-[40%] bg-white shadow-md'>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className='flex flex-col gap-6 p-4 mt-5'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <h3 className='text-neutral-600 font-medium'>
              {activeTab === 0 ? "You're depositing" : "You're withdrawing"}
            </h3>
            <span className='flex w-fit py-1 px-4 text-[0.8rem] bg-gradient-to-tr from-emerald-100/60 to-amber-100/60 text-neutral-500 rounded-2xl'>
              ⚡️ &nbsp;Testnet mode
            </span>
          </div>
          <div className='flex items-center border border-neutral-200'>
            <span className='flex w-[80%] items-center justify-between px-5 text-neutral-400 border-r border-neutral-200'>
              <input
                type='number'
                placeholder='0.00'
                className='w-full py-2 outline-none text-neutral-800'
                value={amount}
                onChange={(event) => {
                  setAmount(Number(event.target.value));
                }}
              />
              USDC
            </span>
            <div className='w-[20%]'>
              <Dropdown
                networks={networks}
                selectedNetwork={selectedNetwork}
                onSelect={(network) => {
                  switchChain({
                    chainId:
                      network.name === "Optimism"
                        ? optimismSepolia.id
                        : baseSepolia.id,
                  });
                  setSelectedNetwork(network);
                }}
              />
            </div>
          </div>
          <span className='text-sm text-neutral-400 text-end'>
            Balance: 0.00 USDC
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {amountVariance.map((amount, index) => (
            <button
              key={index}
              className='w-full py-1.5 bg-neutral-100 text-neutral-600 rounded'
              onClick={() => setAmount(amount.value)}
            >
              {amount.name}
            </button>
          ))}
        </div>
        <button
          className='w-full py-2.5 items-center justify-center bg-indigo-500 text-white disabled:bg-neutral-200 disabled:text-neutral-600'
          onClick={async () => {
            setTxnState("approve");
            await callApproval({
              address:
                chain?.id === baseSepolia.id
                  ? (USDC.baseSepolia as `0x${string}`)
                  : (USDC.opSepolia as `0x${string}`),
              abi: USDCABI,
              functionName: "approve",
              args: [
                contractAddress(chain!),
                parseUnits(amount?.toString() ?? "0", 6),
              ],
            });
          }}
          disabled={!amount}
        >
          {activeTab === 0
            ? txnState === "approve"
              ? "Approving"
              : txnState === "deposit"
              ? "Depositing"
              : "Deposit"
            : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
