import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { optimismSepolia, baseSepolia } from "viem/chains";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Capital Finance",
  description: "Built for diamond hands",
  url: "https://capital-fi.vercel.app",
  icons: ["/capital.png"],
};

const chains = [optimismSepolia, baseSepolia] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});
