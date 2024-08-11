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

export const getUSDCBalance = async (address: `0x${string}`, chain: chains) => {
  if (chain === chains.base) {
    try {
      const response = await fetch(
        `https://base.blockscout.com/api?module=account&action=tokenbalance&contractaddress=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&address=${address}`
      );
      const data = await response.json();
      console.log("data", data);
      return (data.result / 1e6)  as number;
    } catch (error) {
      console.error(error);
    }
  } else if (chain === chains.optimism) {
    try {
      const response = await fetch(
        `https://optimism.blockscout.com/api?module=account&action=tokenbalance&contractaddress=0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85&address=${address}`
      );
      const data = await response.json();
      return (data.result / 1e6) as number;
    } catch (error) {
      console.error(error);
    }
  }
};

export const getBaseAPY = async () => {
  const getReservesResponse = await fetch(
    `https://api.goldsky.com/api/public/project_clznu2pmex4ns01udddn89x8k/subgraphs/aave-v3-base/1.0.0/gn`,
    {
      method: "POST",
      body: JSON.stringify({
        query:
          "{\n  reserves {\n    name\n    underlyingAsset\n    liquidityRate\n  }\n}",
      }),
      cache: "no-cache",
    }
  );

  const { data } = await getReservesResponse.json();

  console.log(data);

  const usdc = data?.reserves.find(
    (reserve: any) =>
      reserve.underlyingAsset === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
  );

  if (!usdc) {
    return new Response("USDC not found", {
      status: 404,
    });
  }

  const apy = getAPY(usdc.liquidityRate);
  return apy.toFixed(3);
};

export const getOPAPY = async () => {
  const getReservesResponse = await fetch(
    `https://api.goldsky.com/api/public/project_clznu2pmex4ns01udddn89x8k/subgraphs/aave-v3-optimism/1.0.0/gn`,
    {
      method: "POST",
      body: JSON.stringify({
        query:
          "{\n  reserves {\n    name\n    underlyingAsset\n    liquidityRate\n  }\n}",
      }),
      cache: "no-cache",
    }
  );

  const { data } = await getReservesResponse.json();

  console.log("data", data);

  const usdc = data?.reserves.find((reserve: any) => {
    return (
      reserve.underlyingAsset === "0x0b2c639c533813f4aa9d7837caf62653d097ff85"
    );
  });

  if (!usdc) {
    return new Response("USDC not found", {
      status: 404,
    });
  }

  const apy = getAPY(usdc.liquidityRate);
  return apy.toFixed(3);
};