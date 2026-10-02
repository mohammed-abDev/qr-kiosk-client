import { useEffect, useState } from "react";
import styles from "./promoCarasole.module.css";
import API_URL from "../../config/api";

function PromoCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch active banners
  useEffect(() => {
    fetch(`${API_URL}/api/banners/active`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch banners");
        }

        return response.json();
      })
      .then((data) => {
        setBanners(data);
      })
      .catch((error) => {
        console.error("Banner error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) =>
        current === banners.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  const handlePrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? banners.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((current) =>
      current === banners.length - 1 ? 0 : current + 1,
    );
  };

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <section className={styles.carousel}>
      <div className={styles.slider}>
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`${styles.slide} ${
              index === currentIndex ? styles.active : ""
            }`}
          >
            <img
              src={banner.image_url}
              alt="Shop promotion"
              className={styles.image}
            />
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button
              className={`${styles.arrow} ${styles.previous}`}
              onClick={handlePrevious}
              aria-label="Previous banner"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 18l-6-6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className={`${styles.arrow} ${styles.next}`}
              onClick={handleNext}
              aria-label="Next banner"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 18l6-6-6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className={styles.dots}>
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              className={`${styles.dot} ${
                index === currentIndex ? styles.activeDot : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PromoCarousel;
