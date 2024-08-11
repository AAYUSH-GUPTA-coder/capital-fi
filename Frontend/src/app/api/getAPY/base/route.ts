import { getAPYonBase } from "@/app/_actions";

export const GET = async (req: Request) => {
  const apy = Number(await getAPYonBase());

  return new Response(apy.toFixed(3), {
    status: 200,
  });
};
