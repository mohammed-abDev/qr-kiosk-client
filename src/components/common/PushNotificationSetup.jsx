import { useState, useEffect, useRef } from "react";
import API_URL from "../../config/api";
import styles from "./PushNotificationSetup.module.css";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export default function PushNotificationSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  // Automatically hide messages after 4 seconds.
  function showMessage(text, type = "success") {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setMessage({ text, type });

    timerRef.current = setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, 400000);
  }

  // Clean up the timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function enableNotifications() {
    setLoading(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setMessage(null);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("This browser does not support push notifications.");
      }

      if (!VAPID_PUBLIC_KEY) {
        throw new Error("The frontend VAPID public key is missing.");
      }

      if (!("Notification" in window)) {
        throw new Error("Browser notifications are not supported.");
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again to enable notifications.");
      }

      const response = await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save this device.");
      }

      showMessage("Push notifications enabled successfully!", "success");
    } catch (error) {
      console.error("Push notification setup failed:", error);

      showMessage(error.message || "Could not enable notifications.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.setup}>
        <button
          type="button"
          className={styles.enableButton}
          onClick={enableNotifications}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Enabling...
            </>
          ) : (
            <>
              <svg
                className={styles.bellIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
              Enable Push
            </>
          )}
        </button>
      </div>

      {message && (
        <div
          className={`${styles.toast} ${
            message.type === "error" ? styles.toastError : ""
          }`}
          role={message.type === "error" ? "alert" : "status"}
          aria-live={message.type === "error" ? "assertive" : "polite"}
        >
          <div className={styles.statusIcon} aria-hidden="true">
            {message.type === "error" ? "!" : "✓"}
          </div>

          <div className={styles.toastContent}>
            <p className={styles.toastTitle}>
              {message.type === "error"
                ? "Unable to enable"
                : "Notifications enabled"}
            </p>

            <p className={styles.toastMessage}>{message.text}</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            aria-label="Dismiss notification message"
            onClick={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }

              setMessage(null);
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );

}
