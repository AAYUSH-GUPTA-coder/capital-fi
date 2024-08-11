/* eslint-disable @next/next/no-img-element */

"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full gap-5 pt-20 pb-5">
      <div className="flex flex-col w-full items-center justify-center gap-8 pt-16 px-3">
        <div className="flex gap-3 items-center w-fit py-1 px-3 bg-white text-neutral-700 border border-neutral-200/50 rounded-2xl">
          <span className="relative flex h-3 w-3 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Powered by<b className="-mx-1.5">Superchain</b> ⚡️
        </div>
        <h1 className="text-2xl sm:text-[3rem] lg:text-[4rem] font-bold leading-none text-center">
          Your DeFi <br /> Savings Account
        </h1>
        <p className="text-neutral-600 text-center text-lg">
          The Best Superchain Yield Aggregator <br className="hidden sm:flex" />{" "}
          Connecting You to the Best Yield Opportunities across OP Stack
        </p>
        <span className="flex gap-4 items-center">
          <Link
            href={""}
            target="_blank"
            className="w-fit px-6 py-1.5 bg-black text-white border border-neutral-600 rounded-xl"
          >
            Try now
          </Link>
          <button
            className="w-fit px-5 py-1.5 border border-neutral-600 hover:bg-black hover:text-white rounded-xl transition-colors duration-200 delay-75"
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            Get started
          </button>
        </span>
        <Image src="/asset.png" alt="Capital" width={596} height={596} />
      </div>
    </div>
  );
}
