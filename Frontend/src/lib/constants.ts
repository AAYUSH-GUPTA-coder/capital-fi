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
  base: "0x170537A78FA4ca63AB849D208bEE8fD3Ab1fAc97",
  op: "0xaf5eDa95b87fCf9767cED0d9c01b69e0A976C725",
};

export const USDC = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  op: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
};

export const AaveUSDC = {
  base: "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB",
  op: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
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
