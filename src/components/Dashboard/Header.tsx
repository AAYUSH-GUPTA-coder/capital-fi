import { useAccount } from "wagmi";

export default function Header() {
  const { address } = useAccount();
  return (
    <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-start md:justify-between">
      <span className="flex flex-col">
        <h2 className="text-xl font-medium">
          {address ? "Welcome back" : "Get started"}
        </h2>
        <p className="text-neutral-500">
          {address
            ? "Here's how you're doing"
            : "Connect your wallet to get started"}
        </p>
      </span>
      <div className="flex items-center gap-8">
        <span className="flex flex-col">
          <p className="text-neutral-500">Total Value</p>
          <h2 className="text-xl font-medium">$0.00</h2>
        </span>
        <span className="flex flex-col">
          <p className="text-neutral-500">Interest Earned</p>
          <h2 className="text-xl font-medium">$0.00</h2>
        </span>
        <span className="flex flex-col">
          <p className="text-neutral-500">Real-time APY</p>
          <h2 className="text-xl font-medium">0.00%</h2>
        </span>
      </div>
    </div>
  );
}
