import { useState } from "react";
import { useNavigate } from "react-router";
import styles from "./More.module.css";
import Image from "../../assets/shoping-logo.png";

function More() {
  const navigate = useNavigate();

  // ================================
  // DROPDOWN STATES
  // ================================

  const [openSection, setOpenSection] = useState(null);

  // ================================
  // HOME
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

  // ================================
  // DROPDOWN
  // ================================

  const toggleSection = (section) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <div className={styles.page}>
      {/* ================================
          HEADER
      ================================= */}

      <header className={styles.header}>
        <div>
          <h1>More</h1>
          <p>Abdu Mart information</p>
        </div>

        <button
          type="button"
          onClick={handleHome}
          className={styles.headerIcon}
        >
          🏠
        </button>
      </header>

      {/* ================================
          SHOP CARD
      ================================= */}

      <section className={styles.shopCard}>
        <div className={styles.shopIcon}>
          <img src={Image} alt="Abdu Mart logo" />
        </div>

        <div>
          <h2>Abdu Mart</h2>
          <p>Your local digital shelf</p>
        </div>
      </section>

      {/* ================================
          OPTIONS
      ================================= */}

      <main className={styles.options}>
        {/* =================================
            SHOP INFORMATION
        ================================= */}

        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.option}
            onClick={() => toggleSection("shop")}
          >
            <div className={styles.optionIcon}>🏪</div>

            <div className={styles.optionContent}>
              <h3>Shop Information</h3>
              <p>Learn more about our shop</p>
            </div>

            <span
              className={`${styles.arrow} ${
                openSection === "shop" ? styles.arrowOpen : ""
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

          {openSection === "shop" && (
            <div className={styles.dropdown}>
              <div className={styles.infoRow}>
                <span>Shop Name</span>
                <strong>Abdu Mart</strong>
              </div>

              <div className={styles.infoRow}>
                <span>Location</span>
                <strong>Adama, Ethiopia</strong>
              </div>

              <div className={styles.infoRow}>
                <span>Opening Hours</span>
                <strong>8:00 AM – 8:00 PM</strong>
              </div>

              <div className={styles.infoDescription}>
                <span>About Our Shop</span>

                <p>
                  Welcome to Abdu Mart. Browse our products, check prices and
                  availability directly from your phone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =================================
            ABOUT ABDU MART
        ================================= */}

        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.option}
            onClick={() => toggleSection("about")}
          >
            <div className={styles.optionIcon}>ℹ️</div>

            <div className={styles.optionContent}>
              <h3>About Abdu Mart</h3>
              <p>About our digital shop</p>
            </div>

            <span
              className={`${styles.arrow} ${
                openSection === "about" ? styles.arrowOpen : ""
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

          {openSection === "about" && (
            <div className={styles.dropdown}>
              <div className={styles.aboutLogo}>
                <img src={Image} alt="Abdu Mart" />
              </div>

              <h4>Abdu Mart</h4>

              <p className={styles.aboutText}>
                Abdu Mart is a simple digital shelf that helps customers browse
                products, check prices and see product availability using their
                phone.
              </p>

              <div className={styles.version}>Digital Shelf</div>
            </div>
          )}
        </div>

        {/* =================================
            CONTACT US
        ================================= */}

        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.option}
            onClick={() => toggleSection("contact")}
          >
            <div className={styles.optionIcon}>📞</div>

            <div className={styles.optionContent}>
              <h3>Contact Us</h3>
              <p>Get in touch with us</p>
            </div>

            <span
              className={`${styles.arrow} ${
                openSection === "contact" ? styles.arrowOpen : ""
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

          {openSection === "contact" && (
            <div className={styles.dropdown}>
              <div className={styles.infoRow}>
                <span>Phone</span>

                <a href="tel:+251900000000" className={styles.infoLink}>
                  +251 900 000 000
                </a>
              </div>

              <div className={styles.infoRow}>
                <span>WhatsApp</span>

                <a
                  href="https://wa.me/251900000000"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.infoLink}
                >
                  Chat with us
                </a>
              </div>

              <div className={styles.infoRow}>
                <span>Email</span>

                <a href="mailto:info@abdumart.com" className={styles.infoLink}>
                  info@abdumart.com
                </a>
              </div>

              <div className={styles.infoDescription}>
                <span>Need Help?</span>

                <p>
                  Contact us if you have questions about products, prices or
                  availability.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =================================
            ADMIN PANEL
        ================================= */}

        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.option}
            onClick={() => toggleSection("admin")}
          >
            <div className={styles.optionIcon}>🔐</div>

            <div className={styles.optionContent}>
              <h3>Admin Panel</h3>
              <p>Management access</p>
            </div>

            <span
              className={`${styles.arrow} ${
                openSection === "admin" ? styles.arrowOpen : ""
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

          {openSection === "admin" && (
            <div className={styles.dropdown}>
              <div className={styles.adminNotice}>
                <div className={styles.adminNoticeIcon}>🔐</div>

                <div>
                  <strong>Admin Access</strong>

                  <p>This area is only for the shop administrator.</p>
                </div>
              </div>

              <button
                type="button"
                className={styles.adminButton}
                onClick={() => navigate("/admin")}
              >
                Open Admin Panel
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ================================
          BOTTOM NAVIGATION
      ================================= */}

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
          className={styles.bottomNavItem}
          onClick={() => navigate("/categories")}
        >
          <span>▦</span>
          <small>Categories</small>
        </button>

        <button
          type="button"
          className={`${styles.bottomNavItem} ${styles.active}`}
        >
          <span>⋯</span>
          <small>More</small>
        </button>
      </nav>
    </div>
  );
}

export default More;
