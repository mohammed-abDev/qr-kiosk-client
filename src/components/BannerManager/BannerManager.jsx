import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./BannerManager.module.css";
import API_URL from "../../config/api";

function BannerManager() {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [editingBanner, setEditingBanner] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteBanner, setDeleteBanner] = useState(null);

  // ======================================
  // FETCH BANNERS
  // ======================================

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

  // ======================================
  // IMAGE CHANGE
  // ======================================

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

  // ======================================
  // REMOVE SELECTED IMAGE
  // ======================================

  const removeSelectedImage = () => {
    setImage(null);
    setPreview("");

    const input = document.getElementById("banner-image-input");

    if (input) {
      input.value = "";
    }
  };

  // ======================================
  // UPLOAD NEW BANNER
  // ======================================

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

  // ======================================
  // START EDIT
  // ======================================

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setImage(null);
    setPreview("");
    setError("");
    setMessage("");

    const input = document.getElementById("banner-edit-input");

    if (input) {
      input.value = "";
    }
  };

  // ======================================
  // CANCEL EDIT
  // ======================================

  const cancelEdit = () => {
    setEditingBanner(null);
    setImage(null);
    setPreview("");

    const input = document.getElementById("banner-edit-input");

    if (input) {
      input.value = "";
    }
  };

  // ======================================
  // EDIT IMAGE CHANGE
  // ======================================

  const handleEditImageChange = (event) => {
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

  // ======================================
  // UPDATE BANNER
  // ======================================

  const handleUpdate = async () => {
    if (!editingBanner) return;

    if (!image) {
      setError("Please select a new banner image.");
      return;
    }

    setActionLoading(editingBanner.id);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("image", image);

      const response = await fetch(
        `${API_URL}/api/banners/${editingBanner.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update banner");
      }

      setMessage("Banner updated successfully.");

      cancelEdit();

      fetchBanners();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================
  // TOGGLE ACTIVE / INACTIVE
  // ======================================

  const handleToggleStatus = async (banner) => {
    setActionLoading(banner.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/banners/${banner.id}/status`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update banner status");
      }

      setMessage(
        banner.is_active ? "Banner deactivated." : "Banner activated.",
      );

      fetchBanners();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================
  // OPEN DELETE CONFIRMATION
  // ======================================

  const handleDelete = (banner) => {
    setDeleteBanner(banner);
    setError("");
    setMessage("");
  };

  // ======================================
  // CONFIRM DELETE
  // ======================================

  const confirmDelete = async () => {
    if (!deleteBanner) return;

    const banner = deleteBanner;

    setActionLoading(banner.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/banners/${banner.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete banner");
      }

      setMessage("Banner deleted successfully.");

      setDeleteBanner(null);

      fetchBanners();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(null);
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

        {/* ======================================
            EDIT BANNER CARD
        ====================================== */}

        {editingBanner && (
          <div className={styles.bannerFormCard}>
            <div className={styles.editHeader}>
              <div>
                <h2>Edit Banner #{editingBanner.id}</h2>

                <p>Choose a new image to replace the current banner.</p>
              </div>

              <button
                type="button"
                className={styles.cancelEditButton}
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>

            <div className={styles.currentBannerPreview}>
              <img
                src={preview || editingBanner.image_url}
                alt={`Banner ${editingBanner.id}`}
              />
            </div>

            <label htmlFor="banner-edit-input" className={styles.uploadArea}>
              <div className={styles.uploadPlaceholder}>
                <div className={styles.uploadIcon}>+</div>

                <strong>Choose New Banner Image</strong>

                <span>JPG, PNG or WEBP • Maximum 5MB</span>
              </div>
            </label>

            <input
              id="banner-edit-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleEditImageChange}
              hidden
            />

            {image && (
              <div className={styles.selectedFile}>
                <div>
                  <strong>{image.name}</strong>

                  <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview("");

                    const input = document.getElementById("banner-edit-input");

                    if (input) {
                      input.value = "";
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            <button
              type="button"
              className={styles.saveButton}
              disabled={actionLoading === editingBanner.id || !image}
              onClick={handleUpdate}
            >
              {actionLoading === editingBanner.id
                ? "Updating..."
                : "Update Banner"}
            </button>
          </div>
        )}

        {/* ======================================
            ADD NEW BANNER
        ====================================== */}

        {!editingBanner && (
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

                    <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
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
        )}

        {/* ======================================
            BANNER LIST
        ====================================== */}

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
                  {/* Image */}
                  <div className={styles.bannerImageWrapper}>
                    <img src={banner.image_url} alt={`Banner ${banner.id}`} />
                  </div>

                  {/* Info */}
                  <div className={styles.bannerItemInfo}>
                    <h3>Banner #{banner.id}</h3>

                    <p>
                      {banner.is_active
                        ? "Visible on customer home"
                        : "Hidden from customer home"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className={styles.bannerStatus}>
                    <span
                      className={
                        banner.is_active ? styles.active : styles.inactive
                      }
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className={styles.bannerActions}>
                    <button
                      type="button"
                      className={styles.statusButton}
                      onClick={() => handleToggleStatus(banner)}
                      disabled={actionLoading === banner.id}
                    >
                      {banner.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => handleEdit(banner)}
                      disabled={actionLoading === banner.id}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDelete(banner)}
                      disabled={actionLoading === banner.id}
                    >
                      {actionLoading === banner.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================
    DELETE CONFIRMATION MODAL
====================================== */}

      {deleteBanner && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalIcon}>
                ⚠️
            </div>

            <h2>Delete Banner?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>Banner #{deleteBanner.id}</strong>?
            </p>

            <span className={styles.deleteWarning}>
              This action cannot be undone.
            </span>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={() => setDeleteBanner(null)}
                disabled={actionLoading === deleteBanner.id}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.modalDeleteButton}
                onClick={confirmDelete}
                disabled={actionLoading === deleteBanner.id}
              >
                {actionLoading === deleteBanner.id
                  ? "Deleting..."
                  : "Delete Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
     
    </div>
  );
}

export default BannerManager;