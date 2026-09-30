import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import styles from "./EditProduct.module.css";
import API_URL from "../../config/api";


function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const token = localStorage.getItem("token");

  // ================================
  // LOAD PRODUCT
  // ================================

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product not found.");
        }

        return response.json();
      })
      .then((data) => {
        setProduct(data);

        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(data.price || "");

        setCategoryId(data.category_id ? String(data.category_id) : "");

        setIsAvailable(Boolean(data.is_available));

        if (data.image) {
          setImagePreview(data.image);
        } else {
          setImagePreview("");
        }
      })
      .catch((error) => {
        console.error("Product loading error:", error);
        setError(error.message || "Could not load product.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // ================================
  // LOAD CATEGORIES
  // ================================

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        return response.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error(error);
        setError("Could not load categories.");
      });
  }, []);

  // ================================
  // IMAGE CHANGE
  // ================================

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (!selectedImage) {
      return;
    }

    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowedTypes.includes(selectedImage.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedImage.size > maxSize) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setImage(selectedImage);
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  // ================================
  // VALIDATION
  // ================================

  const validateForm = () => {
    const cleanName = name.trim();

    if (!cleanName) {
      return "Product name is required.";
    }

    if (cleanName.length < 2) {
      return "Product name must be at least 2 characters.";
    }

    if (!price) {
      return "Product price is required.";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return "Price must be greater than 0.";
    }

    if (!categoryId) {
      return "Please select a category.";
    }

    return "";
  };

  // ================================
  // UPDATE PRODUCT
  // ================================

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    const formData = new FormData();

    formData.append("category_id", categoryId);
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", Number(price));
    formData.append("is_available", isAvailable ? "1" : "0");

    if (image) {
      formData.append("image", image);
    }

    fetch(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || "Failed to update product");
          }

          return data;
        });
      })

      .then(() => {
        setNotification({
          message: "Product updated successfully!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message || "Failed to update product.");
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
      <div className={styles.customerState}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading product...</p>
      </div>
    );
  }

  // ================================
  // ERROR
  // ================================

  if (error && !product) {
    return (
      <div className={`${styles.customerState} ${styles.errorState}`}>
        <div className={styles.errorIcon}>⚠️</div>

        <h3>Product not found</h3>

        <p>{error}</p>

        <button
          className={styles.retryButton}
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ================================
  // EDIT PAGE
  // ================================

  return (
    <div className={styles.editProductPage}>
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
      <div className={styles.editProductContainer}>
        {/* BACK BUTTON */}

        <button
          className={styles.backAdminButton}
          onClick={() => navigate("/admin")}
          type="button"
        >
          ← Back
        </button>

        {/* HEADER */}

        <div className={styles.editProductHeader}>
          <h1>Edit Product</h1>

          <p>Update your product information</p>
        </div>

        {/* ERROR */}

        {error && <div className={styles.editProductError}>{error}</div>}

        {/* CARD */}

        <div className={styles.editProductCard}>
          <form onSubmit={handleSubmit}>
            {/* IMAGE */}

            <div className={styles.formGroup}>
              <label>Product Image</label>

              <div className={styles.productImagePreview}>
                {imagePreview ? (
                  <img src={imagePreview} alt={name || "Product"} />
                ) : (
                  <span>📦</span>
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              <small>
                Choose a new image only if you want to replace the current
                image. JPG, PNG or WEBP • Maximum 5MB
              </small>
            </div>

            {/* NAME */}

            <div className={styles.formGroup}>
              <label>Product Name</label>

              <input
                type="text"
                placeholder="Example: Coca-Cola"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className={styles.formGroup}>
              <label>Description</label>

              <textarea
                placeholder="Example: 500ml Coca-Cola"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {/* PRICE */}

            <div className={styles.formGroup}>
              <label>Price</label>

              <input
                type="number"
                placeholder="Example: 35"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            {/* CATEGORY */}

            <div className={styles.formGroup}>
              <label>Category</label>

              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AVAILABILITY */}

            <div className={styles.formGroup}>
              <label>Availability</label>

              <div className={styles.availabilityOptions}>
                <button
                  type="button"
                  className={
                    isAvailable
                      ? `${styles.availabilityOption} ${styles.activeAvailable}`
                      : styles.availabilityOption
                  }
                  onClick={() => setIsAvailable(true)}
                >
                  ✓ Available
                </button>

                <button
                  type="button"
                  className={
                    !isAvailable
                      ? `${styles.availabilityOption} ${styles.activeUnavailable}`
                      : styles.availabilityOption
                  }
                  onClick={() => setIsAvailable(false)}
                >
                  ✕ Out of Stock
                </button>
              </div>
            </div>

            {/* SAVE */}

            <button
              className={styles.saveProductButton}
              type="submit"
              disabled={saving}
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
