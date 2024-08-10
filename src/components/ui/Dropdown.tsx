import { Network } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface DropdownProps {
  networks: Network[];
  selectedNetwork: Network;
  onSelect: (network: Network) => void;
}

export default function Dropdown({
  networks,
  selectedNetwork,
  onSelect,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="w-full relative">
      <button
        className="w-full px-4 py-2 truncate font-medium text-lg text-indigo-300 flex flex-row justify-between items-center gap-2.5 active:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={selectedNetwork.icon}
          alt="Network"
          width={24}
          height={24}
          className="w-6 h-6 object-cover"
        />
        <FaChevronDown
          className={`${
            isOpen && "transition-transform rotate-180 duration-200 delay-100"
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 flex flex-col z-10 mt-2 w-[10rem] max-h-[13rem] border border-neutral-200 bg-white/90 backdrop-blur-lg shadow-lg scroll-smooth scrollbar">
          {networks.map((network, index) => (
            <button
              key={index}
              className="flex flex-row gap-3 hover:bg-neutral-100 items-center w-full px-5 py-2 border-b border-neutral-200"
              onClick={() => {
                onSelect(network);
                setIsOpen(false);
              }}
            >
              <Image
                src={network.icon}
                alt="Network"
                width={24}
                height={24}
                className="w-5 h-5 object-cover"
              />
              <p>{network.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
