import { useEffect, useState } from "react";
import socket from "../../config/socket";

function SocketTest() {
  const [status, setStatus] = useState("Connecting...");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleConnect = () => {
      setStatus("Connected successfully");
    };

    const handleDisconnect = () => {
      setStatus("Disconnected");
    };

    const handleNotification = (notification) => {
      console.log("Received credit notification:", notification);

      setNotifications((previous) => [notification, ...previous]);
    };

    const handleError = (error) => {
      console.error(error.message);
      setStatus("Connection failed");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("credit:notification", handleNotification);

    if (!socket.connected) {
      socket.connect();
    } else {
      setStatus("Connected successfully");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("credit:notification", handleNotification);
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h2>Abdu Mart — Real-Time Notification Test</h2>

      <p>Connection status: {status}</p>

      <h3>Received Notifications: {notifications.length}</h3>

      {notifications.length === 0 ? (
        <p>No notifications received yet.</p>
      ) : (
        notifications.map((item, index) => (
          <div
            key={item.id ?? `${item.type}-${index}`}
            style={{
              padding: 12,
              marginBottom: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          >
            <strong>{item.type}</strong>
            <p>{item.message}</p>
            <small>{item.createdAt}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default SocketTest;
