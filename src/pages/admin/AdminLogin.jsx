import { useState } from "react";
import styles from "./AdminLogin.module.css";
import image from "../../assets/shoping-logo.png";
import API_URL from "../../config/api";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        <div className={styles.loginIcon}>
          <img src={image} alt="Shop Logo" />
        </div>

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
              placeholder="example@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className={styles.formGroup}>
            <label>Password</label>

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  /* Eye Off */
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8-0.5 1.5-1.4 2.9-2.5 4" />
                    <path d="M6.6 6.6C4.8 7.8 3.5 9.5 2 12c1.3 4 5 8 10 8 1.7 0 3.2-.4 4.5-1" />
                  </svg>
                ) : (
                  /* Eye */
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
