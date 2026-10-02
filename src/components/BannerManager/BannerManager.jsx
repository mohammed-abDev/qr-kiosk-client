import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./BannerManager.module.css";
import  API_URL  from "../../config/api";

function BannerManager() {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchBanners = () => {
    setFetching(true);

    fetch(`${API_URL}/api/banners`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch banners");
        }

        return response.json();
      })
      .then((data) => {
        setBanners(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load banners");
      })
      .finally(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    setImage(null);
    setPreview("");

    const input = document.getElementById("banner-image-input");

    if (input) {
      input.value = "";
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!image) {
      setError("Please select a banner image.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("image", image);

      const response = await fetch(`${API_URL}/api/banners`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload banner");
      }

      setMessage("Banner uploaded successfully.");

      removeSelectedImage();
      fetchBanners();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bannerManagerPage}>
      <div className={styles.bannerManagerContainer}>
        {/* Back Button */}
        <button
          className={styles.backAdminButton}
          onClick={() => navigate("/admin")}
        >
          ← Back 
        </button>

        {/* Header */}
        <div className={styles.bannerManagerHeader}>
          <h1>Banner Manager</h1>

          <p>Manage promotional banners displayed on the customer home page.</p>
        </div>

        {/* Notifications */}
        {message && (
          <div className={`${styles.adminNotification} ${styles.success}`}>
            <span>✓</span>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className={`${styles.adminNotification} ${styles.error}`}>
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        {/* Upload Card */}
        <div className={styles.bannerFormCard}>
          <h2>Add New Banner</h2>

          <form onSubmit={handleUpload}>
            <label htmlFor="banner-image-input" className={styles.uploadArea}>
              {preview ? (
                <img
                  src={preview}
                  alt="Banner preview"
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <div className={styles.uploadIcon}>+</div>

                  <strong>Choose Banner Image</strong>

                  <span>JPG, PNG or WEBP • Maximum 5MB</span>
                </div>
              )}
            </label>

            <input
              id="banner-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              hidden
            />

            {image && (
              <div className={styles.selectedFile}>
                <div>
                  <strong>{image.name}</strong>

                  <span>{(image.size / 1024 / 1024).toFixed(5)} MB</span>
                </div>

                <button type="button" onClick={removeSelectedImage}>
                  Remove
                </button>
              </div>
            )}

            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading || !image}
            >
              {loading ? "Uploading..." : "Upload Banner"}
            </button>
          </form>
        </div>

        {/* Banner List */}
        <div className={styles.bannerListCard}>
          <div className={styles.bannerListHeader}>
            <h2>Current Banners</h2>

            <span>{banners.length}</span>
          </div>

          {fetching ? (
            <div className={styles.message}>Loading banners...</div>
          ) : banners.length === 0 ? (
            <div className={styles.message}>No banners added yet.</div>
          ) : (
            <div className={styles.bannerList}>
              {banners.map((banner) => (
                <div key={banner.id} className={styles.bannerItem}>
                  <div className={styles.bannerImageWrapper}>
                    <img src={banner.image_url} alt={`Banner ${banner.id}`} />
                  </div>

                  <div className={styles.bannerItemInfo}>
                    <h3>Banner #{banner.id}</h3>

                    <p>Added banner</p>
                  </div>

                  <div className={styles.bannerStatus}>
                    <span
                      className={
                        banner.is_active ? styles.active : styles.inactive
                      }
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BannerManager;
