import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import styles from "./CategoryProducts.module.css";
import API_URL from "../../config/api";
import Image from "../../assets/shoping-logo.png";

function CategoryProducts() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myListCount, setMyListCount] = useState(0);

  // ==========================================
  // MY LIST COUNT
  // ==========================================

  useEffect(() => {
    const loadMyList = () => {
      try {
        const savedList = localStorage.getItem("abduMartCart");
        const list = savedList ? JSON.parse(savedList) : [];

        const count = list.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        );

        setMyListCount(count);
      } catch {
        setMyListCount(0);
      }
    };

    loadMyList();

    window.addEventListener("storage", loadMyList);

    return () => {
      window.removeEventListener("storage", loadMyList);
    };
  }, []);

  // ==========================================
  // LOAD CATEGORY + PRODUCTS
  // ==========================================

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true);
      setError("");

      try {
        
        const categoryResponse = await fetch(`${API_URL}/api/categories`);

        if (!categoryResponse.ok) {
          throw new Error("Failed to load categories");
        }

        const categories = await categoryResponse.json();

        const selectedCategory = categories.find(
          (item) => String(item.id) === String(id),
        );

        if (!selectedCategory) {
          throw new Error("Category not found");
        }

        setCategory(selectedCategory);

    // Load products and filter by category
        const productResponse = await fetch(`${API_URL}/api/products`);

        if (!productResponse.ok) {
          throw new Error("Failed to load products");
        }

        const productData = await productResponse.json();

        const categoryProducts = productData.filter(
          (product) =>
            String(product.category_id) === String(id) ||
            String(product.categoryId) === String(id) ||
            String(product.category?.id) === String(id),
        );

        setProducts(categoryProducts);
      } catch (error) {
        console.error("Category products error:", error);

        setError(
          error.message === "Category not found"
            ? "Category not found."
            : "Could not load products.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, [id]);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleHome = () => {
    navigate("/");

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  const handleCategories = () => {
    navigate("/categories");
  };

  const handleMyList = () => {
    navigate("/");
  };

  const handleMore = () => {
    navigate("/more");
  };

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    window.location.reload();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className={styles.page}>
      {/* ======================================
          CONTENT
      ====================================== */}
       {/* BACK BUTTON */}
      

      <main className={styles.content}>
              <button
                className={styles.backButton}
                onClick={() => navigate(-1)}
                aria-label="Back to menu"
              >
                ←
              </button>
        {/* CATEGORY HERO */}

        <section className={styles.categoryHero}>
          <span className={styles.eyebrow}>ABDU MART</span>

          <div className={styles.heroRow}>
            <div>
              <h1>{category?.name || "Category"}</h1>

              <p>
                {category?.description || "Explore products in this category."}
              </p>
            </div>

            <div className={styles.heroIcon}>▦</div>
          </div>
        </section>

        {/* PRODUCTS */}

        <section className={styles.productsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span>PRODUCTS</span>

              <h2>{category?.name || "Products"}</h2>
            </div>

            {!loading && !error && (
              <small>
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </small>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div className={styles.stateCard}>
              <div className={styles.loadingSpinner}></div>

              <h3>Loading products...</h3>

              <p>Getting the latest products for you.</p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className={`${styles.stateCard} ${styles.errorCard}`}>
              <div className={styles.stateIcon}>⚠️</div>

              <h3>Something went wrong</h3>

              <p>{error}</p>

              <button
                type="button"
                className={styles.retryButton}
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loading && !error && products.length === 0 && (
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>🛍️</div>

              <h3>No products yet</h3>

              <p>There are no products in this category right now.</p>

              <button
                type="button"
                className={styles.browseButton}
                onClick={handleCategories}
              >
                Browse Categories
              </button>
            </div>
          )}

          {/* PRODUCT GRID */}

          {!loading && !error && products.length > 0 && (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={styles.productCard}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className={styles.productImage}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>🛍️</span>
                    )}

                    {!product.is_available && (
                      <span className={styles.outOfStock}>Out of stock</span>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <span>{category?.name || "Product"}</span>

                    <h3>{product.name}</h3>

                    {product.description && <p>{product.description}</p>}

                    <div className={styles.productBottom}>
                      <strong>{Number(product.price).toFixed(2)} ETB</strong>

                      <span>→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* BOTTOM BRAND */}

        <section className={styles.bottomInfo}>
          <div className={styles.bottomLogo}>
            <img src={Image} alt="Abdu Mart" />
          </div>

          <div>
            <strong>Abdu Mart</strong>
            <p>Your local digital shelf</p>
          </div>
        </section>
      </main>

      {/* ======================================
          BOTTOM NAV
      ====================================== */}

      <nav className={styles.bottomNav}>
        <button type="button" onClick={handleHome}>
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button
          type="button"
          className={styles.active}
          onClick={handleCategories}
        >
          <span>▦</span>
          <small>Categories</small>
        </button>

        <button type="button" onClick={handleMyList}>
          <span>🛒</span>

          {myListCount > 0 && <b className={styles.navBadge}>{myListCount}</b>}

          <small>My List</small>
        </button>

        <button type="button" onClick={handleMore}>
          <span>⋯</span>
          <small>More</small>
        </button>
      </nav>
    </div>
  );
}

export default CategoryProducts;
