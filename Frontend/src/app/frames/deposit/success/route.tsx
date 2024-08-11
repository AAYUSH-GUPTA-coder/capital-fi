import { Button } from "frames.js/next";
import { frames } from "../../frames";
import { supplyAmountToDefiBase } from "@/app/_actions";

const handleRequest = frames(async (ctx) => {
  supplyAmountToDefiBase();

  return {
    image: "https://imgur.com/mdk8MZ4.png",
    buttons: [
      <Button
        action='link'
        target={`https://base.blockscout.com/tx/${ctx.message?.transactionId}`}
        key={"link"}
      >
        Check Txn
      </Button>,
      <Button
        action='link'
        target={"https://capital-fi.vercel.app"}
        key={"link"}
      >
        Visit Capital Fi
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
