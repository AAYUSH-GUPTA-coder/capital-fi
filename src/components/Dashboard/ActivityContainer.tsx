export default function ActivityContainer() {
  return (
    <div className="flex flex-col w-full md:w-[60%] h-[20.9rem] bg-white shadow-lg">
      <span className="flex p-3 text-neutral-700 font-medium border-b border-neutral-100">
        Activity
      </span>
      <div className="flex flex-col gap-2 p-5 items-center justify-center">
        <span className="text-neutral-400">No activity yet</span>
      </div>
    </div>
  );
}
