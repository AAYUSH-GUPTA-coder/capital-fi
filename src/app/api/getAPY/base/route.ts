import { getAPY } from "@/helpers";

export const GET = async (req: Request) => {
  console.log("GET /getAPY/base");
  const getReservesResponse = await fetch(
    `https://gateway.thegraph.com/api/${process.env.GRAPH_API_KEY}/subgraphs/id/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF`,
    {
      method: "POST",
      body: JSON.stringify({
        query:
          "{\n  reserves {\n    name\n    underlyingAsset\n    liquidityRate\n  }\n}",
      }),
    }
  );

  const { data } = await getReservesResponse.json();
  console.log(data);

  const usdc = data.reserves.find(
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
