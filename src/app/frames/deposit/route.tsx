import { Button } from "frames.js/next";
import { frames } from "../frames";

const handleRequest = frames(async (ctx) => {
  const { searchParams } = new URL(ctx.url);

  const referrer =
    searchParams.get("referrer") ??
    "0x3039e4a4a540F35ae03A09f3D5A122c49566f919";

  return {
    image: "https://imgur.com/isPOUQ2.png",
    buttons: [
      <Button
        action='tx'
        target={`${process.env.BASE_URL}/frames/tx/approval`}
        post_url={`${process.env.BASE_URL}/frames/deposit`}
      >
        Approval
      </Button>,
      <Button
        action='tx'
        target={`${process.env.BASE_URL}/frames/tx/deposit?referrer=${referrer}`}
        post_url={`${process.env.BASE_URL}/frames/deposit/success`}
      >
        Deposit
      </Button>,
    ],
    textInput: "Enter Amount in USDC",
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
