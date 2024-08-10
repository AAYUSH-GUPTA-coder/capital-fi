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
