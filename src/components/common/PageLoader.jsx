import styles from "./PageLoader.module.css";
import image from "../../assets/shoping-logo.png"

function PageLoader() {
  return (
    <div className={styles.loaderPage}>
      <div className={styles.loaderContent}>
        <div className={styles.logoBox}>
            <div className={styles.loginIcon}><img src={image} alt="Shop Logo" /></div>
        </div>

        <h1>ABDU Mart</h1>

        <p>Loading...</p>

        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}

export default PageLoader;
