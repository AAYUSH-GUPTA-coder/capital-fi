import { networks } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineExternalLink } from "react-icons/hi";
import { base } from "viem/chains";
import { useAccount } from "wagmi";

type DepositInterface = {
  network: string;
  txHash: string;
  amount: string;
  sender: string;
  receiver: string;
};

export default function ActivityContainer() {
  const { address, chainId } = useAccount();

  const {
    data: activities,
    isLoading,
    error,
  } = useQuery<DepositInterface[]>({
    queryKey: [`${address}-history`],
    queryFn: async () => {
      if (!address) return [];

      const response = await fetch("/api/history", {
        method: "POST",
        body: JSON.stringify({ address, chainId }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch activity data");
      }
      const history = await response.json();
      return history;
    },
  });

  return (
    <div className="flex flex-col w-full md:w-[60%] h-[20.9rem] bg-white shadow-lg">
      <span className="flex p-3 text-neutral-700 font-medium border-b border-neutral-100">
        Activity
      </span>
      <div className="p-5 items-center justify-center scroll-smooth scrollbar">
        {isLoading ? (
          <p className="text-neutral-500 text-center">
            Fetching your activities...
          </p>
        ) : error || !activities || activities.length === 0 ? (
          <p className="text-neutral-500 text-center">No activity yet</p>
        ) : (
          activities.map((data, index) => {
            const formattedAmount = (Number(data.amount) / 1_000_000).toFixed(
              1
            );
            return (
              <Link
                href={
                  chainId === base.id
                    ? `https://base.blockscout.com/tx/${data.txHash}`
                    : `https://optimism.blockscout.com/tx/${data.txHash}`
                }
                target="_blank"
                key={index}
                className="flex w-full items-center justify-between px-3 py-2 mb-2 border border-neutral-200 hover:bg-neutral-50 hover:shadow-md rounded"
              >
                <span className="text-neutral-600">
                  {index + 1}. Deposited{" "}
                  <b className="text-neutral-700">{formattedAmount}</b> USDC
                </span>
                <span className="flex items-center gap-2">
                  <Image
                    src={
                      chainId! === base.id ? networks[1].icon : networks[0].icon
                    }
                    alt={data.network}
                    width={24}
                    height={24}
                    className="w-5 h-5 object-cover"
                  />
                  <HiOutlineExternalLink />
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
