import { useNavigate } from "react-router";
import styles from "./PageNotFound.module.css";
import image from "../../assets/shoping-logo.png";


function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
            <img src={image} alt="Shop Logo" />
        </div>

        <div className={styles.errorCode}>404</div>

        <h1>Page Not Found</h1>

        <p>
          Sorry, the page you're looking for doesn't exist or may have been
          moved.
        </p>

        <button className={styles.homeButton} onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>
    </div>
  );
}

export default PageNotFound;
