
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./AdminDashboard.module.css";
import image from "../../assets/shoping-logo.png";
import PushNotificationSetup from "../../components/common/PushNotificationSetup";
import API_URL from "../../config/api";
import socket from "../../config/socket";

/* =========================================================
   HELPERS
========================================================= */

const SOUND_URL = "/send-notification.wav";
const PRODUCTS_PER_PAGE = 5;
const NOTIFICATION_LIMIT = 50;

function getNotificationType(item) {
  return (
    item?.type === "repayment" ||
    item?.type === "credit_payment" ||
    item?.payment_id
  )
    ? "repayment"
    : "credit_sale";
}

function getNotificationId(item) {
  return item?.id == null ? null : String(item.id);
}

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
    "aria-hidden": true,
  };

  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
    products: (
      <>
        <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
        <path d="M4 7.5 12 12l8-4.5M12 12v9" />
      </>
    ),
    categories: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    banner: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m5 17 4-4 3 3 3-4 4 5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.4 1.4-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-2v-.5a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.4-1.4.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.4-1.4.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.37 6.5V6h2v.5a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.4 1.4-.06.06A1.7 1.7 0 0 0 19.4 11c.18.6.74 1.03 1.37 1.03v2h-.23c-.63 0-1.19.42-1.37.97Z" />
      </>
    ),
    payment: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18M7 14h4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.7-4L4 9M4 5v4h4" />
        <path d="M4 13a8 8 0 0 0 14.7 4L20 15M20 19v-4h-4" />
      </>
    ),
    edit: (
      <>
        <path d="m4 16.5-.7 3.7 3.7-.7L18 8.5 15.5 6 4 16.5Z" />
        <path d="m14.5 7 2.5 2.5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l.8 13h8.4L17 7" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    warning: (
      <>
        <path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    folder: (
      <path d="M3.5 6.5h6l2 2H20.5v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-11Z" />
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    logout: (
      <>
        <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
  };

  if (!paths[name]) return null;

  return <svg {...common}>{paths[name]}</svg>;
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteProductName, setDeleteProductName] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const knownNotificationIds = useRef(null);
  const audioUnlocked = useRef(false);

  const token = localStorage.getItem("token");

  /* ---------------------------------------------------------
     TOAST NOTIFICATIONS
  --------------------------------------------------------- */

  const dismissNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }

    setNotification({ message: "", type: "" });
  }, []);

  const showNotification = useCallback((message, type = "success") => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setNotification({ message, type });

    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ message: "", type: "" });
      notificationTimeoutRef.current = null;
    }, 8000);
  }, []);

  const playNotificationSound = useCallback(() => {
    const audio = new Audio(SOUND_URL);
    audio.volume = 0.2;

    audio.play().catch((soundError) => {
      console.warn("Notification sound could not play:", soundError);
    });
  }, []);

  const unlockNotificationSound = useCallback(async () => {
    try {
      const audio = new Audio(SOUND_URL);
      audio.volume = 0;

      await audio.play();
      audio.pause();
      audio.currentTime = 0;

      audioUnlocked.current = true;
    } catch (soundError) {
      console.warn("Could not unlock notification sound:", soundError);
    }
  }, []);

  /* ---------------------------------------------------------
     NOTIFICATION LIST
  --------------------------------------------------------- */

  const mergeNotifications = useCallback((incoming) => {
    setRecentNotifications((previous) => {
      const byId = new Map();

      [...incoming, ...previous].forEach((item) => {
        const id = getNotificationId(item);

        if (id !== null && !byId.has(id)) {
          byId.set(id, item);
        }
      });

      return [...byId.values()].slice(0, NOTIFICATION_LIMIT);
    });
  }, []);

  const handleIncomingNotification = useCallback(
    (item) => {
      if (!item) return;

      const id = getNotificationId(item);
      const alreadyKnown =
        id !== null && knownNotificationIds.current?.has(id);

      if (id !== null) {
        if (knownNotificationIds.current === null) {
          knownNotificationIds.current = new Set();
        }

        knownNotificationIds.current.add(id);
      }

      mergeNotifications([item]);

      // Do not show duplicate alerts if both polling and Socket.IO
      // report the same notification.
      if (alreadyKnown) return;

      showNotification(
        item.message ||
          "A new credit transaction or repayment was recorded.",
        getNotificationType(item),
      );

      playNotificationSound();
    },
    [mergeNotifications, playNotificationSound, showNotification],
  );

  /* ---------------------------------------------------------
     SOCKET.IO
  --------------------------------------------------------- */

  useEffect(() => {
    const handleSocketNotification = (item) => {
      handleIncomingNotification(item);
    };

    socket.on("credit:notification", handleSocketNotification);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("credit:notification", handleSocketNotification);
    };
  }, [handleIncomingNotification]);

  /* ---------------------------------------------------------
     POLLING FALLBACK
  --------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return;

      try {
        const response = await fetch(
          `${API_URL}/api/credit/notifications`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Notifications request failed: ${response.status}`);
        }

        const data = await response.json();
        if (!active) return;

        const items = Array.isArray(data.notifications)
          ? data.notifications
          : [];

        const currentIds = new Set(
          items.map(getNotificationId).filter((id) => id !== null),
        );

        // Initialize on the first request without triggering old alerts.
        if (knownNotificationIds.current === null) {
          knownNotificationIds.current = currentIds;
        } else {
          const newItems = items.filter((item) => {
            const id = getNotificationId(item);
            return id !== null && !knownNotificationIds.current.has(id);
          });

          // Remember the new IDs before processing, so the socket and
          // polling requests cannot alert twice for the same notification.
          currentIds.forEach((id) => knownNotificationIds.current.add(id));

          if (newItems.length > 0) {
            const latest = newItems[0];

            showNotification(
              latest.message ||
                "A new credit transaction or repayment was recorded.",
              getNotificationType(latest),
            );

            playNotificationSound();
          }
        }

        setRecentNotifications(items.slice(0, NOTIFICATION_LIMIT));
        setNotificationCount(items.length);
      } catch (loadError) {
        console.error("Could not load credit notifications:", loadError);
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 15000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [playNotificationSound, showNotification]);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  /* ---------------------------------------------------------
     CLOSE MENUS WHEN CLICKING OUTSIDE
  --------------------------------------------------------- */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        desktopProfileRef.current &&
        !desktopProfileRef.current.contains(event.target) &&
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }

      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* ---------------------------------------------------------
     FETCH PRODUCTS AND CATEGORIES
  --------------------------------------------------------- */

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/products?_=${Date.now()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The products response is not a list.");
      }

      setProducts(data);
    } catch (fetchError) {
      console.error("Products error:", fetchError);
      setError("Could not load products. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories.");
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error("Categories error:", fetchError);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  /* ---------------------------------------------------------
     FILTER, SORT AND PAGINATION
  --------------------------------------------------------- */

  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, selectedCategory, sortOption]);

  const filteredProducts = useMemo(() => {
    const searchText = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const category = product.category_name?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchText) ||
        description.includes(searchText) ||
        category.includes(searchText);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, selectedCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortOption === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortOption === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }

      if (sortOption === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortOption === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortOption === "available") {
        return Number(Boolean(b.is_available)) -
          Number(Boolean(a.is_available));
      }

      if (sortOption === "out-of-stock") {
        return Number(Boolean(a.is_available)) -
          Number(Boolean(b.is_available));
      }

      return 0;
    });
  }, [filteredProducts, sortOption]);

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;

  const currentProducts = sortedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  const availableProducts = products.filter(
    (product) => Boolean(product.is_available),
  ).length;

  const outOfStockProducts = products.length - availableProducts;
  const totalProducts = products.length;
  const categoryCount = categories.length;

  const clearFilters = () => {
    setProductSearch("");
    setSelectedCategory("All");
    setSortOption("default");
  };

  /* ---------------------------------------------------------
     PRODUCT ACTIONS
  --------------------------------------------------------- */

  const toggleAvailability = async (product) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          category_id: product.category_id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          is_available: product.is_available ? 0 : 1,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update product.");
      }

      showNotification(
        product.is_available
          ? "Product marked as out of stock."
          : "Product is now available.",
        "success",
      );

      await fetchProducts(true);
    } catch (actionError) {
      console.error("Availability update error:", actionError);
      showNotification(actionError.message || "Could not update product.", "error");
    }
  };

  const handleDelete = (id) => {
    const product = products.find((item) => String(item.id) === String(id));
    if (!product) return;

    setDeleteProductId(id);
    setDeleteProductName(product.name || "this product");
  };

  const confirmDelete = async () => {
    if (deleteProductId == null) return;

    try {
      const response = await fetch(
        `${API_URL}/api/products/${deleteProductId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setDeleteProductId(null);
      setDeleteProductName("");

      showNotification("Product deleted successfully.", "success");
      await fetchProducts(true);
    } catch (deleteError) {
      console.error("Delete product error:", deleteError);
      showNotification(deleteError.message || "Failed to delete product.", "error");
    }
  };

  const cancelDelete = () => {
    setDeleteProductId(null);
    setDeleteProductName("");
  };

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */

  const goToProducts = () => {
    setMobileMenuOpen(false);

    document.getElementById("products-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleHome = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowProfileMenu(false);

    if (typeof onLogout === "function") {
      onLogout();
    } else {
      navigate("/admin");
    }
  };

  const navigateAndCloseMenus = (path) => {
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowNotifications(false);
    navigate(path);
  };

  const navItems = [
    { label: "Dashboard", icon: "home", action: handleHome, active: true },
    { label: "Products", icon: "products", action: goToProducts },
    {
      label: "Categories",
      icon: "categories",
      action: () => navigateAndCloseMenus("/admin/categories"),
    },
    {
      label: "Banners",
      icon: "banner",
      action: () => navigateAndCloseMenus("/admin/banners"),
    },
    {
      label: "Shop Settings",
      icon: "settings",
      action: () => navigateAndCloseMenus("/admin/shop"),
    },
    {
      label: "Customer Credit",
      icon: "payment",
      action: () => navigateAndCloseMenus("/admin/customer-credit"),
    },
  ];

  const openCreditNotifications = () => {
    setShowNotifications(false);
    dismissNotification();
    navigate("/admin/credit-notifications");
  };

  /* ---------------------------------------------------------
     PROFILE DROPDOWN
  --------------------------------------------------------- */

  const profileDropdown = (
    <div className={styles.profileDropdown}>
      <div className={styles.profileDropdownHeader}>
        <div className={styles.profileDropdownAvatar}>AM</div>
        <div>
          <strong>Abdu Mart</strong>
          <span>Administrator</span>
        </div>
      </div>

      <div className={styles.profileDropdownDivider} />

      <button
        type="button"
        className={styles.profileDropdownItem}
        onClick={() => navigateAndCloseMenus("/")}
      >
        <span>⌂</span>
        <div>
          <strong>View Store</strong>
          <small>Open customer store</small>
        </div>
      </button>

      <button
        type="button"
        className={styles.profileDropdownItem}
        onClick={() => navigateAndCloseMenus("/admin/shop")}
      >
        <span>⚙</span>
        <div>
          <strong>Shop Settings</strong>
          <small>Manage your shop</small>
        </div>
      </button>

      <div className={styles.profileDropdownDivider} />

      <button
        type="button"
        className={`${styles.profileDropdownItem} ${styles.logoutItem}`}
        onClick={handleLogout}
      >
        <span>↪</span>
        <div>
          <strong>Logout</strong>
          <small>Sign out of admin</small>
        </div>
      </button>
    </div>
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className={styles.adminDashboard}>
      {/* DESKTOP SIDEBAR */}
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

      {/* MOBILE HEADER */}
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
        <div className={styles.mobileHeaderProfileBell}>
          <div className={styles.mobileHeaderActions}>
            <div
              className={styles.notificationWrapper}
              ref={notificationDropdownRef}
            >
              <button
                type="button"
                className={styles.notificationBell}
                onClick={() => {
                  unlockNotificationSound();
                  setShowNotifications((previous) => !previous);
                }}
                aria-label="Toggle credit notifications"
                aria-expanded={showNotifications}
              >
                <span aria-hidden="true">
                  <Icon name="bell" size={20} />
                </span>
                {notificationCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.notificationDropdownHeader}>
                    <div>
                      <h3>Notifications</h3>
                      <p>Recent credit activity</p>
                    </div>
                    <button type="button" onClick={openCreditNotifications}>
                      View all
                    </button>
                  </div>

                  {recentNotifications.length === 0 ? (
                    <div className={styles.notificationEmpty}>
                      No credit notifications yet.
                    </div>
                  ) : (
                    <div className={styles.notificationDropdownList}>
                      {recentNotifications.slice(0, 5).map((item, index) => {
                        const isPayment =
                          getNotificationType(item) === "repayment";

                        return (
                          <button
                            type="button"
                            key={
                              getNotificationId(item) ?? `notification-${index}`
                            }
                            className={styles.notificationDropdownItem}
                            onClick={openCreditNotifications}
                          >
                            <span
                              className={`${styles.notificationEventIcon} ${
                                isPayment
                                  ? styles.notificationPayment
                                  : styles.notificationSale
                              }`}
                            >
                              {isPayment ? "✓" : "↗"}
                            </span>

                            <span className={styles.notificationItemText}>
                              <strong>
                                {isPayment
                                  ? "Customer repayment"
                                  : "Credit sale"}
                              </strong>
                              <span>
                                {item.message || "Credit activity recorded."}
                              </span>
                              <small>
                                {item.created_at
                                  ? new Date(item.created_at).toLocaleString(
                                      "en-ET",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      },
                                    )
                                  : "Date unavailable"}
                              </small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.notificationFooter}
                    onClick={openCreditNotifications}
                  >
                    Open notification history →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.mobileProfile} ref={mobileProfileRef}>
            <button
              type="button"
              className={styles.profileTrigger}
              onClick={() => setShowProfileMenu((previous) => !previous)}
              aria-label="Toggle profile menu"
              aria-expanded={showProfileMenu}
            >
              <span>
                <Icon name="profile" size={19} />
              </span>
            </button>

            {showProfileMenu && profileDropdown}
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
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
                onClick={() => navigateAndCloseMenus("/admin/payment-methods")}
              >
                <Icon name="payment" size={19} />
                <span>Payment Methods</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateAndCloseMenus("/admin/credit-notifications")
                }
              >
                <Icon name="payment" size={19} />
                <span>Credit Notifications</span>
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

      {/* MAIN AREA */}
      <div className={styles.mainArea}>
        {/* TOP HEADER */}
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
                aria-label="Search products"
              />
            </div>

            {/* PROFESSIONAL TOAST */}
            {notification.message && (
              <div className={styles.toast} role="alert" aria-live="assertive">
                <div
                  className={`${styles.iconWrap} ${
                    notification.type === "repayment"
                      ? styles.repaymentIcon
                      : styles.creditIcon
                  }`}
                >
                  <span className={styles.icon}>
                    {notification.type === "repayment" ? "✓" : "+"}
                  </span>
                </div>

                <div className={styles.content}>
                  <div className={styles.header}>
                    <strong>Abdu Mart</strong>
                    <span
                      className={`${styles.status} ${
                        notification.type === "repayment"
                          ? styles.repaymentStatus
                          : styles.creditStatus
                      }`}
                    >
                      {notification.type === "repayment"
                        ? "REPAYMENT"
                        : notification.type === "error"
                          ? "ERROR"
                          : notification.type === "success"
                            ? "UPDATE"
                            : "CREDIT SALE"}
                    </span>
                  </div>

                  <p className={styles.message}>{notification.message}</p>

                  <button
                    type="button"
                    className={styles.viewButton}
                    onClick={openCreditNotifications}
                  >
                    View notifications <span aria-hidden="true">→</span>
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Dismiss notification"
                  onClick={dismissNotification}
                >
                  ×
                </button>
              </div>
            )}

            {/* NOTIFICATION BELL AND DROPDOWN */}
            <div
              className={styles.notificationWrapper}
              ref={notificationDropdownRef}
            >
              <button
                type="button"
                className={styles.notificationBell}
                onClick={() => {
                  unlockNotificationSound();
                  setShowNotifications((previous) => !previous);
                }}
                aria-label="Toggle credit notifications"
                aria-expanded={showNotifications}
              >
                <span aria-hidden="true">
                  <Icon name="bell" size={20} />
                </span>
                {notificationCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.notificationDropdownHeader}>
                    <div>
                      <h3>Notifications</h3>
                      <p>Recent credit activity</p>
                    </div>
                    <button type="button" onClick={openCreditNotifications}>
                      View all
                    </button>
                  </div>

                  {recentNotifications.length === 0 ? (
                    <div className={styles.notificationEmpty}>
                      No credit notifications yet.
                    </div>
                  ) : (
                    <div className={styles.notificationDropdownList}>
                      {recentNotifications.slice(0, 5).map((item, index) => {
                        const isPayment =
                          getNotificationType(item) === "repayment";

                        return (
                          <button
                            type="button"
                            key={
                              getNotificationId(item) ?? `notification-${index}`
                            }
                            className={styles.notificationDropdownItem}
                            onClick={openCreditNotifications}
                          >
                            <span
                              className={`${styles.notificationEventIcon} ${
                                isPayment
                                  ? styles.notificationPayment
                                  : styles.notificationSale
                              }`}
                            >
                              {isPayment ? "✓" : "↗"}
                            </span>

                            <span className={styles.notificationItemText}>
                              <strong>
                                {isPayment
                                  ? "Customer repayment"
                                  : "Credit sale"}
                              </strong>
                              <span>
                                {item.message || "Credit activity recorded."}
                              </span>
                              <small>
                                {item.created_at
                                  ? new Date(item.created_at).toLocaleString(
                                      "en-ET",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      },
                                    )
                                  : "Date unavailable"}
                              </small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.notificationFooter}
                    onClick={openCreditNotifications}
                  >
                    Open notification history →
                  </button>
                </div>
              )}
            </div>

            {/* DESKTOP PROFILE */}
            <div className={styles.profileMenu} ref={desktopProfileRef}>
              <button
                type="button"
                className={styles.profileTrigger}
                onClick={() => setShowProfileMenu((previous) => !previous)}
                aria-expanded={showProfileMenu}
                aria-label="Toggle profile menu"
              >
                <div className={styles.profileAvatar}>
                  <Icon name="profile" size={19} />
                </div>
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

              {showProfileMenu && profileDropdown}
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className={styles.dashboardContent}>
          {/* WELCOME */}
          <section className={styles.welcomeCard}>
            <div>
              <h2>Welcome back, Admin 👋</h2>
              <p>Here's what's happening with your store today.</p>
            </div>

            <div className={styles.welcomeActions}>
              <PushNotificationSetup />

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

          {/* STATISTICS */}
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

          {/* PRODUCTS AND RIGHT SIDEBAR */}
          <div className={styles.dashboardGrid}>
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

              {/* SEARCH, CATEGORY AND SORT */}
              <div className={styles.productToolbar}>
                <div className={styles.productSearch}>
                  <Icon name="search" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    aria-label="Search products"
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
                  aria-label="Filter by category"
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
                  aria-label="Sort products"
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

              {/* CATEGORY CHIPS */}
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

              {/* PRODUCT STATES */}
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
                  {/* DESKTOP PRODUCT TABLE */}
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
                              aria-label={`Edit ${product.name}`}
                            >
                              <Icon name="edit" size={17} />
                            </button>

                            <button
                              type="button"
                              className={`${styles.iconActionButton} ${styles.deleteIconButton}`}
                              onClick={() => handleDelete(product.id)}
                              title="Delete product"
                              aria-label={`Delete ${product.name}`}
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
                        startIndex + PRODUCTS_PER_PAGE,
                        sortedProducts.length,
                      )}{" "}
                      of {sortedProducts.length} products
                    </span>

                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) => Math.max(1, page - 1))
                          }
                          disabled={safePage === 1}
                          aria-label="Previous page"
                        >
                          ‹
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => {
                          const page = index + 1;

                          return (
                            <button
                              type="button"
                              key={page}
                              className={
                                safePage === page ? styles.activePage : ""
                              }
                              onClick={() => setCurrentPage(page)}
                              aria-current={
                                safePage === page ? "page" : undefined
                              }
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.min(totalPages, page + 1),
                            )
                          }
                          disabled={safePage === totalPages}
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

            {/* RIGHT SIDEBAR */}
            <aside className={styles.dashboardAside}>
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

                <button
                  type="button"
                  onClick={() => navigate("/admin/credit-notifications")}
                >
                  <span className={styles.quickActionIcon}>
                    <Icon name="payment" size={17} />
                  </span>
                  <span>Credit Notifications</span>
                  <b>›</b>
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {/* DELETE MODAL */}
      {deleteProductId != null && (
        <div className={styles.deleteModalOverlay} onClick={cancelDelete}>
          <div
            className={styles.deleteModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.deleteModalIcon}>
              <Icon name="warning" size={25} />
            </div>

            <h2 id="delete-product-title">Delete Product?</h2>

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

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className={styles.bottomNav} aria-label="Mobile navigation">
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
