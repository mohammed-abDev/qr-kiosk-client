import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./CategoryManager.module.css";
import API_URL from "../../config/api";


function CategoryManager() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const token = localStorage.getItem("token");

  // ================================
  // GET CATEGORIES
  // ================================

  const fetchCategories = () => {
    fetch(`${API_URL}/api/categories`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load categories");
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================================
  // CLEAR FORM
  // ================================

  const clearForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  // ================================
  // ADD / UPDATE CATEGORY
  // ================================

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const url = editingId
      ? `${API_URL}/api/categories/${editingId}`
      : `${API_URL}/api/categories`;

    const method = editingId ? "PUT" : "POST";

    fetch(url, {
      method: method,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
      }),
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || "Failed to save category");
          }

          return data;
        });
      })
      .then(() => {
  setNotification({
    message: editingId
      ? "Category updated successfully!"
      : "Category added successfully!",
    type: "success",
  });

  clearForm();
  fetchCategories();

  setTimeout(() => {
    setNotification({
      message: "",
      type: "",
    });
  }, 2500);
})
      .catch((error) => {
        console.error(error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ================================
  // EDIT CATEGORY
  // ================================

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================================
  // DELETE CATEGORY
  // ================================

 const handleDelete = (id) => {
   const token = localStorage.getItem("token");

   fetch(`${API_URL}/api/categories/${id}`, {
     method: "DELETE",
     headers: {
       Authorization: `Bearer ${token}`,
     },
   })
     .then((response) => {
       if (!response.ok) {
         throw new Error("Failed to delete category.");
       }

       return response.json();
     })
     .then(() => {
       setDeleteCategory(null);

       setNotification({
         message: "Category deleted successfully!",
         type: "success",
       });

       fetchCategories();

       setTimeout(() => {
         setNotification({
           message: "",
           type: "",
         });
       }, 2500);
     })
     .catch((error) => {
       console.error(error);

       setDeleteCategory(null);

       setNotification({
         message: error.message || "Failed to delete category.",
         type: "error",
       });

       setTimeout(() => {
         setNotification({
           message: "",
           type: "",
         });
       }, 3000);
     });
 };

  // ================================
  // PAGE
  // ================================

  return (
    <div className={styles.categoryManagerPage}>
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
      <div className={styles.categoryManagerContainer}>
        {/* BACK */}

        <button
          className={styles.backAdminButton}
          onClick={() => navigate("/admin")}
          type="button"
        >
          ← Back
        </button>

        {/* HEADER */}

        <div className={styles.categoryManagerHeader}>
          <h1>Category Management</h1>

          <p>Organize your kiosk products</p>
        </div>

        {/* ERROR */}

        {error && <div className={styles.categoryError}>{error}</div>}

        {/* FORM */}

        <div className={styles.categoryFormCard}>
          <h2>{editingId ? "Edit Category" : "Add Category"}</h2>

          <form onSubmit={handleSubmit}>
            {/* NAME */}

            <div className={styles.formGroup}>
              <label>Category Name</label>

              <input
                type="text"
                placeholder="Example: Drinks"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className={styles.formGroup}>
              <label>Description</label>

              <textarea
                placeholder="Example: Water and soft drinks"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {/* BUTTONS */}

            <div className={styles.categoryFormButtons}>
              <button
                className={styles.saveButton}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className={styles.cancelEditButton}
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CATEGORY LIST */}

        <div className={styles.categoryListCard}>
          <div className={styles.categoryListHeader}>
            <h2>Categories</h2>

            <span>{categories.length}</span>
          </div>

          {categories.length === 0 ? (
            <div className={styles.message}>No categories found.</div>
          ) : (
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <div className={styles.categoryItem} key={category.id}>
                  <div className={styles.categoryItemInfo}>
                    <h3>{category.name}</h3>

                    <p>{category.description || "No description"}</p>
                  </div>

                  <div className={styles.categoryItemActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(category)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeleteCategory(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/*delet modal  */}
      {deleteCategory && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalIcon}>⚠️</div>

            <h3>Delete Category?</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteCategory.name}</strong>?
            </p>
            <span className={styles.deleteModalWarning}>
              This action cannot be undone.
            </span>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelModalButton}
                onClick={() => setDeleteCategory(null)}
              >
                Cancel
              </button>

              <button
                className={styles.confirmDeleteButton}
                onClick={() => handleDelete(deleteCategory.id)}
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

export default CategoryManager;
