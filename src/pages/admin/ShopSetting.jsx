import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./ShopSettings.module.css";
import API_URL from "../../config/api";

function ShopSettings() {
  const navigate = useNavigate();

  const [shopName, setShopName] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const token = localStorage.getItem("token");

  // ================================
  // GET CURRENT SHOP
  // ================================

  useEffect(() => {
    fetch(`${API_URL}/api/shop`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load shop information");
        }

        return response.json();
      })
      .then((data) => {
        setShopName(data.name || "");

        if (data.logo) {
          setLogoPreview(`${API_URL}${data.logo}`);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);

        setError("Failed to load shop information");
        setLoading(false);
      });
  }, []);

  // ================================
  // SELECT LOGO
  // ================================

  const handleLogoChange = (event) => {
    const selectedLogo = event.target.files[0];

    if (!selectedLogo) {
      return;
    }

    setError("");

    setLogo(selectedLogo);

    setLogoPreview(URL.createObjectURL(selectedLogo));
  };

  // ================================
  // SAVE SHOP
  // ================================

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSaving(true);

    const formData = new FormData();

    formData.append("name", shopName.trim());

    // Upload logo only if a new one was selected
    if (logo) {
      formData.append("logo", logo);
    }

    fetch(`${API_URL}/api/shop`, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || "Failed to update shop");
          }

          return data;
        });
      })
      .then(() => {
        setNotification({
          message: "Shop information updated successfully!",
          type: "success",
        });

        setTimeout(() => {
          setNotification({
            message: "",
            type: "",
          });
        }, 2500);
      })
      .catch((error) => {
        console.error(error);

        setNotification({
          message: error.message || "Failed to update shop information.",
          type: "error",
        });

        setTimeout(() => {
          setNotification({
            message: "",
            type: "",
          });
        }, 3000);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className={styles.shopSettingsPage}>
        <div className={styles.shopSettingsCard}>
          <div className={styles.loadingSpinner}></div>

          <p>Loading shop information...</p>
        </div>
      </div>
    );
  }

  // ================================
  // PAGE
  // ================================

  return (
    <div className={styles.shopSettingsPage}>
      {notification.message && (
        <div
          className={`${styles.adminNotification} ${
            notification.type === "success" ? styles.success : styles.error
          }`}
        >
          <span>{notification.type === "success" ? "✓" : "!"}</span>

          <p>{notification.message}</p>
        </div>
      )}
      <div className={styles.shopSettingsCard}>
        {/* BACK */}

        <button
          className={styles.backAdminButton}
          onClick={() => navigate("/admin")}
          type="button"
        >
          ← Back
        </button>

        {/* HEADER */}

        <div className={styles.shopSettingsHeader}>
          <div className={styles.shopSettingsIcon}>🏪</div>

          <h1>Shop Settings</h1>

          <p>Manage your shop information</p>
        </div>

        {/* ERROR */}

        {error && <div className={styles.shopSettingsError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* LOGO */}

          <div className={styles.shopLogoSection}>
            <label>Shop Logo</label>

            <div className={styles.shopLogoPreview}>
              {logoPreview ? (
                <img src={logoPreview} alt="Shop logo" />
              ) : (
                <span>🏪</span>
              )}
            </div>

            <input type="file" accept="image/*" onChange={handleLogoChange} />

            <small>Choose an image for your shop logo.</small>
          </div>

          {/* SHOP NAME */}

          <div className={styles.formGroup}>
            <label>Shop Name</label>

            <input
              type="text"
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
              placeholder="Example: Abdu Kiosk"
              required
            />
          </div>

          {/* SAVE */}

          <button className={styles.saveButton} type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ShopSettings;
