import { useEffect, useState } from "react";
import styles from "./promoCarasole.module.css";

const promotions = [
  {
    id: 1,
    title: "Special Offer",
    subtitle: "Discover our latest products",
    button: "Shop Now",
    image: null,
  },
  {
    id: 2,
    title: "Fresh Products",
    subtitle: "Check what's available today",
    button: "View Products",
    image: null,
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Something new is waiting for you",
    button: "Explore",
    image: null,
  },
];

function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ================================
  // AUTO SLIDE
  // ================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((current) =>
        current === promotions.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ================================
  // PREVIOUS
  // ================================

  const handlePrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? promotions.length - 1 : current - 1,
    );
  };

  // ================================
  // NEXT
  // ================================

  const handleNext = () => {
    setCurrentIndex((current) =>
      current === promotions.length - 1 ? 0 : current + 1,
    );
  };

  const promotion = promotions[currentIndex];

  return (
    <section className={styles.carousel}>
      {/* SLIDE */}

      <div className={styles.slide}>
        {/* TEXT */}

        <div className={styles.content}>
          <span className={styles.badge}>Special</span>

          <h2>{promotion.title}</h2>

          <p>{promotion.subtitle}</p>

          <button type="button" className={styles.button}>
            {promotion.button}
            <span>→</span>
          </button>
        </div>

        {/* IMAGE / DECORATION */}

        <div className={styles.visual}>
          {promotion.image ? (
            <img src={promotion.image} alt={promotion.title} />
          ) : (
            <div className={styles.visualIcon}>🛍️</div>
          )}
        </div>
      </div>

      {/* ARROWS */}

      <button
        type="button"
        className={`${styles.arrow} ${styles.left}`}
        onClick={handlePrevious}
        aria-label="Previous promotion"
      >
        ‹
      </button>

      <button
        type="button"
        className={`${styles.arrow} ${styles.right}`}
        onClick={handleNext}
        aria-label="Next promotion"
      >
        ›
      </button>

      {/* DOTS */}

      <div className={styles.dots}>
        {promotions.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to promotion ${index + 1}`}
            className={`${styles.dot} ${
              index === currentIndex ? styles.activeDot : ""
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default PromoCarousel;
