import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="bg-gradient-footer text-white text-center py-6 px-4 text-sm shadow-inner relative sm:py-4"
      role="contentinfo"
    >
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4 sm:flex-col sm:gap-3">
        <p>© 2025 Drugbit.info. All rights reserved.</p>
        <ul className="flex flex-row justify-end items-center list-none m-0 p-0 gap-2 sm:flex-col sm:gap-3">
          <li>
            <Link
              href="/about"
              className="text-white px-3 py-1.5 rounded-md text-sm font-semibold no-underline text-center transition-all duration-200 ease-in-out hover:bg-white/20 hover:-translate-y-px hover:shadow-md focus:outline-none focus:border-2 focus:border-teal-400 focus:shadow-[0_0_8px_rgba(45,212,191,0.3)] sm:px-4 sm:py-2 sm:text-base"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="text-white px-3 py-1.5 rounded-md text-sm font-semibold no-underline text-center transition-all duration-200 ease-in-out hover:bg-white/20 hover:-translate-y-px hover:shadow-md focus:outline-none focus:border-2 focus:border-teal-400 focus:shadow-[0_0_8px_rgba(45,212,191,0.3)] sm:px-4 sm:py-2 sm:text-base"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-white px-3 py-1.5 rounded-md text-sm font-semibold no-underline text-center transition-all duration-200 ease-in-out hover:bg-white/20 hover:-translate-y-px hover:shadow-md focus:outline-none focus:border-2 focus:border-teal-400 focus:shadow-[0_0_8px_rgba(45,212,191,0.3)] sm:px-4 sm:py-2 sm:text-base"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
