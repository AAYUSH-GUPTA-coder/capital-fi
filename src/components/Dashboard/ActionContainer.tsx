import { amountVariance, networks } from "@/lib/constants";
import Dropdown from "../ui/Dropdown";
import { useState } from "react";
import { Network } from "@/lib/types";
import Tabs from "../ui/Tabs";

export default function ActionContainer() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[0]);
  const [amount, setAmount] = useState<number>();
  const [activeTab, setActiveTab] = useState<number>(0);
  return (
    <div className="flex flex-col w-full md:w-[40%] bg-white shadow-md">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col gap-6 p-4 mt-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-600 font-medium">
              {activeTab === 0 ? "You're depositing" : "You're withdrawing"}
            </h3>
            <span className="flex w-fit py-1 px-4 text-[0.8rem] bg-gradient-to-tr from-emerald-100/60 to-amber-100/60 text-neutral-500 rounded-2xl">
              ⚡️ &nbsp;Testnet mode
            </span>
          </div>
          <div className="flex items-center border border-neutral-200">
            <span className="flex w-[80%] items-center justify-between px-5 text-neutral-400 border-r border-neutral-200">
              <input
                type="number"
                placeholder="0.00"
                className="w-full py-2 outline-none text-neutral-800"
                value={amount}
                onChange={(event) => {
                  setAmount(Number(event.target.value));
                }}
              />
              USDC
            </span>
            <div className="w-[20%]">
              <Dropdown
                networks={networks}
                selectedNetwork={selectedNetwork}
                onSelect={setSelectedNetwork}
              />
            </div>
          </div>
          <span className="text-sm text-neutral-400 text-end">
            Balance: 0.00 USDC
          </span>
        </div>
        <div className="flex items-center gap-2">
          {amountVariance.map((amount, index) => (
            <button
              key={index}
              className="w-full py-1.5 bg-neutral-100 text-neutral-600 rounded"
              onClick={() => setAmount(amount.value)}
            >
              {amount.name}
            </button>
          ))}
        </div>
        <button
          className="w-full py-2.5 items-center justify-center bg-indigo-500 text-white disabled:bg-neutral-200 disabled:text-neutral-600 disabled:cursor-none"
          onClick={() => console.log("Deposit")}
          disabled={!amount}
        >
          {activeTab === 0 ? "Deposit" : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
