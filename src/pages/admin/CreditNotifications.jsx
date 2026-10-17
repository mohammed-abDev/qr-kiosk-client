import { useCallback, useEffect, useState } from "react";
import API_URL from "../../config/api";
import styles from "./CreditNotifications.module.css";

const CreditNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again to view notifications.");
      }

      const response = await fetch(`${API_URL}/api/credit/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  fetchNotifications();

  const intervalId = setInterval(() => {
    fetchNotifications();
  }, 25000);

  return () => {
    clearInterval(intervalId);
  };
}, [fetchNotifications]);

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "sales") return Boolean(item.transaction_id);
    if (filter === "payments") return Boolean(item.payment_id);
    return true;
  });

  const salesCount = notifications.filter((item) => item.transaction_id).length;

  const paymentsCount = notifications.filter((item) => item.payment_id).length;

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-ET", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>ABDU MART / MANAGEMENT</span>
          <h1>Credit notifications</h1>
          <p>Keep track of customer credit sales and repayments.</p>
        </div>

        <button
          className={styles.refreshButton}
          onClick={fetchNotifications}
          disabled={loading}
          type="button"
        >
          <span aria-hidden="true">↻</span>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <span className={styles.statIcon}>▤</span>
          <div>
            <p>Total notifications</p>
            <strong>{notifications.length}</strong>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statIcon}>↗</span>
          <div>
            <p>Credit sales</p>
            <strong>{salesCount}</strong>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statIcon}>✓</span>
          <div>
            <p>Repayments</p>
            <strong>{paymentsCount}</strong>
          </div>
        </article>
      </section>

      <section className={styles.activityPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Recent activity</h2>
            <p>Latest recorded credit events</p>
          </div>

          <span className={styles.liveLabel}>
            <span className={styles.liveDot} />
            Dashboard
          </span>
        </div>

        <div className={styles.filters}>
          <button
            type="button"
            className={filter === "all" ? styles.activeFilter : ""}
            onClick={() => setFilter("all")}
          >
            All activity
          </button>

          <button
            type="button"
            className={filter === "sales" ? styles.activeFilter : ""}
            onClick={() => setFilter("sales")}
          >
            Credit sales
          </button>

          <button
            type="button"
            className={filter === "payments" ? styles.activeFilter : ""}
            onClick={() => setFilter("payments")}
          >
            Repayments
          </button>
        </div>

        {loading ? (
          <div className={styles.stateMessage}>
            <span className={styles.spinner} />
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className={styles.stateMessage}>
            <span className={styles.stateIcon}>!</span>
            <h3>Couldn't load notifications</h3>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={fetchNotifications}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.stateMessage}>
            <span className={styles.emptyIcon}>♧</span>
            <h3>No notifications yet</h3>
            <p>
              Credit sales and repayments will appear here after they are
              recorded.
            </p>
          </div>
        ) : (
          <div className={styles.notificationList}>
            {filteredNotifications.map((item) => {
              const isPayment = Boolean(item.payment_id);

              return (
                <article className={styles.notification} key={item.id}>
                  <div
                    className={`${styles.eventIcon} ${
                      isPayment ? styles.paymentIcon : styles.saleIcon
                    }`}
                  >
                    {isPayment ? "✓" : "↗"}
                  </div>

                  <div className={styles.notificationContent}>
                    <div className={styles.notificationTop}>
                      <h3>
                        {isPayment ? "Customer repayment" : "Credit sale"}
                      </h3>

                      <span className={styles.recordedBadge}>Recorded</span>
                    </div>

                    <p className={styles.message}>{item.message}</p>

                    <div className={styles.metadata}>
                      <span>Customer #{item.customer_id ?? "—"}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default CreditNotifications;
