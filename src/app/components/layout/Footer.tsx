"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="bg-gradient-footer text-white text-center py-3 px-4 text-sm shadow-inner relative"
      role="contentinfo"
    >
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <p>© 2025 Drugbit.info. All rights reserved.</p>
        <ul className="flex flex-row justify-end items-center list-none m-0 p-0 gap-2">
          <li>
            <Link
              href="/about"
              className="text-white px-3 py-1 rounded-md text-sm font-semibold no-underline text-center transition-all duration-200 ease-in-out hover:bg-white/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-30"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="text-white px-3 py-1 rounded-md text-sm font-semibold no-underline text-center transition-all duration-200 ease-in-out hover:bg-white/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-30"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-white px-3 py-1 rounded-md text-sm font-semibold no-underline text-center transition-all duration-200 ease-in-out hover:bg-white/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-30"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
