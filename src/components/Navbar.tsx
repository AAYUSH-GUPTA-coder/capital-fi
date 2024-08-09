/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 md:px-32 py-3 bg-[#effffc] border-b border-neutral-300">
      <div className="max-w-screen-3xl flex items-center justify-between">
        <Link
          href="/"
          className="flex gap-3 items-center text-xl md:text-3xl font-semibold"
        >
          <Image
            src="/capital.svg"
            alt="Capital"
            width={40}
            height={40}
            className="w-5 h-5 md:w-8 md:h-8"
          />
          Capital Finance
        </Link>
        <div className="flex gap-4 items-center">
          <button
            className="hidden sm:flex w-fit px-5 py-[0.45rem] border border-neutral-600 hover:bg-black hover:text-white rounded-3xl transition-colors duration-200 delay-75"
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            Get started
          </button>
          <w3m-button />
        </div>
      </div>
    </nav>
  );
}
