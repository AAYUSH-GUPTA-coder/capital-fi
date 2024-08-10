import { networks } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineExternalLink } from "react-icons/hi";

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
];

export default function ActivityContainer() {
  return (
    <div className="flex flex-col w-full md:w-[60%] h-[20.9rem] bg-white shadow-lg">
      <span className="flex p-3 text-neutral-700 font-medium border-b border-neutral-100">
        Activity
      </span>
      <div className="flex flex-col gap-2 p-5 items-center justify-center scroll-smooth scrollbar">
        {dummyData.length > 0 ? (
          dummyData.map((data, index) => {
            const icon = networks.filter(
              (network) => network.name === data.network
            )[0].icon;
            return (
              <Link
                href={data.tx}
                target="_blank"
                key={index}
                className="flex w-full items-center justify-between px-3 py-2 border border-neutral-200 hover:shadow-md"
              >
                <span className="text-neutral-600">
                  {index + 1}. Deposited{" "}
                  <b className="text-neutral-700">{data.amount}</b> USDC
                </span>
                <span className="flex items-center gap-2">
                  <Image
                    src={icon}
                    alt="Network"
                    width={24}
                    height={24}
                    className="w-5 h-5 object-cover"
                  />
                  <HiOutlineExternalLink />
                </span>
              </Link>
            );
          })
        ) : (
          <span className="text-neutral-400">No activity yet</span>
        )}
      </div>
    </div>
  );
}
