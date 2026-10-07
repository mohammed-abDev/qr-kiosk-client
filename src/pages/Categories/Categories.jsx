import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./Categories.module.css";
import API_URL from "../../config/api";
import Image from "../../assets/shoping-logo.png";

function Categories() {
  const navigate = useNavigate();

  // =========================================
  // LODING & CATEGORY
  // =========================================
  
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // MY LIST COUNT
  // ================================

  const [myListCount, setMyListCount] = useState(0);

  useEffect(() => {
    const loadMyListCount = () => {
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

    loadMyListCount();

    window.addEventListener("storage", loadMyListCount);

    return () => {
      window.removeEventListener("storage", loadMyListCount);
    };
  }, []);

  // ================================
  // NAVIGATION
  // ================================

  const handleHome = () => {
    navigate("/");

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  const handleMyList = () => {
    // Current My List is handled from Home
    navigate("/");
  };

  const handleMore = () => {
    navigate("/more");
  };

  // ================================
  // LOAD CATEGORIES
  // ================================

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        return response.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load categories:", error);
        setError("Could not load categories.");
        setLoading(false);
      });
  }, []);

  // ================================
  // CATEGORY ICON
  // ================================

  const getCategoryIcon = (name = "") => {
    const category = name.toLowerCase();

    if (
      category.includes("snack") ||
      category.includes("biscuit") ||
      category.includes("candy")
    ) {
      return "🍿";
    }

    if (
      category.includes("drink") ||
      category.includes("water") ||
      category.includes("juice")
    ) {
      return "🥤";
    }

    if (
      category.includes("food") ||
      category.includes("grain") ||
      category.includes("rice")
    ) {
      return "🍲";
    }

    if (
      category.includes("dairy") ||
      category.includes("milk") ||
      category.includes("cheese")
    ) {
      return "🥛";
    }

    if (category.includes("bakery") || category.includes("bread")) {
      return "🍞";
    }

    if (category.includes("household") || category.includes("cleaning")) {
      return "⌂";
    }

    return "▦";
  };

  return (
    <div className={styles.page}>
     

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className={styles.content}>
        {/* PAGE INTRO */}

        <section className={styles.pageIntro}>
          <div>
            <span className={styles.pageEyebrow}>ABDU MART</span>

            <h1>Categories</h1>

            <p>Explore products by category and find what you need quickly.</p>
          </div>

          <div className={styles.introIcon}>▦</div>
        </section>


        {/* ==================================================
            CATEGORY SECTION
        ================================================== */}

        <section className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <div>
              <span>EXPLORE</span>
              <h2>Shop by Category</h2>
            </div>

            {!loading && !error && (
              <small>
                {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}
              </small>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div className={styles.stateCard}>
              <div className={styles.loadingSpinner}></div>
              <h3>Loading categories...</h3>
              <p>Getting the latest categories for you.</p>
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
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loading && !error && categories.length === 0 && (
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>▦</div>

              <h3>No categories yet</h3>

              <p>Products will appear here when categories are added.</p>
            </div>
          )}

          {/* CATEGORY LIST */}

          {!loading && !error && categories.length > 0 && (
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={styles.categoryCard}
                  onClick={() => navigate(`/categories/${category.id}`)}
                >
                  <div className={styles.categoryIcon}>
                    {getCategoryIcon(category.name)}
                  </div>

                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryNumber}>CATEGORY</span>

                    <h3>{category.name}</h3>

                    <p>{category.description || "View products"}</p>
                  </div>

                  <span className={styles.categoryArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ==================================================
            BOTTOM BRAND CARD
        ================================================== */}

        <section className={styles.bottomInfo}>
          <div className={styles.bottomInfoLogo}>
            <img src={Image} alt="Abdu Mart" />
          </div>

          <div>
            <strong>Abdu Mart</strong>
            <p>Your local digital shelf</p>
          </div>

          <button type="button" onClick={handleHome} aria-label="Go to home">
            →
          </button>
        </section>
      </main>

      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <nav className={styles.bottomNav}>
        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={handleHome}
        >
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button
          type="button"
          className={`${styles.bottomNavItem} ${styles.active}`}
          onClick={() => navigate("/categories")}
        >
          <span>▦</span>
          <small>Categories</small>
        </button>

        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={handleMyList}
        >
          <span>🛒</span>

          {myListCount > 0 && <b className={styles.navBadge}>{myListCount}</b>}

          <small>My List</small>
        </button>

        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={handleMore}
        >
          <span>⋯</span>
          <small>More</small>
        </button>
      </nav>
    </div>
  );
}

export default Categories;
