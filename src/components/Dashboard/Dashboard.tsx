"use client";
import ActionContainer from "./ActionContainer";
import ActivityContainer from "./ActivityContainer";
import Header from "./Header";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-[94vh] w-full gap-5 pt-32 pb-5 px-5 md:px-32">
      <Header />
      <div className="flex flex-col md:flex-row items-center gap-5 pt-5">
        <ActionContainer />
        <ActivityContainer />
      </div>
    </div>
  );
}
