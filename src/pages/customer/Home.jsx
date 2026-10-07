import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./Home.module.css";

import PageLoader from "../../components/common/PageLoader";
import PromoCarousel from "../../components/Carousel/PromoCarousel";
import image from "../../assets/shoping-logo.png";
import API_URL from "../../config/api";

function Home() {
  const navigate = useNavigate();

  // =========================================
  // SHOP
  // =========================================

  const [shop, setShop] = useState(null);

  // =========================================
  // PRODUCTS
  // =========================================

  const productsPerPage = 8;

  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  /* ==============================
   CART
============================== */

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("abduMartCart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [showCart, setShowCart] = useState(false);

  // =========================================
  // SEARCH & CATEGORY
  // =========================================

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [categories, setCategories] = useState([]);

  // =========================================
  // LOADING / ERROR
  // =========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // PAYMENT METHODS
  // =========================================

  const [paymentMethods, setPaymentMethods] = useState([]);

  const [showPayment, setShowPayment] = useState(false);

  const [copiedAccount, setCopiedAccount] = useState("");

  // ==============================
  // CART
  // ==============================

  useEffect(() => {
    localStorage.setItem("abduMartCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product.is_available) return;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((items) => items.filter((item) => item.id !== productId));
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  // =========================================
  // LOCK PAGE SCROLL WHEN MY LIST IS OPEN
  // =========================================

  useEffect(() => {
    if (!showCart) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showCart]);

  // =========================================
  // GET PAYMENT METHODS
  // =========================================

  useEffect(() => {
    fetch(`${API_URL}/api/payment-methods`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch payment methods");
        }

        return response.json();
      })
      .then((data) => {
        setPaymentMethods(data);
      })
      .catch((error) => {
        console.error("Payment methods error:", error);
      });
  }, []);

  // =========================================
  // LOCK PAGE SCROLL WHEN PAYMENT IS OPEN
  // =========================================

  useEffect(() => {
    if (!showPayment) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showPayment]);

  // =========================================
  // GET SHOP
  // =========================================

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

  // =========================================
  // GET PRODUCTS
  // =========================================

  useEffect(() => {
    const fetchProducts = () => {
      fetch(`${API_URL}/api/products?_=${Date.now()}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch products");
          }

          return response.json();
        })
        .then((data) => {
          setProducts(data);
          setLoading(false);
          setError("");
        })
        .catch((error) => {
          console.error("Product error:", error);

          setError("Could not load products.");
          setLoading(false);
        });
    };

    fetchProducts();

    const refreshInterval = setInterval(fetchProducts, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // =========================================
  // GET CATEGORIES
  // =========================================

  useEffect(() => {
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
  }, []);

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

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

  // =========================================
  // PAGINATION
  // =========================================

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  // =========================================
  // RESET PAGE
  // =========================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // =========================================
  // CLEAR SEARCH
  // =========================================

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  // =========================================
  // CLEAR FILTERS
  // =========================================

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  // =========================================
  // HOME
  // =========================================

  const handleHome = () => {
    setSearch("");
    setSelectedCategory("All");
    setCurrentPage(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================
  // VIEW ALL PRODUCTS
  // =========================================

  const handleViewAll = () => {
    setSearch("");
    setSelectedCategory("All");
    setCurrentPage(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================
  // CATEGORY ICON
  // =========================================

  // const getCategoryIcon = (name) => {
  //   const category = name?.toLowerCase().trim();

  //   if (category === "snacks") return "▣";
  //   if (category === "drinks") return "◉";
  //   if (category === "food") return "♨";
  //   if (category === "dairy") return "▥";
  //   if (category === "bakery") return "◒";
  //   if (category === "household") return "⌂";

  //   return "□";
  // };

  // =========================================
  // COPY ACCOUNT
  // =========================================

  const handleCopyAccount = async (accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber);

      setCopiedAccount(accountNumber);

      setTimeout(() => {
        setCopiedAccount("");
      }, 2000);
    } catch (error) {
      console.error("Copy account error:", error);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return <PageLoader />;
  }

  // =========================================
  // PAGE
  // =========================================
  return (
    <div className={styles.app}>
      {/* =====================================================
        DESKTOP SIDEBAR
    ===================================================== */}

      <aside className={styles.desktopSidebar}>
        {/* BRAND */}

        <button
          className={styles.sidebarBrand}
          onClick={handleHome}
          type="button"
        >
          <div className={styles.sidebarLogo}>
            {shop?.logo ? (
              <img src={shop.logo} alt={shop?.name || "Abdu Mart"} />
            ) : (
              <img src={image} alt="Abdu Mart" />
            )}
          </div>

          <div>
            <strong>{shop?.name || "ABDU MART"}</strong>
            <span>Digital Shelf</span>
          </div>
        </button>

        {/* NAVIGATION */}

        <nav className={styles.sidebarNavigation}>
          <button
            className={`${styles.sidebarNavItem} ${styles.sidebarNavActive}`}
            onClick={handleHome}
            type="button"
          >
            <span>⌂</span>
            Home
          </button>

          <button
            className={styles.sidebarNavItem}
            onClick={() => navigate("/categories")}
            type="button"
          >
            <span>▦</span>
            Categories
          </button>

          <button
            className={styles.sidebarNavItem}
            onClick={() => {
              navigate("/more");
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            type="button"
          >
            <span>•••</span>
            More
          </button>
        </nav>

        {/* DELIVERY CARD */}

        <div className={styles.deliveryCard}>
          <div className={styles.deliveryIcon}>♟</div>

          <div>
            <strong>Abdu-Mart</strong>
            <span>Version 1.0.0</span>
            <b>@ 2026 G.c</b>
          </div>
        </div>
      </aside>

      {/* =====================================================
        MAIN AREA
    ===================================================== */}

      <div className={styles.mainArea}>
        {/* =================================================
          DESKTOP TOP HEADER
      ================================================= */}

        <header className={styles.topHeader}>
          {/* <div className={styles.mobileBrand}>
            <button
              type="button"
              onClick={handleHome}
              className={styles.mobileBrandButton}
            >
              <div className={styles.mobileLogo}>
                {shop?.logo ? (
                  <img src={shop.logo} alt={shop?.name || "Abdu Mart"} />
                ) : (
                  <img src={image} alt="Abdu Mart" />
                )}
              </div>

              <div>
                <strong>{shop?.name || "ABDU MART"}</strong>
                <span>Digital Shelf</span>
              </div>
            </button>

            <button
              type="button"
              className={styles.mobileCartButton}
              onClick={() => setShowCart(true)}
            >
              🛒
              {cartCount > 0 && <span>{cartCount}</span>}
            </button>
          </div> */}
          <div className={styles.mobileBrand}>
            <button
              type="button"
              onClick={handleHome}
              className={styles.mobileBrandButton}
            >
              <div className={styles.mobileLogo}>
                {shop?.logo ? (
                  <img src={shop.logo} alt={shop?.name || "Abdu Mart"} />
                ) : (
                  <img src={image} alt="Abdu Mart" />
                )}
              </div>

              <div>
                <strong>{shop?.name || "ABDU MART"}</strong>
                <span>Digital Shelf</span>
              </div>
            </button>

            <div className={styles.mobileHeaderActions}>
              {/* BANK INFO */}

              <button
                type="button"
                className={styles.mobileBankButton}
                onClick={() => setShowPayment(true)}
                aria-label="Bank information"
              >
                🏦
                <span>Bank </span>
              </button>

              {/* MY LIST */}

              <button
                type="button"
                className={styles.mobileCartButton}
                onClick={() => setShowCart(true)}
                aria-label="My List"
              >
                🛒
                {cartCount > 0 && <span>{cartCount}</span>}
              </button>
            </div>
          </div>

          {/* SEARCH */}

          <div className={styles.headerSearch}>
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search for products, categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className={styles.clearSearch}
              >
                ×
              </button>
            )}

            <div className={styles.searchButton}>⌕</div>
          </div>

          {/* DESKTOP HEADER ACTIONS */}

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.bankInfoButton}
              onClick={() => setShowPayment(true)}
            >
              🏦
              <span>Bank Info</span>
            </button>

            <button
              type="button"
              className={styles.cartButton}
              onClick={() => setShowCart(true)}
            >
              🛒
              <span>My List ({cartCount})</span>
            </button>
          </div>
        </header>

        {/* =================================================
          MOBILE SEARCH
      ================================================= */}

        <div className={styles.mobileSearchWrapper}>
          <div className={styles.mobileSearch}>
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search products, categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button type="button" onClick={clearSearch}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* =================================================
          CONTENT
      ================================================= */}

        <main className={styles.content}>
          {/* ================================================
            PROMOTIONAL BANNER
        ================================================= */}

          <section className={styles.heroSection}>
            <PromoCarousel />
          </section>

          {/* ================================================
            CATEGORY FILTER
        ================================================= */}

          <section className={styles.categorySection}>
            <div className={styles.categoryScroller}>
              <button
                type="button"
                className={
                  selectedCategory === "All"
                    ? `${styles.categoryButton} ${styles.categoryActive}`
                    : styles.categoryButton
                }
                onClick={() => setSelectedCategory("All")}
              >
                <span>▦</span>
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={
                    selectedCategory === category.name
                      ? `${styles.categoryButton} ${styles.categoryActive}`
                      : styles.categoryButton
                  }
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {/* <span>
                    {category.name?.toLowerCase().includes("snack")
                      ? "▣"
                      : category.name?.toLowerCase().includes("drink")
                        ? "◈"
                        : category.name?.toLowerCase().includes("food")
                          ? "◆"
                          : "□"}
                  </span> */}

                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {/* ================================================
            PRODUCTS HEADER
        ================================================= */}

          <div className={styles.productsHeader}>
            <div>
              <h2>Popular products</h2>

              <p>
                {selectedCategory === "All"
                  ? "Everyday essentials from Abdu Mart"
                  : selectedCategory}
              </p>
            </div>

            <button
              type="button"
              className={styles.viewAllButton}
              onClick={() => {
                setSelectedCategory("All");

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              View all
              <span>›</span>
            </button>
          </div>

          {/* ================================================
            LOADING
        ================================================= */}

          {loading && (
            <div className={styles.customerState}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading products...</p>
            </div>
          )}

          {/* ================================================
            ERROR
        ================================================= */}

          {!loading && error && (
            <div className={`${styles.customerState} ${styles.errorState}`}>
              <div className={styles.errorIcon}>⚠</div>

              <h3>Something went wrong</h3>

              <p>{error}</p>

              <p>Please check your internet connection and try again.</p>

              <button
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* ================================================
            PRODUCTS
        ================================================= */}

          {!loading && !error && (
            <section className={styles.productsSection}>
              {filteredProducts.length === 0 ? (
                <div className={styles.noProducts}>
                  <div className={styles.noProductsIcon}>⌕</div>

                  <h3>No products found</h3>

                  <p>Try another search or category.</p>

                  {(search || selectedCategory !== "All") && (
                    <button
                      className={styles.clearSearchButton}
                      onClick={() => {
                        clearSearch();
                        setSelectedCategory("All");
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.productGrid}>
                    {currentProducts.map((product) => (
                      <article
                        className={styles.productCard}
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {/* IMAGE */}

                        <div className={styles.productImage}>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name || "Product"}
                            />
                          ) : (
                            <span>🛍️</span>
                          )}
                        </div>

                        {/* INFO */}

                        <div className={styles.productInfo}>
                          <span className={styles.productCategory}>
                            {product.category_name || "Other"}
                          </span>

                          <h3>{product.name}</h3>

                          {product.description && <p>{product.description}</p>}

                          <div className={styles.productPriceRow}>
                            <strong>
                              {Number(product.price).toFixed(2)} Birr
                            </strong>

                            {product.is_available ? (
                              <span className={styles.available}>
                                ● Available
                              </span>
                            ) : (
                              <span className={styles.unavailable}>
                                ● Out of stock
                              </span>
                            )}
                          </div>

                          {/* ADD TO CART */}

                          <button
                            type="button"
                            className={styles.addToCartButton}
                            disabled={!product.is_available}
                            onClick={(event) => {
                              event.stopPropagation();

                              if (product.is_available) {
                                addToCart(product);
                              }
                            }}
                          >
                            <span>🛒</span>

                            {product.is_available
                              ? "Add to My List"
                              : "Out of Stock"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* ========================================
                    PAGINATION
                ======================================== */}
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => page - 1)}
                        disabled={currentPage === 1}
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          type="button"
                          key={index}
                          className={
                            currentPage === index + 1 ? styles.activePage : ""
                          }
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => page + 1)}
                        disabled={currentPage === totalPages}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </main>

        {/* =================================================
          DESKTOP CART PANEL
      ================================================= */}

        <aside className={styles.desktopCart}>
          <div className={styles.cartHeader}>
            <div>
              <h2>Your List</h2>
              <span>
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            </div>

            <span className={styles.cartIcon}>🛒</span>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <div>🛒</div>

              <h3>Your List is empty</h3>

              <p>Add products to see them here.</p>
            </div>
          ) : (
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <div className={styles.cartItem} key={item.id}>
                  <div className={styles.cartItemImage}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>

                  <div className={styles.cartItemInfo}>
                    <strong>{item.name}</strong>

                    <span>{Number(item.price).toFixed(2)} Birr</span>

                    <div className={styles.quantityControls}>
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.removeCartItem}
                    onClick={() => removeFromCart(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* CART FOOTER */}

          <div className={styles.cartFooter}>
            <div className={styles.cartSubtotal}>
              <span>Subtotal</span>

              <strong>{cartTotal.toFixed(2)} Birr</strong>
            </div>

            <button
              type="button"
              className={styles.viewCartButton}
              onClick={() => setShowCart(true)}
              disabled={cartItems.length === 0}
            >
              View your List
            </button> 
          </div>
        </aside>

        {/* =================================================
          MOBILE CART DRAWER
      ================================================= */}

        {showCart && (
          <div
            className={styles.cartOverlay}
            onClick={() => setShowCart(false)}
          >
            <div
              className={styles.mobileCartDrawer}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.mobileCartHeader}>
                <div>
                  <h2>Your List</h2>
                  <span>{cartCount} items</span>
                </div>

                <button type="button" onClick={() => setShowCart(false)}>
                  ×
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className={styles.emptyCart}>
                  <div>🛒</div>
                  <h3>Your List is empty</h3>
                  <p>Add products to see them here.</p>
                </div>
              ) : (
                <div className={styles.mobileCartItems}>
                  {cartItems.map((item) => (
                    <div className={styles.cartItem} key={item.id}>
                      <div className={styles.cartItemImage}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <span>🛍️</span>
                        )}
                      </div>

                      <div className={styles.cartItemInfo}>
                        <strong>{item.name}</strong>

                        <span>{Number(item.price).toFixed(2)} Birr</span>

                        <div className={styles.quantityControls}>
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.removeCartItem}
                        onClick={() => removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.cartFooter}>
                <div className={styles.cartSubtotal}>
                  <span>Subtotal</span>
                  <strong>{cartTotal.toFixed(2)} Birr</strong>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =================================================
          PAYMENT OVERLAY
      ================================================= */}

        {showPayment && (
          <div
            className={styles.paymentOverlay}
            onClick={() => setShowPayment(false)}
          >
            <div
              className={styles.paymentSheet}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.paymentHandle}></div>

              <div className={styles.paymentHeader}>
                <div>
                  <h2>Payment Methods</h2>
                </div>

                <button
                  className={styles.closePaymentButton}
                  onClick={() => setShowPayment(false)}
                >
                  ×
                </button>
              </div>

              <div className={styles.paymentNotice}>
                <p>
                  Choose a bank below, copy the account number, then make the
                  transfer using your banking app.
                </p>
              </div>

              <div className={styles.paymentMethods}>
                {paymentMethods.length === 0 ? (
                  <div className={styles.noPaymentMethods}>
                    <span>🏦</span>
                    <p>No payment methods available.</p>
                  </div>
                ) : (
                  paymentMethods.map((payment) => (
                    <div className={styles.paymentCard} key={payment.id}>
                      <div className={styles.bankIcon}>🏦</div>

                      <div className={styles.paymentInfo}>
                        <h3>{payment.bank_name}</h3>

                        <span>{payment.account_name}</span>

                        <p>Account Number</p>

                        <div className={styles.accountRow}>
                          <span>{payment.account_number}</span>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                payment.account_number,
                              );

                              setCopiedAccount(payment.account_number);

                              setTimeout(() => {
                                setCopiedAccount("");
                              }, 2000);
                            }}
                          >
                            {copiedAccount === payment.account_number
                              ? "✓ Copied"
                              : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                className={styles.donePaymentButton}
                onClick={() => setShowPayment(false)}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* =================================================
          MOBILE BOTTOM NAV
      ================================================= */}

        <nav className={styles.bottomNav}>
          <button
            type="button"
            className={`${styles.bottomNavItem} ${styles.activeNavItem}`}
            onClick={handleHome}
          >
            <span>⌂</span>
            Home
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => navigate("/categories")}
          >
            <span>▦</span>
            Categories
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => setShowCart(true)}
          >
            <span className={styles.bottomCartIcon}>
              🛒
              {cartCount > 0 && <small>{cartCount}</small>}
            </span>
            My List
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => navigate("/more")}
          >
            <span>•••</span>
            More
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Home;
