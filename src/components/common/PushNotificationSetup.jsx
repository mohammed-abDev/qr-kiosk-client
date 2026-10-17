import { useState } from "react";
import API_URL from "../../config/api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
console.log(
  "VAPID public key loaded:",
  Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY)
);

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export default function PushNotificationSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function enableNotifications() {
    setLoading(true);
    setMessage("");

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

      setMessage("Push notifications enabled on this device.");
    } catch (error) {
      console.error("Push notification setup failed:", error);
      setMessage(error.message || "Could not enable notifications.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: 10,
          background: "#14562e",
          color: "#fff",
          fontWeight: 600,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Enabling..." : "Enable Push Notifications"}
      </button>

      {message && (
        <span role="status" style={{ fontSize: 13 }}>
          {message}
        </span>
      )}
    </div>
  );
}
