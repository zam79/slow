"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent !== "accepted") {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-800 text-white p-4 z-[1000] shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 flex-1 min-w-[250px]">
          We use essential cookies to ensure our site works. By continuing, you
          agree to our use of cookies.
        </p>
        <div className="flex gap-4">
          <button
            onClick={acceptCookies}
            className="bg-white text-blue-800 border-none px-6 py-2 rounded cursor-pointer font-semibold transition-all duration-200 ease-in-out hover:bg-gray-100 hover:-translate-y-px"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
