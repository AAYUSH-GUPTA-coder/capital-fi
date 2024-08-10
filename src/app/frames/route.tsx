import { Button } from "frames.js/next";
import { frames } from "./frames";

const handleRequest = frames(async (ctx) => {
  const { searchParams } = new URL(ctx.url);

  const referrer =
    searchParams.get("referrer") ??
    "0x3039e4a4a540F35ae03A09f3D5A122c49566f919";

  return {
    image: "https://i.imgur.com/D7a9GqA.png",
    buttons: [
      <Button
        action='post'
        target={`${process.env.BASE_URL}/frames/deposit?referrer=${referrer}`}
      >
        Deposit
      </Button>,
      <Button action='post' target={`${process.env.BASE_URL}/frames/withdraw`}>
        Withdraw
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
