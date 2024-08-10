import { getAPY } from "@/helpers";

export const GET = async (req: Request) => {
  const getReservesResponse = await fetch(
    `https://gateway.thegraph.com/api/${process.env.GRAPH_API_KEY}/subgraphs/id/3RWFxWNstn4nP3dXiDfKi9GgBoHx7xzc7APkXs1MLEgi`,
    {
      method: "POST",
      body: JSON.stringify({
        query:
          "{\n  reserves {\n    name\n    underlyingAsset\n    liquidityRate\n  }\n}",
      }),
    }
  );

  const { data } = await getReservesResponse.json();

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

  return new Response(apy.toFixed(3), {
    status: 200,
  });
};
