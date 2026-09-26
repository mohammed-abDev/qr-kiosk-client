import { useState } from "react";
import styles from "./AdminLogin.module.css";
import image from "../../assets/shoping-logo.png";
import API_URL from "../../config/api";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    fetch(`${API_URL}/api/auth/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || "Login failed");
          }

          return data;
        });
      })

      .then((data) => {
        localStorage.setItem("token", data.token);

        onLogin();
      })

      .catch((error) => {
        console.error(error);

        setError(error.message);
      })

      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        {/* LOGO */}
        <div className={styles.loginIcon}><img src={image} alt="Shop Logo" /></div>

        <h1>Admin Login</h1>

        <p className={styles.loginSubtitle}>Manage your kiosk</p>

        {/* ERROR */}
        {error && <div className={styles.loginError}>{error}</div>}

        {/* FORM */}
        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div className={styles.formGroup}>
            <label>Email</label>

            <input
              type="email"
              placeholder="admin@abdukiosk.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className={styles.formGroup}>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            className={styles.loginButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
