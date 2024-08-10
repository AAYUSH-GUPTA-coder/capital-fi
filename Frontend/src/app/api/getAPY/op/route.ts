import { getAPYonOP } from "@/app/_actions";
import { getAPY } from "@/helpers";

export const GET = async (req: Request) => {
  const apy = Number(await getAPYonOP());

  return new Response(apy.toFixed(3), {
    status: 200,
  });
};
