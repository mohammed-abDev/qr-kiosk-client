import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./AdminDashboard.module.css";
import image from "../../assets/shoping-logo.png";
import API_URL from "../../config/api";

function ProductImage({ product }) {
  const [imageError, setImageError] = useState(false);

  if (!product.image || imageError) {
    return <div className={styles.adminProductImagePlaceholder}>📦</div>;
  }

  return (
    <img
      className={styles.adminProductImage}
      src={`${API_URL}${product.image}`}
      alt={product.name}
      onError={() => setImageError(true)}
    />
  );
}

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteProductName, setDeleteProductName] = useState("");

  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [sortOption, setSortOption] = useState("default");

  const token = localStorage.getItem("token");

  // ========================
  // NOTIFICATION
  // ========================

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification({
        message: "",
        type: "",
      });
    }, 3000);
  };

  // =========================
  // GET PRODUCTS
  // =========================

  const fetchProducts = (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    fetch(`${API_URL}/api/products?_=${Date.now()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((error) => {
        console.error("Products error:", error);

        setError("Could not load products.");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  // =========================
  // GET CATEGORIES
  // =========================

  const fetchCategories = () => {
    fetch(`${API_URL}/api/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        return response.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Categories error:", error);
      });
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // =========================
  // SEARCH + CATEGORY FILTER
  // =========================

  const filteredProducts = products.filter((product) => {
    const searchText = productSearch.trim().toLowerCase();

    const productName = product.name?.toLowerCase() || "";

    const productDescription = product.description?.toLowerCase() || "";

    const productCategory = product.category_name?.toLowerCase() || "";

    const matchesSearch =
      productName.includes(searchText) ||
      productDescription.includes(searchText) ||
      productCategory.includes(searchText);

    const matchesCategory =
      selectedCategory === "All" || product.category_name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // =========================
  // SORTING
  // =========================

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "name-asc") {
      return a.name.localeCompare(b.name);
    }

    if (sortOption === "name-desc") {
      return b.name.localeCompare(a.name);
    }

    if (sortOption === "price-low") {
      return Number(a.price) - Number(b.price);
    }

    if (sortOption === "price-high") {
      return Number(b.price) - Number(a.price);
    }

    if (sortOption === "available") {
      return Number(b.is_available) - Number(a.is_available);
    }

    if (sortOption === "out-of-stock") {
      return Number(a.is_available) - Number(b.is_available);
    }

    return 0;
  });

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setProductSearch("");
    setSelectedCategory("All");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");

    onLogout();
  };

  // =========================
  // TOGGLE AVAILABILITY
  // =========================

  const toggleAvailability = (product) => {
    fetch(`${API_URL}/api/products/${product.id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        is_available: !product.is_available ? 1 : 0,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update product");
        }

        return response.json();
      })
      .then(() => {
        showNotification(
          product.is_available
            ? "Product marked as out of stock."
            : "Product is now available.",
          "success",
        );

        fetchProducts();
      })
      .catch((error) => {
        console.error(error);

        showNotification("Could not update product.", "error");
      });
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDelete = (id) => {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    setDeleteProductId(id);
    setDeleteProductName(product.name);
  };

  const confirmDelete = () => {
    if (!deleteProductId) return;

    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/products/${deleteProductId}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || "Failed to delete product");
          }

          return data;
        });
      })
      .then(() => {
        showNotification("Product deleted successfully.", "success");

        setDeleteProductId(null);
        setDeleteProductName("");

        fetchProducts();
      })
      .catch((error) => {
        console.error(error);

        showNotification(error.message || "Failed to delete product.", "error");
      });
  };

  const cancelDelete = () => {
    setDeleteProductId(null);
    setDeleteProductName("");
  };

  // =========================
  // STATISTICS
  // =========================

  const availableProducts = products.filter(
    (product) => product.is_available,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => !product.is_available,
  ).length;

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className={styles.adminDashboard}>
      {/* =========================
          NOTIFICATION
      ========================= */}

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

      {/* =========================
          HEADER
      ========================= */}

      <header className={styles.adminHeader}>
        <div className={styles.adminBrand}>
          <div className={styles.adminBrandIcon}>
            <img src={image} alt="Shop Logo" />
          </div>

          {/* <div className={styles.adminBrandIcon}>🏪</div> */}

          <div>
            <h1>Abdu Mart</h1>

            <p>Admin Dashboard</p>
          </div>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className={styles.adminContainer}>
        {/* =========================
            WELCOME
        ========================= */}

        <section className={styles.adminWelcome}>
          <div>
            <h2>Welcome back 👋</h2>

            <p>Manage your products and shop information from here.</p>
          </div>
        </section>

        {/* =========================
            STATISTICS
        ========================= */}

        <section className={styles.adminStats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>

            <div>
              <p>Total Products</p>

              <strong>{products.length}</strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🟢</div>

            <div>
              <p>Available</p>

              <strong>{availableProducts}</strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔴</div>

            <div>
              <p>Out of Stock</p>

              <strong>{outOfStockProducts}</strong>
            </div>
          </div>
        </section>

        {/* =========================
            ACTIONS
        ========================= */}

        <section className={styles.adminActions}>
          <button
            className={`${styles.dashboardAction} ${styles.primary}`}
            onClick={() => navigate("/admin/products/add")}
          >
            <span>➕</span>

            <div>
              <strong>Add Product</strong>

              <small>Add a new item</small>
            </div>
          </button>

          <button
            className={styles.dashboardAction}
            onClick={() => navigate("/admin/categories")}
          >
            <span>📂</span>

            <div>
              <strong>
                <span>{categories.length}</span> Categories
              </strong>

              <small>Manage categories</small>
            </div>
          </button>

          <button
            className={styles.dashboardAction}
            onClick={() => navigate("/admin/shop")}
          >
            <span>⚙️</span>

            <div>
              <strong>Shop Settings</strong>

              <small>Update shop information</small>
            </div>
          </button>

          <button
            className={styles.dashboardAction}
            onClick={() => navigate("/admin/payment-methods")}
          >
            <span>🏦</span>
            <div>
              <strong>
                Payment Methods
              </strong>

              <small>Manage Payment Methods</small>
            </div>
          </button>
        </section>
        {/* <PaymentMethods /> */}
        {/* =========================
            PRODUCTS HEADER
        ========================= */}

        <section className={styles.productsHeader}>
          <div>
            <h2>Products</h2>

            <p>Manage your kiosk products</p>
          </div>

          <button
            className={styles.adminRefreshButton}
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </section>

        {/* =========================
            SEARCH
        ========================= */}

        <div className={styles.adminProductSearch}>
          <span className={styles.searchIcon}>🔎</span>

          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
          />

          {productSearch && (
            <button
              className={styles.adminClearSearch}
              onClick={() => setProductSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* =========================
            CATEGORY FILTER
        ========================= */}

        <div className={styles.adminCategoryFilter}>
          <button
            className={
              selectedCategory === "All"
                ? `${styles.adminCategoryButton} ${styles.active}`
                : styles.adminCategoryButton
            }
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              className={
                selectedCategory === category.name
                  ? `${styles.adminCategoryButton} ${styles.active}`
                  : styles.adminCategoryButton
              }
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* =========================
            ACTIVE FILTER
        ========================= */}

        {(productSearch || selectedCategory !== "All") && (
          <div className={styles.activeFilter}>
            <span>
              Showing <strong>{filteredProducts.length}</strong> product
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>

            <button onClick={clearFilters}>Clear Filters</button>
          </div>
        )}

        {/* =========================
            SORT
        ========================= */}

        <select
          className={styles.adminSortSelect}
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
        >
          <option value="default">Sort: Default</option>

          <option value="name-asc">Name: A → Z</option>

          <option value="name-desc">Name: Z → A</option>

          <option value="price-low">Price: Low → High</option>

          <option value="price-high">Price: High → Low</option>

          <option value="available">Available First</option>

          <option value="out-of-stock">Out of Stock First</option>
        </select>

        {/* =========================
            PRODUCTS
        ========================= */}

        {loading ? (
          <div className={styles.adminState}>
            <div className={styles.adminLoadingSpinner}></div>

            <h3>Loading products</h3>

            <p>Please wait a moment...</p>
          </div>
        ) : error ? (
          <div className={`${styles.adminState} ${styles.adminErrorState}`}>
            <div className={styles.adminStateIcon}>⚠️</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button
              className={styles.adminRetryButton}
              onClick={() => fetchProducts()}
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.adminEmpty}>
            <div>📦</div>

            <h3>No products yet</h3>

            <p>Add your first product to start managing your kiosk.</p>

            <button
              className={styles.addProductButton}
              onClick={() => navigate("/admin/products/add")}
            >
              + Add Product
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.adminEmpty}>
            <div>🔎</div>

            <h3>No products found</h3>

            <p>Try another search or category.</p>

            <button className={styles.clearSearchButton} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.adminProducts}>
            {sortedProducts.map((product) => (
              <div className={styles.adminProductCard} key={product.id}>
                {/* IMAGE */}

                <div className={styles.adminProductImageWrapper}>
                  <ProductImage product={product} />
                </div>

                {/* INFORMATION */}

                <div className={styles.adminProductInfo}>
                  <div>
                    <h3>{product.name}</h3>

                    <p>{product.category_name || "No category"}</p>
                  </div>

                  <strong>{Number(product.price).toFixed(2)} Birr</strong>

                  <span
                    className={
                      product.is_available
                        ? styles.adminAvailable
                        : styles.adminUnavailable
                    }
                  >
                    {product.is_available ? "● Available" : "● Out of stock"}
                  </span>
                </div>

                {/* ACTIONS */}

                <div className={styles.adminProductActions}>
                  <button
                    className={
                      product.is_available
                        ? `${styles.availabilityButton} ${styles.availableAction}`
                        : `${styles.availabilityButton} ${styles.unavailableAction}`
                    }
                    onClick={() => toggleAvailability(product)}
                  >
                    {product.is_available ? "✓ Available" : "✕ Out of Stock"}
                  </button>

                  <button
                    className={styles.editButton}
                    onClick={() =>
                      navigate(`/admin/products/${product.id}/edit`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* =========================
          DELETE CONFIRMATION MODAL
      ========================= */}

      {deleteProductId && (
        <div className={styles.deleteModalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalIcon}>⚠️</div>

            <h2>Delete Product?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteProductName}</strong>?
            </p>

            <span className={styles.deleteModalWarning}>
              This action cannot be undone.
            </span>

            <div className={styles.deleteModalActions}>
              <button
                type="button"
                className={styles.cancelDeleteButton}
                onClick={cancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmDeleteButton}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
