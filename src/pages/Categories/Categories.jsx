import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./Categories.module.css";
import API_URL from "../../config/api";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const handleHome = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    navigate("/");
  };

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Failed to load categories:", error);
      });
  }, []);

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Browse products by category</p>
        </div>

        <button
          type="button"
          onClick={handleHome}
          className={styles.homeButton}
        >
          🏠
        </button>
      </header>

      {/* CATEGORIES */}
      <main className={styles.content}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={styles.categoryCard}
            type="button"
            onClick={() => navigate(`/categories/${category.id}`)}
          >
            <div className={styles.categoryIcon}>📦</div>

            <div>
              <h2>{category.name}</h2>

              <p>{category.description || "View products"}</p>
            </div>

            <span>→</span>
          </button>
        ))}
      </main>

      {/* BOTTOM NAV */}
      <nav className={styles.bottomNav}>
        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={() => navigate("/")}
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
          onClick={() => navigate("/more")}
        >
          <span>⋯</span>
          <small>More</small>
        </button>
      </nav>
    </div>
  );
}

export default Categories;
