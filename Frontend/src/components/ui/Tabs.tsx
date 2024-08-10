interface TabsProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="flex items-center">
      <button
        className={`flex w-[50%] py-3 items-center justify-center ${
          activeTab === 0
            ? "text-neutral-800 bg-white border-t-2 border-indigo-500"
            : "text-neutral-500 bg-neutral-50"
        }`}
        onClick={() => setActiveTab(0)}
      >
        Deposit
      </button>
      <button
        className={`flex w-[50%] py-3 items-center justify-center ${
          activeTab === 1
            ? "text-neutral-800 bg-white border-t-2 border-indigo-500"
            : "text-neutral-500 bg-neutral-50"
        }`}
        onClick={() => setActiveTab(1)}
      >
        Withdraw
      </button>
    </div>
  );
}
