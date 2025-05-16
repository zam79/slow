"use client";

import { useState, useEffect } from "react";
import styles from "./CookieConsent.module.css";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent was already given
    const consent = localStorage.getItem("cookieConsent");
    if (consent !== "accepted") {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setVisible(false);
    // Initialize analytics or tracking scripts here
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <p>
          We use essential cookies to ensure our site works. By continuing, you
          agree to our use of cookies.
        </p>
        <div className={styles.buttons}>
          <button onClick={acceptCookies} className={styles.acceptButton}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
