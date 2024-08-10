import { getAPYonBase, getAPYonOP } from "@/app/_actions";
import { useEffect, useState } from "react";
import { baseSepolia } from "viem/chains";
import { useAccount } from "wagmi";

export default function Header() {
  const { address } = useAccount();
  const [totalValue, setTotalValue] = useState<string>("0");
  const { chain } = useAccount();
  const [APY, setAPY] = useState<string>("0");

  useEffect(() => {
    const fetchValues = async () => {
      const apy =
        chain?.id === baseSepolia.id
          ? await getAPYonBase()
          : await getAPYonOP();
      setAPY(apy as string);
    };
    fetchValues();
  }, []);

  return (
    <div className='flex flex-col md:flex-row gap-5 items-start md:items-center justify-start md:justify-between'>
      <span className='flex flex-col'>
        <h2 className='text-xl font-medium'>
          {address ? "Welcome back" : "Get started"}
        </h2>
        <p className='text-neutral-500'>
          {address
            ? "Here's how you're doing"
            : "Connect your wallet to get started"}
        </p>
      </span>
      <div className='flex items-center gap-8'>
        <span className='flex flex-col'>
          <p className='text-neutral-500'>Total Value</p>
          <h2 className='text-xl font-medium'>${totalValue}</h2>
        </span>
        {/* <span className='flex flex-col'>
          <p className='text-neutral-500'>Interest Earned</p>
          <h2 className='text-xl font-medium'>$0.00</h2>
        </span> */}
        <span className='flex flex-col'>
          <p className='text-neutral-500'>Real-time APY</p>
          <h2 className='text-xl font-medium'>{APY}%</h2>
        </span>
      </div>
    </div>
  );
}
