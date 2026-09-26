import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./PaymentMethods.module.css";
import API_URL from "../../config/api";

function PaymentMethods() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const [formData, setFormData] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
  });

  // ==============================
  // NOTIFICATION
  // ==============================

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
    }, 2500);
  };

  // ==============================
  // GET PAYMENT METHODS
  // ==============================

  const fetchPayments = () => {
    fetch(`${API_URL}/api/payment-methods`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch payment methods");
        }

        return response.json();
      })
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);

        showNotification(
          "Failed to load payment methods.",
          "error",
        );
      });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ==============================
  // FORM INPUT
  // ==============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================
  // CLEAR FORM
  // ==============================

  const clearForm = () => {
    setFormData({
      bank_name: "",
      account_name: "",
      account_number: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ==============================
  // ADD / UPDATE
  // ==============================

  const handleSubmit = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    const url = editingId
      ? `${API_URL}/api/payment-methods/${editingId}`
      : `${API_URL}/api/payment-methods`;

    const method = editingId ? "PUT" : "POST";

    const body = editingId
      ? formData
      : {
          ...formData,
          is_active: 1,
        };

    fetch(url, {
      method,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              data.message || "Something went wrong",
            );
          });
        }

        return response.json();
      })
      .then((data) => {
        showNotification(
          data.message ||
            (editingId
              ? "Payment method updated successfully!"
              : "Payment method added successfully!"),
          "success",
        );

        clearForm();
        fetchPayments();
      })
      .catch((error) => {
        console.error(error);

        showNotification(
          error.message || "Something went wrong.",
          "error",
        );
      });
  };

  // ==============================
  // EDIT
  // ==============================

  const handleEdit = (payment) => {
    setFormData({
      bank_name: payment.bank_name,
      account_name: payment.account_name,
      account_number: payment.account_number,
    });

    setEditingId(payment.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // DELETE MODAL
  // ==============================

  const openDeleteModal = (id) => {
    setDeleteId(id);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
  };

  // ==============================
  // DELETE PAYMENT
  // ==============================

  const handleDelete = () => {
    if (!deleteId) {
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/payment-methods/${deleteId}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete payment method");
        }

        return response.json();
      })
      .then((data) => {
        closeDeleteModal();

        showNotification(
          data.message || "Payment method deleted successfully!",
          "success",
        );

        fetchPayments();
      })
      .catch((error) => {
        console.error(error);

        closeDeleteModal();

        showNotification(
          error.message || "Failed to delete payment method.",
          "error",
        );
      });
  };

  return (
    <section className={styles.container}>

      {/* ==============================
          TOP BAR
      ============================== */}

      <div className={styles.topBar}>

        <button
          className={styles.backButton}
          onClick={() => navigate("/admin")}
        >
          <span>←</span>
          Back
        </button>

      </div>


      {/* ==============================
          PAGE HEADER
      ============================== */}

      <div className={styles.header}>

        <div className={styles.headerText}>

          <div>
            <h2>Payment Methods</h2>

            <p>
              Manage the bank accounts customers can
              use for payment.
            </p>
          </div>

        </div>


        <button
          className={styles.addButton}
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        >
          <span>+</span>
          Add Bank
        </button>

      </div>


      {/* ==============================
          NOTIFICATION
      ============================== */}

      {notification.message && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.success
              : styles.error
          }`}
        >
          <span className={styles.notificationIcon}>
            {notification.type === "success"
              ? "✓"
              : "!"}
          </span>

          <p>{notification.message}</p>

          <button
            onClick={() =>
              setNotification({
                message: "",
                type: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}


      {/* ==============================
          FORM
      ============================== */}

      {showForm && (
        <div className={styles.formCard}>

          <div className={styles.formHeader}>

            <div>
              <span className={styles.formLabel}>
                {editingId ? "EDIT ACCOUNT" : "NEW ACCOUNT"}
              </span>

              <h3>
                {editingId
                  ? "Edit payment method"
                  : "Add payment method"}
              </h3>
            </div>

            <button
              className={styles.closeButton}
              onClick={clearForm}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className={styles.formGrid}>

              <div className={styles.formGroup}>
                <label>Bank Name</label>

                <input
                  type="text"
                  name="bank_name"
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  value={formData.bank_name}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className={styles.formGroup}>
                <label>Account Name</label>

                <input
                  type="text"
                  name="account_name"
                  placeholder="e.g. Abdu Mart"
                  value={formData.account_name}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className={styles.formGroup}>
                <label>Account Number</label>

                <input
                  type="text"
                  name="account_number"
                  placeholder="Enter account number"
                  value={formData.account_number}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            <div className={styles.formActions}>

              <button
                type="button"
                className={styles.cancelButton}
                onClick={clearForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.saveButton}
              >
                {editingId
                  ? "Update Account"
                  : "Save Account"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* ==============================
          PAYMENT LIST
      ============================== */}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>

          <p>Loading payment methods...</p>
        </div>

      ) : payments.length === 0 ? (

        <div className={styles.empty}>

          <div className={styles.emptyIcon}>
            🏦
          </div>

          <h3>No payment methods yet</h3>

          <p>
            Add a bank account so customers can
            easily make payments.
          </p>

          <button
            className={styles.emptyButton}
            onClick={() => {
              clearForm();
              setShowForm(true);
            }}
          >
            + Add Bank Account
          </button>

        </div>

      ) : (

        <div className={styles.paymentList}>

          {payments.map((payment) => (

            <div
              className={styles.paymentCard}
              key={payment.id}
            >

              <div className={styles.bankIcon}>
                🏦
              </div>


              <div className={styles.paymentInfo}>

                <h3>{payment.bank_name}</h3>

                <p>{payment.account_name}</p>

                <strong>
                  {payment.account_number}
                </strong>

              </div>


              <div className={styles.actions}>

                <button
                  className={styles.editButton}
                  onClick={() =>
                    handleEdit(payment)
                  }
                >
                  Edit
                </button>

                <button
                  className={styles.deleteButton}
                  onClick={() =>
                    openDeleteModal(payment.id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* ==============================
          DELETE MODAL
      ============================== */}

      {deleteId && (
        <div
          className={styles.modalOverlay}
          onClick={closeDeleteModal}
        >

          <div
            className={styles.deleteModal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className={styles.deleteIcon}>
              🗑️
            </div>

            <h3>Delete payment method?</h3>

            <p>
              This bank account will be permanently
              removed from your payment methods.
            </p>

            <div className={styles.deleteActions}>

              <button
                className={styles.modalCancel}
                onClick={closeDeleteModal}
              >
                Cancel
              </button>

              <button
                className={styles.modalDelete}
                onClick={handleDelete}
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default PaymentMethods;