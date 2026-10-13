import { useEffect, useState } from "react";
import API_URL from "../../config/api";
import styles from "./CustomerCredit.module.css";

function CustomerCredit() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load customers.");
      }

      // Accept either an array or an object containing the array.
      const customerList = Array.isArray(data)
        ? data
        : data.customers || data.data || [];

      setCustomers(customerList);
    } catch (err) {
      setError(err.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please enter the customer's name and phone number.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          notes: form.notes.trim(),
        }),
      });

    //   const data = await response.json();
      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "Expected JSON but received:",
          responseText.slice(0, 500),
        );

        throw new Error(
          "The API returned HTML instead of JSON. Check the API URL and backend route.",
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not register customer.");
      }

      setForm({
        name: "",
        phone: "",
        notes: "",
      });

      setSuccess("Customer registered successfully.");
      await fetchCustomers();
    } catch (err) {
      setError(err.message || "Could not register customer.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.trim().toLowerCase();

    return (
      (customer.name || "").toLowerCase().includes(searchText) ||
      (customer.phone || "").toLowerCase().includes(searchText)
    );
  });

  const money = (amount) =>
    `${Number(amount || 0).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Birr`;

  const totalOutstanding = customers.reduce(
    (total, customer) => total + Number(customer.outstanding_balance || 0),
    0,
  );

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div>
          <h2>Customer Credit</h2>
          <p>Register customers and track the money they owe.</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={fetchCustomers}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Registered Customers</span>
          <strong>{customers.length}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Total Outstanding</span>
          <strong>{money(totalOutstanding)}</strong>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage} role="status">
          {success}
        </div>
      )}

      <div className={styles.contentGrid}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h3>Register New Customer</h3>
          <p className={styles.formDescription}>
            Save the customer's details before recording a credit sale.
          </p>

          <label htmlFor="customer-name">Customer name *</label>
          <input
            id="customer-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
            maxLength={150}
            required
          />

          <label htmlFor="customer-phone">Phone number *</label>
          <input
            id="customer-phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            maxLength={25}
            required
          />

          <label htmlFor="customer-notes">Notes (optional)</label>
          <textarea
            id="customer-notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Additional information"
            rows={3}
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? "Saving customer..." : "Register Customer"}
          </button>
        </form>

        <div className={styles.listCard}>
          <div className={styles.listHeading}>
            <div>
              <h3>Customers</h3>
              <p>{filteredCustomers.length} customer(s) shown</p>
            </div>
          </div>

          <input
            className={styles.searchInput}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or phone..."
            aria-label="Search customers"
          />

          {loading ? (
            <div className={styles.emptyState}>Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className={styles.emptyState}>
              {customers.length === 0
                ? "No customers registered yet."
                : "No customers match your search."}
            </div>
          ) : (
            <div className={styles.customerList}>
              {filteredCustomers.map((customer) => (
                <article className={styles.customerRow} key={customer.id}>
                  <div className={styles.customerAvatar}>
                    {(customer.name || "?").trim().charAt(0).toUpperCase()}
                  </div>

                  <div className={styles.customerDetails}>
                    <strong>{customer.name}</strong>
                    <span>{customer.phone}</span>
                    {customer.notes && <small>{customer.notes}</small>}
                  </div>

                  <div className={styles.customerBalance}>
                    <span>Outstanding</span>
                    <strong>{money(customer.outstanding_balance)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerCredit;
