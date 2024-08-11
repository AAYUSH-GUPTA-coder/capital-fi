import { Button } from "frames.js/next";
import { frames } from "../frames";

const handleRequest = frames(async (ctx) => {
  return {
    image: "https://i.imgur.com/xo0nhjq.png",
    buttons: [
      <Button
        action='link'
        target={`https://base.blockscout.com/tx/${ctx.message?.transactionId}`}
        key={"link"}
      >
        Check Txn
      </Button>,
      <Button
        action='post'
        target={`${process.env.BASE_URL}/frames/deposit`}
        key={"deposit"}
      >
        Deposit Now
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
