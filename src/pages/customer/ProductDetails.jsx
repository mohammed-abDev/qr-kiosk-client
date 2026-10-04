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

  // =====================================================
  // MY LIST
  // =====================================================

  const [myList, setMyList] = useState(() => {
    try {
      const savedList = localStorage.getItem("abduMartCart");

      return savedList ? JSON.parse(savedList) : [];
    } catch {
      return [];
    }
  });

  // =====================================================
  // SAVE MY LIST
  // =====================================================

  useEffect(() => {
    localStorage.setItem("abduMartCart", JSON.stringify(myList));
  }, [myList]);

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

  // =====================================================
  // MY LIST HELPERS
  // =====================================================

  const existingItem = product
    ? myList.find((item) => item.id === product.id)
    : null;

  const isInMyList = Boolean(existingItem);

  // =====================================================
  // ADD TO MY LIST
  // =====================================================

  const addToMyList = () => {
    if (!product || !product.is_available) {
      return;
    }

    setMyList((currentList) => {
      const existing = currentList.find((item) => item.id === product.id);

      if (existing) {
        return currentList.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentList,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = () => {
    if (!product) return;

    setMyList((currentList) =>
      currentList.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = () => {
    if (!product) return;

    setMyList((currentList) =>
      currentList
        .map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // =====================================================
  // MY LIST COUNT
  // =====================================================

  const myListCount = myList.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

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

  const productImageUrl = product.image || null;

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
            <img src={productImageUrl} alt={product?.name} />
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
        {/* =================================================
    MY LIST ACTION
================================================= */}

        <section className={styles.myListAction}>
          <div className={styles.myListActionHeader}>
            <span className={styles.myListLabel}>MY LIST</span>

            <h2>Remember this product</h2>

            <p>Keep it on your list while you continue shopping.</p>
          </div>

          {!product.is_available ? (
            <button
              type="button"
              className={styles.disabledListButton}
              disabled
            >
              Out of Stock
            </button>
          ) : !isInMyList ? (
            <button
              type="button"
              className={styles.addListButton}
              onClick={addToMyList}
            >
              <span className={styles.addIcon}>🛒</span>

              <span>Add to My List</span>
            </button>
          ) : (
            <div className={styles.quantityBox}>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={decreaseQuantity}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <div className={styles.quantityCenter}>
                <strong>✓ In My List</strong>

                <span>
                  {existingItem.quantity}{" "}
                  {existingItem.quantity === 1 ? "item" : "items"}
                </span>
              </div>

              <button
                type="button"
                className={styles.quantityButton}
                onClick={increaseQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </section>

        {/* ==============================
            BACK TO MENU
          ============================== */}

        <button
          className={styles.backButtonDetails}
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </main>
    </div>
  );
}

export default ProductDetails;
