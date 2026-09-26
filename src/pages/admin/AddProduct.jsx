import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./AddProduct.module.css";
import API_URL from "../../config/api";

function AddProduct({ onProductAdded }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

   const [notification, setNotification] = useState({
      message: "",
      type: "",
    });

  const token = localStorage.getItem("token");

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
        setError("Could not load categories");
      });
  }, []);

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

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("shop_id", "1");
    formData.append("category_id", categoryId);
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", Number(price));
    formData.append("is_available", isAvailable ? 1 : 0);

    if (image) {
      formData.append("image", image);
    }

    fetch(`${API_URL}/api/products`, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || "Failed to add product");
          }

          return data;
        });
      })
      .then(() => {
        setNotification({
          message: "Product added successfully!",
          type: "success",
        });

        if (onProductAdded) {
          onProductAdded();
        }

        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      })

      .catch((error) => {
        console.error(error);
        setError(error.message || "Failed to add product.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.addProductPage}>
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
      <div className={styles.addProductContainer}>
        <button
          className={styles.backAdminButton}
          onClick={() => navigate("/admin")}
          type="button"
        >
          ← Back
        </button>

        <div className={styles.addProductHeader}>
          <h1>
            Add <span>Product</span>
          </h1>
          <p>Add a new product to your kiosk</p>
        </div>

        {error && <div className={styles.addProductError}>{error}</div>}

        <div className={styles.addProductCard}>
          <form onSubmit={handleSubmit}>
            {/* PRODUCT IMAGE */}
            <div className={styles.formGroup}>
              <label>Product Image</label>

              <div className={styles.productImagePreview}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" />
                ) : (
                  <span>📦</span>
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              <small>JPG, PNG or WEBP • Maximum 5MB</small>
            </div>

            {/* PRODUCT NAME */}
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

            {/* SAVE BUTTON */}
            <button
              className={styles.saveProductButton}
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
