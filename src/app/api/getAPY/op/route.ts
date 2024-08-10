import { getAPY } from "@/helpers";

export const GET = async (req: Request) => {
  const getReservesResponse = await fetch(
    `https://gateway.thegraph.com/api/${process.env.GRAPH_API_KEY}/subgraphs/id/DSfLz8oQBUeU5atALgUFQKMTSYV9mZAVYp4noLSXAfvb`,
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

  const usdc = data?.reserves.find(
    (reserve: any) =>
      reserve.underlyingAsset === "0x7f5c764cbc14f9669b88837ca1490cca17c31607"
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
