import { useState, useEffect, useRef } from "react";
import API_URL from "../../config/api";

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
    }, 4000);
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
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 16px",
          border: "none",
          borderRadius: "10px",
          background: loading ? "#b8b8b8" : "#fc6d11",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "14px",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.8 : 1,
          transition: "background 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#ffffff",
                borderRadius: "50%",
                display: "inline-block",
                animation: "pushSetupSpin 0.7s linear infinite",
              }}
            />
            Enabling...
          </>
        ) : (
          <>
            <span aria-hidden="true">🔔</span>
            Enable Push Notifications
          </>
        )}
      </button>

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 100000,
            width: "min(360px, calc(100vw - 32px))",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "15px 16px",
            borderRadius: "12px",
            background: "#ffffff",
            color: "#263238",
            border: `1px solid ${
              message.type === "success" ? "#b7e4c7" : "#fecaca"
            }`,
            borderLeft: `5px solid ${
              message.type === "success" ? "#168447" : "#dc2626"
            }`,
            boxShadow: "0 8px 28px rgba(0,0,0,0.16)",
            fontSize: "14px",
            lineHeight: 1.5,
            overflowWrap: "anywhere",
            animation: "pushSetupToastIn 0.25s ease-out",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "24px",
              height: "24px",
              minWidth: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: message.type === "success" ? "#dcfce7" : "#fee2e2",
              color: message.type === "success" ? "#15803d" : "#b91c1c",
              fontWeight: 800,
            }}
          >
            {message.type === "success" ? "✓" : "!"}
          </span>

          <span style={{ flex: 1, paddingTop: "2px" }}>{message.text}</span>

          <button
            type="button"
            onClick={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }
              setMessage(null);
            }}
            aria-label="Dismiss message"
            style={{
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "20px",
              lineHeight: 1,
              cursor: "pointer",
              padding: "0 2px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes pushSetupSpin {
            to { transform: rotate(360deg); }
          }

          @keyframes pushSetupToastIn {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}
