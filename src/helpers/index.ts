export const getAPY = (liquidityRate: number) => {
  const RAY = 10 ** 27;
  const SECONDS_PER_YEAR = 31536000;

  // Assume liquidityRate is fetched from the contract
  let depositAPR = liquidityRate / RAY;
  let depositAPY =
    Math.pow(1 + depositAPR / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1;

  // Convert to percentage
  depositAPY *= 100;

  return depositAPY;
};

export enum chains {
  "base",
  "optimism",
}

export const getUSDCBalance = async (address: string, chain: chains) => {
  if (chain === chains.base) {
    try {
      const response = await fetch(
        `https://base.blockscout.com/api?module=account&action=tokenbalance&contractaddress=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&address=${address}`
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error(error);
    }
  } else if (chain === chains.optimism) {
    try {
      const response = await fetch(
        `https://optimism.blockscout.com/api?module=account&action=tokenbalance&contractaddress=0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85&address=${address}`
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error(error);
    }
  }
};
