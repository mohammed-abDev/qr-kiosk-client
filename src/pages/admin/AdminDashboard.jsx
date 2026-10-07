import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import styles from "./AdminDashboard.module.css";
import image from "../../assets/shoping-logo.png";
import API_URL from "../../config/api";

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ product }) {
  const [imageError, setImageError] = useState(false);

  if (!product?.image || imageError) {
    return (
      <div className={styles.productImagePlaceholder}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="m6.5 16 3.5-4 2.7 3 2-2.2 2.8 3.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="8.5" r="1.3" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <img
      className={styles.productImage}
      src={product.image}
      alt={product.name || "Product"}
      onError={() => setImageError(true)}
    />
  );
}

/* =========================================================
   ICON
========================================================= */

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );

    case "products":
      return (
        <svg {...common}>
          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
          <path d="M4 7.5 12 12l8-4.5" />
          <path d="M12 12v9" />
        </svg>
      );

    case "categories":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case "banner":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8" cy="9" r="1.5" />
          <path d="m5 17 4-4 3 3 3-4 4 5" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.4 1.4-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-2v-.5a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.4-1.4.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.4-1.4.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.37 6.5V6h2v.5a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.4 1.4-.06.06A1.7 1.7 0 0 0 19.4 11c.18.6.74 1.03 1.37 1.03H21v2h-.23c-.63 0-1.19.42-1.37.97Z" />
        </svg>
      );

    case "payment":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 14h4" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.7-4L4 9" />
          <path d="M4 5v4h4" />
          <path d="M4 13a8 8 0 0 0 14.7 4L20 15" />
          <path d="M20 19v-4h-4" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="m4 16.5-.7 3.7 3.7-.7L18 8.5 15.5 6 4 16.5Z" />
          <path d="m14.5 7 2.5 2.5" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="m7 7 .8 13h8.4L17 7" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 6.5h6l2 2H20.5v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-11Z" />
        </svg>
      );

    case "store":
      return (
        <svg {...common}>
          <path d="M4 10v10h16V10" />
          <path d="M3 10 5 4h14l2 6" />
          <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
          <path d="M9 20v-5h6v5" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 4H5v16h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M18 12H9" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="m20 4-9 9" />
          <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  // Reference UI shows 5 products per page.
  const productsPerPage = 5;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const [error, setError] = useState("");

  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteProductName, setDeleteProductName] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  /* =======================================================
     NOTIFICATION
  ======================================================= */

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

  /* =======================================================
    setShowProfileMenu
  ======================================================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

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
      .catch((err) => {
        console.error("Products error:", err);
        setError("Could not load products.");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  /* =======================================================
     FETCH CATEGORIES
  ======================================================= */

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
      .catch((err) => {
        console.error("Categories error:", err);
      });
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* =======================================================
     RESET PAGE
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, selectedCategory, sortOption]);

  /* =======================================================
     FILTER
  ======================================================= */

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

  /* =======================================================
     SORT
  ======================================================= */

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

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  /* =======================================================
     STATISTICS
  ======================================================= */

  const availableProducts = products.filter(
    (product) => product.is_available,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => !product.is_available,
  ).length;

  const totalProducts = products.length;

  const categoryCount = categories.length;

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setProductSearch("");
    setSelectedCategory("All");
    setSortOption("default");
  };

  /* =======================================================
     PRODUCT ACTIONS
  ======================================================= */

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
      .catch((err) => {
        console.error(err);

        showNotification("Could not update product.", "error");
      });
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (id) => {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    setDeleteProductId(id);
    setDeleteProductName(product.name);
  };

  const confirmDelete = () => {
    if (!deleteProductId) return;

    const currentToken = localStorage.getItem("token");

    fetch(`${API_URL}/api/products/${deleteProductId}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${currentToken}`,
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
      .catch((err) => {
        console.error(err);

        showNotification(err.message || "Failed to delete product.", "error");
      });
  };

  const cancelDelete = () => {
    setDeleteProductId(null);
    setDeleteProductName("");
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goToProducts = () => {
    setMobileMenuOpen(false);

    document.getElementById("products-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleHome = () => {
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  /* =======================================================
     NAV ITEM
  ======================================================= */

  const navItems = [
    {
      label: "Dashboard",
      icon: "home",
      action: handleHome,
      active: true,
    },
    {
      label: "Products",
      icon: "products",
      action: goToProducts,
    },
    {
      label: "Categories",
      icon: "categories",
      action: () => {
        setMobileMenuOpen(false);
        navigate("/admin/categories");
      },
    },
    {
      label: "Banners",
      icon: "banner",
      action: () => {
        setMobileMenuOpen(false);
        navigate("/admin/banners");
      },
    },
    {
      label: "Shop Settings",
      icon: "settings",
      action: () => {
        setMobileMenuOpen(false);
        navigate("/admin/shop");
      },
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className={styles.adminDashboard}>
      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside className={styles.sidebar}>
        <button
          type="button"
          className={styles.sidebarBrand}
          onClick={() => navigate("/")}
        >
          <div className={styles.sidebarLogo}>
            <img src={image} alt="Abdu Mart" />
          </div>

          <div>
            <strong>Abdu Mart</strong>
          </div>
        </button>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`${styles.sidebarNavItem} ${
                item.active ? styles.sidebarNavItemActive : ""
              }`}
              onClick={item.action}
            >
              <span className={styles.sidebarNavIcon}>
                <Icon name={item.icon} size={19} />
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button
            type="button"
            className={styles.sidebarLogout}
            onClick={handleLogout}
          >
            <Icon name="logout" size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ===================================================
          MOBILE TOP BAR
      =================================================== */}

      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Icon name="menu" size={23} />
        </button>

        <button
          type="button"
          className={styles.mobileBrand}
          onClick={() => navigate("/")}
        >
          <div className={styles.mobileBrandLogo}>
            <img src={image} alt="Abdu Mart" />
          </div>

          <strong>Abdu Mart</strong>
        </button>

        <div className={styles.mobileProfile} ref={profileMenuRef}>
          <span>AM</span>
         
            {/* PROFILE BUTTON */}
            <button
              type="button"
              className={styles.profileTrigger}
              onClick={() => setShowProfileMenu((prev) => !prev)}
            >
            </button>

            {/* PROFILE DROPDOWN */}
            {showProfileMenu && (
              <div className={styles.profileDropdown}>
                {/* PROFILE HEADER */}
                  {/* <button>x</button> */}
                  <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <Icon name="close" size={22} />
              </button>
                <div className={styles.profileDropdownHeader}>
                  <div className={styles.profileDropdownAvatar}>AM</div>
                  <div>
                    <strong>Abdu Mart</strong>
                    <span>Administrator</span>
                  </div>
                </div>

                <div className={styles.profileDropdownDivider} />

                {/* VIEW STORE */}
                <button
                  type="button"
                  className={styles.profileDropdownItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/");
                  }}
                >
                  <span>⌂</span>

                  <div>
                    <strong>View Store</strong>
                    <small>Open customer store</small>
                  </div>
                </button>

                {/* SHOP SETTINGS */}
                <button
                  type="button"
                  className={styles.profileDropdownItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/admin/shop");
                  }}
                >
                  <span>⚙</span>

                  <div>
                    <strong>Shop Settings</strong>
                    <small>Manage your shop</small>
                  </div>
                </button>

                <div className={styles.profileDropdownDivider} />

                {/* LOGOUT */}
                <button
                  type="button"
                  className={`${styles.profileDropdownItem} ${styles.logoutItem}`}
                  onClick={() => {
                    localStorage.removeItem("token");
                    setShowProfileMenu(false);
                    navigate("/admin");
                  }}
                >
                  <span>↪</span>

                  <div>
                    <strong>Logout</strong>
                    <small>Sign out of admin</small>
                  </div>
                </button>
              </div>
            )}
          
        </div>
      </header>

      {/* ===================================================
          MOBILE DRAWER
      =================================================== */}

      {mobileMenuOpen && (
        <div
          className={styles.mobileDrawerOverlay}
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className={styles.mobileDrawer}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.mobileDrawerHeader}>
              <div className={styles.mobileDrawerBrand}>
                <div className={styles.mobileDrawerBrandLogo}>
                  <img src={image} alt="Abdu Mart" />
                </div>

                <div>
                  <strong>Abdu Mart</strong>
                  <small>Admin Dashboard</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            <nav className={styles.mobileDrawerNav}>
              {navItems.map((item) => (
                <button type="button" key={item.label} onClick={item.action}>
                  <Icon name={item.icon} size={19} />

                  <span>{item.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/admin/payment-methods");
                }}
              >
                <Icon name="payment" size={19} />
                <span>Payment Methods</span>
              </button>
            </nav>

            <button
              type="button"
              className={styles.mobileDrawerLogout}
              onClick={handleLogout}
            >
              <Icon name="logout" size={19} />
              Logout
            </button>
          </aside>
        </div>
      )}

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div className={styles.mainArea}>
        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header className={styles.topHeader}>
          <div className={styles.topHeaderTitle}>
            <h1>Dashboard</h1>
          </div>

          <div className={styles.topHeaderActions}>
            <div className={styles.globalSearch}>
              <Icon name="search" size={19} />

              <input
                type="text"
                placeholder="Search anything..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </div>

            <div className={styles.profileMenu} ref={profileMenuRef}>
              {/* PROFILE BUTTON */}
              <button
                type="button"
                className={styles.profileTrigger}
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <div className={styles.profileAvatar}>AM</div>

                <div className={styles.profileText}>
                  <strong>Abdu Mart</strong>
                  <span>Admin</span>
                </div>

                <span
                  className={`${styles.profileChevron} ${
                    showProfileMenu ? styles.profileChevronOpen : ""
                  }`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6 9l6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {/* PROFILE DROPDOWN */}
              {showProfileMenu && (
                <div className={styles.profileDropdown}>
                  {/* PROFILE HEADER */}
                  <div className={styles.profileDropdownHeader}>
                    <div className={styles.profileDropdownAvatar}>AM</div>

                    <div>
                      <strong>Abdu Mart</strong>
                      <span>Administrator</span>
                    </div>
                  </div>

                  <div className={styles.profileDropdownDivider} />

                  {/* VIEW STORE */}
                  <button
                    type="button"
                    className={styles.profileDropdownItem}
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/");
                    }}
                  >
                    <span>⌂</span>

                    <div>
                      <strong>View Store</strong>
                      <small>Open customer store</small>
                    </div>
                  </button>

                  {/* SHOP SETTINGS */}
                  <button
                    type="button"
                    className={styles.profileDropdownItem}
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/admin/shop");
                    }}
                  >
                    <span>⚙</span>

                    <div>
                      <strong>Shop Settings</strong>
                      <small>Manage your shop</small>
                    </div>
                  </button>

                  <div className={styles.profileDropdownDivider} />

                  {/* LOGOUT */}
                  <button
                    type="button"
                    className={`${styles.profileDropdownItem} ${styles.logoutItem}`}
                    onClick={() => {
                      localStorage.removeItem("token");
                      setShowProfileMenu(false);
                      navigate("/admin");
                    }}
                  >
                    <span>↪</span>

                    <div>
                      <strong>Logout</strong>
                      <small>Sign out of admin</small>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className={styles.dashboardContent}>
          {/* =================================================
              WELCOME
          ================================================= */}

          <section className={styles.welcomeCard}>
            <div>
              <h2>Welcome back, Admin 👋</h2>

              <p>Here's what's happening with your store today.</p>
            </div>

            <div className={styles.welcomeActions}>
              <button
                type="button"
                className={styles.viewStoreButton}
                onClick={() => navigate("/")}
              >
                View Store
                <Icon name="external" size={16} />
              </button>

              <button
                type="button"
                className={styles.addProductButton}
                onClick={() => navigate("/admin/products/add")}
              >
                <Icon name="plus" size={18} />
                Add Product
              </button>
            </div>
          </section>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
                <Icon name="products" size={22} />
              </div>

              <div className={styles.statContent}>
                <span>Total Products</span>
                <strong>{totalProducts}</strong>
                <small>All products</small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                <Icon name="check" size={23} />
              </div>

              <div className={styles.statContent}>
                <span>Available</span>
                <strong>{availableProducts}</strong>
                <small>In stock</small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconRed}`}>
                <Icon name="warning" size={22} />
              </div>

              <div className={styles.statContent}>
                <span>Out of Stock</span>
                <strong>{outOfStockProducts}</strong>
                <small>Need attention</small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
                <Icon name="categories" size={22} />
              </div>

              <div className={styles.statContent}>
                <span>Categories</span>
                <strong>{categoryCount}</strong>
                <small>Total categories</small>
              </div>
            </div>
          </section>

          {/* =================================================
              LOWER DASHBOARD
          ================================================= */}

          <div className={styles.dashboardGrid}>
            {/* ===============================================
                PRODUCTS
            =============================================== */}

            <section className={styles.productsPanel} id="products-section">
              <div className={styles.panelHeader}>
                <div>
                  <h2>Products</h2>
                  <p>Manage your kiosk products</p>
                </div>

                <button
                  type="button"
                  className={styles.refreshButton}
                  onClick={() => fetchProducts(true)}
                  disabled={refreshing}
                >
                  <Icon name="refresh" size={15} />

                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {/* SEARCH + CATEGORY */}

              <div className={styles.productToolbar}>
                <div className={styles.productSearch}>
                  <Icon name="search" size={18} />

                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                  />

                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  className={styles.categorySelect}
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="All">All Categories</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  className={styles.sortSelect}
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                >
                  <option value="default">Sort</option>

                  <option value="name-asc">Name: A → Z</option>

                  <option value="name-desc">Name: Z → A</option>

                  <option value="price-low">Price: Low → High</option>

                  <option value="price-high">Price: High → Low</option>

                  <option value="available">Available First</option>

                  <option value="out-of-stock">Out of Stock First</option>
                </select>
              </div>

              {/* FILTER CHIPS */}

              <div className={styles.categoryChips}>
                <button
                  type="button"
                  className={
                    selectedCategory === "All"
                      ? `${styles.categoryChip} ${styles.categoryChipActive}`
                      : styles.categoryChip
                  }
                  onClick={() => setSelectedCategory("All")}
                >
                  All
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className={
                      selectedCategory === category.name
                        ? `${styles.categoryChip} ${styles.categoryChipActive}`
                        : styles.categoryChip
                    }
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* ACTIVE FILTER */}

              {(productSearch || selectedCategory !== "All") && (
                <div className={styles.activeFilter}>
                  <span>
                    Showing <strong>{filteredProducts.length}</strong> product
                    {filteredProducts.length !== 1 ? "s" : ""}
                  </span>

                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              )}

              {/* PRODUCTS */}

              {loading ? (
                <div className={styles.stateBox}>
                  <div className={styles.loadingSpinner} />

                  <h3>Loading products</h3>
                  <p>Please wait a moment...</p>
                </div>
              ) : error ? (
                <div className={`${styles.stateBox} ${styles.errorState}`}>
                  <div className={styles.stateIcon}>
                    <Icon name="warning" size={28} />
                  </div>

                  <h3>Something went wrong</h3>

                  <p>{error}</p>

                  <button type="button" onClick={() => fetchProducts()}>
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.stateBox}>
                  <div className={styles.stateIcon}>
                    <Icon name="products" size={28} />
                  </div>

                  <h3>No products yet</h3>

                  <p>Add your first product to start managing your kiosk.</p>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/products/add")}
                  >
                    <Icon name="plus" size={17} />
                    Add Product
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className={styles.stateBox}>
                  <div className={styles.stateIcon}>
                    <Icon name="search" size={28} />
                  </div>

                  <h3>No products found</h3>

                  <p>Try another search or category.</p>

                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}

                  <div className={styles.productTableWrapper}>
                    <div className={styles.productTable}>
                      <div
                        className={`${styles.productRow} ${styles.productTableHead}`}
                      >
                        <span>Product</span>
                        <span>Category</span>
                        <span>Price</span>
                        <span>Status</span>
                        <span>Stock</span>
                        <span>Actions</span>
                      </div>

                      {currentProducts.map((product) => (
                        <div className={styles.productRow} key={product.id}>
                          <div className={styles.productCellProduct}>
                            <div className={styles.tableImage}>
                              <ProductImage product={product} />
                            </div>

                            <strong>{product.name}</strong>
                          </div>

                          <span className={styles.tableCategory}>
                            {product.category_name || "No category"}
                          </span>

                          <strong className={styles.tablePrice}>
                            {Number(product.price).toFixed(2)} Birr
                          </strong>

                          <button
                            type="button"
                            className={
                              product.is_available
                                ? styles.statusAvailable
                                : styles.statusUnavailable
                            }
                            onClick={() => toggleAvailability(product)}
                          >
                            <span>●</span>

                            {product.is_available
                              ? "Available"
                              : "Out of Stock"}
                          </button>

                          <span className={styles.stockValue}>
                            {product.is_available ? "—" : "0"}
                          </span>

                          <div className={styles.tableActions}>
                            <button
                              type="button"
                              className={styles.iconActionButton}
                              onClick={() =>
                                navigate(`/admin/products/${product.id}/edit`)
                              }
                              title="Edit product"
                            >
                              <Icon name="edit" size={17} />
                            </button>

                            <button
                              type="button"
                              className={`${styles.iconActionButton} ${styles.deleteIconButton}`}
                              onClick={() => handleDelete(product.id)}
                              title="Delete product"
                            >
                              <Icon name="trash" size={17} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MOBILE PRODUCT CARDS */}

                  <div className={styles.mobileProductList}>
                    {currentProducts.map((product) => (
                      <article
                        className={styles.mobileProductCard}
                        key={product.id}
                      >
                        <div className={styles.mobileProductTop}>
                          <div className={styles.mobileProductImage}>
                            <ProductImage product={product} />
                          </div>

                          <div className={styles.mobileProductInfo}>
                            <h3>{product.name}</h3>

                            <span>
                              {product.category_name || "No category"}
                            </span>

                            <strong>
                              {Number(product.price).toFixed(2)} Birr
                            </strong>

                            <button
                              type="button"
                              className={
                                product.is_available
                                  ? styles.statusAvailable
                                  : styles.statusUnavailable
                              }
                              onClick={() => toggleAvailability(product)}
                            >
                              <span>●</span>

                              {product.is_available
                                ? "Available"
                                : "Out of Stock"}
                            </button>
                          </div>
                        </div>

                        <div className={styles.mobileProductActions}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/products/${product.id}/edit`)
                            }
                          >
                            <Icon name="edit" size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className={styles.mobileDeleteButton}
                            onClick={() => handleDelete(product.id)}
                          >
                            <Icon name="trash" size={16} />
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* PAGINATION */}

                  <div className={styles.paginationArea}>
                    <span>
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + productsPerPage,
                        sortedProducts.length,
                      )}{" "}
                      of {sortedProducts.length} products
                    </span>

                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((page) => page - 1)}
                          disabled={currentPage === 1}
                          aria-label="Previous page"
                        >
                          ‹
                        </button>

                        {Array.from(
                          {
                            length: totalPages,
                          },
                          (_, index) => {
                            const page = index + 1;

                            return (
                              <button
                                type="button"
                                key={page}
                                className={
                                  currentPage === page ? styles.activePage : ""
                                }
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            );
                          },
                        )}

                        <button
                          type="button"
                          onClick={() => setCurrentPage((page) => page + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="Next page"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* =============================================
                RIGHT COLUMN
            ============================================= */}

            <aside className={styles.dashboardAside}>
              {/* INVENTORY OVERVIEW */}

              <section className={styles.overviewCard}>
                <div className={styles.asideHeader}>
                  <h3>Inventory Overview</h3>
                </div>

                <div className={styles.donutWrapper}>
                  <div
                    className={styles.donutChart}
                    style={{
                      "--available":
                        totalProducts > 0
                          ? `${(availableProducts / totalProducts) * 100}%`
                          : "0%",
                    }}
                  >
                    <div className={styles.donutCenter}>
                      <strong>{totalProducts}</strong>

                      <span>Total</span>
                    </div>
                  </div>
                </div>

                <div className={styles.inventoryLegend}>
                  <div>
                    <span className={styles.legendGreen} />

                    <span>Available ({availableProducts})</span>
                  </div>

                  <div>
                    <span className={styles.legendRed} />

                    <span>Out of Stock ({outOfStockProducts})</span>
                  </div>
                </div>
              </section>

              {/* QUICK ACTIONS */}

              <section className={styles.quickActionsCard}>
                <div className={styles.asideHeader}>
                  <h3>Quick Actions</h3>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/products/add")}
                >
                  <span className={styles.quickActionIcon}>
                    <Icon name="plus" size={17} />
                  </span>

                  <span>Add New Product</span>

                  <b>›</b>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/categories")}
                >
                  <span className={styles.quickActionIcon}>
                    <Icon name="folder" size={17} />
                  </span>

                  <span>Manage Categories</span>

                  <b>›</b>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/banners")}
                >
                  <span className={styles.quickActionIcon}>
                    <Icon name="banner" size={17} />
                  </span>

                  <span>Manage Banners</span>

                  <b>›</b>
                </button>

                <button type="button" onClick={() => navigate("/admin/shop")}>
                  <span className={styles.quickActionIcon}>
                    <Icon name="settings" size={17} />
                  </span>

                  <span>Shop Settings</span>

                  <b>›</b>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/payment-methods")}
                >
                  <span className={styles.quickActionIcon}>
                    <Icon name="payment" size={17} />
                  </span>

                  <span>Payment Methods</span>

                  <b>›</b>
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {/* ===================================================
          NOTIFICATION
      =================================================== */}

      {notification.message && (
        <div
          className={`${styles.notification} ${
            notification.type === "error"
              ? styles.notificationError
              : styles.notificationSuccess
          }`}
        >
          <span>{notification.type === "error" ? "!" : "✓"}</span>

          <p>{notification.message}</p>
        </div>
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deleteProductId && (
        <div className={styles.deleteModalOverlay} onClick={cancelDelete}>
          <div
            className={styles.deleteModal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.deleteModalIcon}>
              <Icon name="warning" size={25} />
            </div>

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

      {/* ===================================================
          MOBILE BOTTOM NAV
      =================================================== */}

      <nav className={styles.bottomNav}>
        <button
          type="button"
          className={`${styles.bottomNavItem} ${styles.bottomNavActive}`}
          onClick={handleHome}
        >
          <Icon name="home" size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={goToProducts}
        >
          <Icon name="products" size={20} />
          <span>Products</span>
        </button>

        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={() => navigate("/admin/categories")}
        >
          <Icon name="categories" size={20} />
          <span>Categories</span>
        </button>

        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={() => navigate("/admin/shop")}
        >
          <Icon name="settings" size={20} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default AdminDashboard;
