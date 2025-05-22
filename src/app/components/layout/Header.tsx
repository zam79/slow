"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-[1000]">
      <div className="max-w-5xl mx-auto flex justify-start items-start px-6 py-4">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-2xl font-bold text-gradient-logo shadow-sm">
            Drugbit.info
          </Link>
          <span className="text-sm text-gray-500">Anesthesia & ICU Essentials</span>
        </div>
      </div>
    </header>
  );
}
