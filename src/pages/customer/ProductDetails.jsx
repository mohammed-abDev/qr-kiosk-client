import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import styles from "./ProductDetails.module.css";
import API_URL from "../../config/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // GET PRODUCT
  // ==============================

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product not found");
        }

        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Product details error:", error);

        setError("Could not load product");

        setLoading(false);
      });
  }, [id]);

  // ==============================
  // GET SHOP
  // ==============================

  useEffect(() => {
    fetch(`${API_URL}/api/shop`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch shop");
        }

        return response.json();
      })
      .then((data) => {
        setShop(data);
      })
      .catch((error) => {
        console.error("Shop error:", error);
      });
  }, []);

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className={styles.customerState}>
        <div className={styles.loadingSpinner}></div>

        <p>Loading product...</p>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error || !product) {
    return (
      <div className={`${styles.customerState} ${styles.errorState}`}>
        <div className={styles.errorIcon}>⚠️</div>

        <h3>Product not found</h3>

        <p>This product may have been removed or is no longer available.</p>

        <button className={styles.retryButton} onClick={() => navigate("/")}>
          Back to Menu
        </button>
      </div>
    );
  }

  // ==============================
  // PRODUCT IMAGE URL
  // ==============================

  const productImageUrl = product.image
    ? `${API_URL}${product.image}`
    : null;

  // ==============================
  // PRODUCT DETAILS
  // ==============================

  return (
    <div className={styles.productDetailsPage}>
      {/* ==============================
                HEADER / IMAGE
            ============================== */}

      <header
        className={styles.detailsHeader}
        style={{
          "--product-image": productImageUrl
            ? `url("${productImageUrl}")`
            : "none",
        }}
      >
        {/* BACK BUTTON */}

        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          aria-label="Back to menu"
        >
          ←
        </button>

        {/* PRODUCT IMAGE */}

        <div className={styles.detailsImage}>
          {productImageUrl ? (
            <img src={productImageUrl} alt={product.name} />
          ) : (
            <span>🛍️</span>
          )}
        </div>
      </header>

      {/* ==============================
                PRODUCT INFORMATION
            ============================== */}

      <main className={styles.detailsContent}>
        {/* CATEGORY */}

        {product.category_name && (
          <span className={styles.categoryName}>{product.category_name}</span>
        )}

        {/* PRODUCT NAME */}

        <h1>{product.name}</h1>

        {/* PRICE */}

        <div className={styles.detailsPrice}>
          {Number(product.price).toFixed(2)}
        </div>

        {/* AVAILABILITY */}

        {product.is_available ? (
          <span className={styles.available}>Available</span>
        ) : (
          <span className={styles.unavailable}>Out of stock</span>
        )}

        {/* DESCRIPTION */}

        {product.description && <p>{product.description}</p>}

        {/* ==============================
                    PRODUCT INFORMATION
                ============================== */}

        <div className={styles.detailsInfo}>
          {/* CATEGORY */}

          <div className={styles.detailsInfoItem}>
            <span>Category</span>

            <strong>{product.category_name || "Other"}</strong>
          </div>

          {/* AVAILABILITY */}

          <div className={styles.detailsInfoItem}>
            <span>Availability</span>

            <strong>
              {product.is_available ? "In stock" : "Out of stock"}
            </strong>
          </div>

          {/* SHOP */}

          <div className={styles.detailsInfoItem}>
            <span>Shop</span>

            <strong>{shop?.name || "Shop"}</strong>
          </div>
        </div>

        {/* ==============================
                    BACK TO MENU
                ============================== */}

        <button
          className={styles.backButtonDetails}
          onClick={() => navigate("/")}
        >
          Back to Menu
        </button>
      </main>
    </div>
  );
}

export default ProductDetails;
