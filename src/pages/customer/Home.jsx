import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./Home.module.css";
import PageLoader from "../../components/common/PageLoader";
import image from "../../assets/shoping-logo.png";
import API_URL from "../../config/api";

function Home() {
  const navigate = useNavigate();

  // SHOP
  const [shop, setShop] = useState(null);

  // PRODUCTS
  const [products, setProducts] = useState([]);

  // SEARCH & CATEGORY
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  // LOADING & ERROR
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //PAYMENT METHOD
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState("");

  //==============================
  //PAYMENT METHOD
  //==============================
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
  // GET PRODUCTS
  // ==============================

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
          setError("Could not load products");
          setLoading(false);
        });
    };

    fetchProducts();

    const refreshInterval = setInterval(fetchProducts, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // ==============================
  // GET CATEGORIES
  // ==============================

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Categories error:", error);
      });
  }, []);

  // ==============================
  // FILTER PRODUCTS
  // ==============================

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

  // ==============================
  // CLEAR SEARCH
  // ==============================

  const clearSearch = () => {
    setSearch("");
  };

  // ==============================
  // CUSTOMER HOME
  // ==============================
  if (loading) {
    return <PageLoader />;
  }
  return (
    <div className={styles.app}>
      {/* HEADER */}

      <div className={styles.stickyArea}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            {/* SHOP LOGO */}
            <div className={styles.shopIcon}>
              {shop?.logo ? (
                <img src={shop.logo} alt={shop.name} />
              ) : (
                <img src={image} alt={shop.name} />
              )}
            </div>

            {/* SHOP INFORMATION */}
            <div className={styles.shopInfo}>
              <h1>{shop ? shop.name : "Loading..."}</h1>

              <p>DEGITAL MENU</p>
            </div>

            {/* UPDATED BADGE */}

            <button
              className={styles.paymentButton}
              onClick={() => setShowPayment(true)}
            >
              🏦 Bank Info
            </button>
          </div>

          {/* HEADER DECORATION */}
          <div className={styles.headerAccentContainer}>
            <div className={styles.headerAccent}></div>

            <span>SCAN</span>
            <span>VIEW</span>
            <span>BUY</span>

            <div className={styles.headerAccent}></div>
          </div>
        </header>
      </div>
      {/* MAIN */}

      <main className={styles.container}>
        {/* SEARCH */}
        <div className={styles.stickyControls}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search products, categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* CATEGORIES */}

          <div className={styles.categories}>
            <button
              className={selectedCategory === "All" ? styles.active : ""}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                className={
                  selectedCategory === category.name ? styles.active : ""
                }
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        {/* LOADING */}

        {loading && (
          <div className={styles.customerState}>
            <div className={styles.loadingSpinner}></div>

            <p>Loading products...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className={`${styles.customerState} ${styles.errorState}`}>
            <div className={styles.errorIcon}>⚠️</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* PRODUCTS */}

        {!loading && !error && (
          <section className={styles.products}>
            {filteredProducts.length === 0 ? (
              <div className={styles.noProducts}>
                <div className={styles.noProductsIcon}>🔍</div>

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
              filteredProducts.map((product) => (
                <div
                  className={styles.productCard}
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* IMAGE */}

                  <div
                    className={styles.productImage}
                    style={{
                      "--product-bg": product.image
                        ? `url(${product.image})`
                        : "none",
                    }}
                  >
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>

                  {/* INFORMATION */}

                  <div className={styles.productInfo}>
                    <div className={styles.productTop}>
                      <h2>{product.name}</h2>

                      {product.category_name && (
                        <span className={styles.categoryName}>
                          {product.category_name}
                        </span>
                      )}
                    </div>

                    {product.description && <p>{product.description}</p>}

                    <div className={styles.productBottom}>
                      <strong>{Number(product.price).toFixed(2)} Birr</strong>

                      {product.is_available ? (
                        <span className={styles.available}>Available</span>
                      ) : (
                        <span className={styles.unavailable}>Out of stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </main>
      {/* FOOTER */}

      <footer className={styles.footer}>
        <p className={styles.footerThankYou}>Thank you for visiting ❤️ </p>

        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} {shop?.name || "Our Shop"}
          <span> | </span>
          <button
            className={styles.footerAdminbtn}
            onClick={() => navigate("/admin")}
            type="button"
          >
            {" "}
            Admin Panel
          </button>
        </div>
      </footer>

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
    </div>
  );
}

export default Home;
