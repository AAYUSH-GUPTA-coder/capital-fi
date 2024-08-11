/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FarcasterIcon from "./farcaster";
import { useAccount } from "wagmi";

export default function Navbar() {
  const router = useRouter();
  const { address } = useAccount();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 md:px-32 py-2.5 bg-[#effffc] border-b border-neutral-300">
      <div className="max-w-screen-3xl flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-10">
          <Link
            href="/"
            className="flex gap-3 items-center text-xl md:text-2xl font-semibold"
          >
            <Image
              src="/capital.svg"
              alt="Capital"
              width={40}
              height={40}
              className="w-5 h-5 md:w-6 md:h-6"
            />
            Capital Finance
          </Link>
          <span
            className="text-neutral-500 hover:text-black font-medium pt-0.5 hover:cursor-pointer"
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            Dashboard
          </span>
        </div>
        <div className="flex gap-4 items-center">
          {address && (
            <Link
              className="hidden sm:flex items-center gap-3 w-fit px-5 py-[0.2rem] border border-neutral-600 bg-neutral-800 hover:bg-black text-white rounded-3xl transition-colors duration-200 delay-75"
              href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
                "Earn maximum yield on SuperChain with CapitalFi, invest now 💰"
              )}&embeds[]=https://capital-fi.vercel.app/frames?referrer=${address}`}
              target="_blank"
            >
              <FarcasterIcon color="white" />
              Refer & Earn
            </Link>
          )}
          <w3m-button size="sm" />
        </div>
      </div>
    </nav>
  );
}
