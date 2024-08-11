import { networks } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineExternalLink } from "react-icons/hi";
import { useAccount } from "wagmi";

type DepositInterface = {
  network: string;
  txHash: string;
  amount: string;
  sender: string;
  receiver: string;
};

const dummyData = [
  {
    network: "Base",
    tx: "https://blockscout.com/tx/",
    amount: 100,
  },
  {
    network: "Optimism",
    tx: "https://blockscout.com/tx/",
    amount: 200,
  },
  {
    network: "Base",
    tx: "https://blockscout.com/tx/",
    amount: 500,
  },
  {
    network: "Optimism",
    tx: "https://blockscout.com/tx/",
    amount: 1000,
  },
  {
    network: "Base",
    tx: "https://blockscout.com/tx/",
    amount: 100,
  },
  {
    network: "Optimism",
    tx: "https://blockscout.com/tx/",
    amount: 200,
  },
  {
    network: "Base",
    tx: "https://blockscout.com/tx/",
    amount: 500,
  },
  {
    network: "Optimism",
    tx: "https://blockscout.com/tx/",
    amount: 1000,
  },
  {
    network: "Base",
    tx: "https://blockscout.com/tx/",
    amount: 100,
  },
  {
    network: "Optimism",
    tx: "https://blockscout.com/tx/",
    amount: 200,
  },
  {
    network: "Base",
    tx: "https://blockscout.com/tx/",
    amount: 500,
  },
  {
    network: "Optimism",
    tx: "https://blockscout.com/tx/",
    amount: 1000,
  },
];

export default function ActivityContainer() {
  const { address } = useAccount();

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
        body: JSON.stringify({ address }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch activity data");
      }
      const history = await response.json();
      return history;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !activities || activities.length === 0) {
    return <div>No activity yet</div>;
  }

  return (
    <div className='flex flex-col w-full md:w-[60%] h-[20.9rem] bg-white shadow-lg'>
      <span className='flex p-3 text-neutral-700 font-medium border-b border-neutral-100'>
        Activity
      </span>
      <div className='p-5 items-center justify-center scroll-smooth scrollbar'>
        {activities.map((data, index) => {
          const formattedAmount = (Number(data.amount) / 1_000_000).toFixed(1);
          const icon = networks.filter(
            (network) => network.name === data.network
          )[0].icon;
          return (
            <Link
              href={`https://basescan.org/tx/${data.txHash}`}
              target='_blank'
              key={index}
              className='flex w-full items-center justify-between px-3 py-2 mb-2 border border-neutral-200 hover:bg-neutral-50 hover:shadow-md rounded'
            >
              <span className='text-neutral-600'>
                {index + 1}. Deposited{" "}
                <b className='text-neutral-700'>{formattedAmount}</b> USDC
              </span>
              <span className='flex items-center gap-2'>
                <Image
                  src={icon}
                  alt={data.network}
                  width={24}
                  height={24}
                  className='w-5 h-5 object-cover'
                />
                <HiOutlineExternalLink />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
