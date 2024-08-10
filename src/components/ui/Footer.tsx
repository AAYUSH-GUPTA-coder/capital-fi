import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between gap-4 p-3 md:px-10 border-t border-neutral-300">
      <span className="flex items-center justify-center gap-3">
        <Image src="/capital.svg" alt="capital" width={20} height={20} />
      </span>
      <p className="text-center text-neutral-600 text-sm">
        &copy; 2024 Capital Finance. All rights reserved.
      </p>
      <span className="hidden md:flex"></span>
    </footer>
  );
}
