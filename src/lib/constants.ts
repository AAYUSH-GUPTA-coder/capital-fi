export const networks = [
  {
    name: "Optimism",
    icon: "/icons/optimism.png",
  },
  {
    name: "Base",
    icon: "/icons/base.png",
  },
];

export const amountVariance = [
  {
    name: "$ 100",
    value: 100,
  },
  {
    name: "$ 200",
    value: 200,
  },
  {
    name: "$ 500",
    value: 500,
  },
  {
    name: "MAX",
    value: 1000,
  },
];

export const contractAddresses = {
  baseSepolia: "0x48eCe3F01Eb811B174e04Ca88578A826c1204665",
  opSepolia: "0x7e4CE6f92100a494D5c5C77cF55698B0dCD55580",
};

export const USDC = {
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  opSepolia: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
};

export const USDCABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    type: "function",
  },
];
