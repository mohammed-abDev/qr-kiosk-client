import { useEffect, useMemo, useState } from "react";
import API_URL from "../../config/api";
import styles from "./CustomerCredit.module.css";

const money = (value) =>
  `${Number(value || 0).toLocaleString("en-ET", { maximumFractionDigits: 2 })} Birr`;
const tokenHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});
const parseResponse = async (response, fallback) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "The API returned an invalid response. Check the backend URL and route.",
    );
  }
  if (!response.ok) throw new Error(data.message || fallback);
  return data;
};

 function CustomerCredit() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeModal, setActiveModal] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });
  const [saleForm, setSaleForm] = useState({
    customer_id: "",
    due_date: "",
    initial_payment: "",
    notes: "",
  });
  const [saleItems, setSaleItems] = useState([{ product_id: "", quantity: 1 }]);
  const [paymentForm, setPaymentForm] = useState({
    customer_id: "",
    amount: "",
    notes: "",
  });
  const [smsSettings, setSmsSettings] = useState({
    enabled: true,
    owner: true,
    manager: true,
    newSale: true,
    payment: true,
    overdue: true,
    daily: false,
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [customerResponse, productResponse] = await Promise.all([
        fetch(`${API_URL}/api/customers`, { headers: tokenHeaders() }),
        fetch(`${API_URL}/api/products`, { headers: tokenHeaders() }),
      ]);
      const customerData = await parseResponse(
        customerResponse,
        "Could not load customers.",
      );
      const productData = await parseResponse(
        productResponse,
        "Could not load products.",
      );
      const customerList = Array.isArray(customerData)
        ? customerData
        : customerData.customers || customerData.data || [];
      const productList = Array.isArray(productData)
        ? productData
        : productData.products || productData.data || [];
      setCustomers(customerList);
      setProducts(
        productList.filter(
          (p) => Number(p.is_available ?? p.available ?? 1) === 1,
        ),
      );
    } catch (e) {
      setError(e.message || "Could not load credit data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const debt = Number(customer.outstanding_balance || 0);
        const term = search.trim().toLowerCase();
        const matchesSearch =
          (customer.name || "").toLowerCase().includes(term) ||
          (customer.phone || "").toLowerCase().includes(term);
        const matchesFilter =
          filter === "all" ||
          (filter === "balance" && debt > 0) ||
          (filter === "paid" && debt <= 0);
        return matchesSearch && matchesFilter;
      }),
    [customers, search, filter],
  );
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + Number(c.outstanding_balance || 0),
    0,
  );
  const owingCount = customers.filter(
    (c) => Number(c.outstanding_balance || 0) > 0,
  ).length;
  const totalCredit = customers.reduce(
    (sum, c) => sum + Number(c.total_credit || c.total_credit_sales || 0),
    0,
  );
  const totalPaid = customers.reduce(
    (sum, c) => sum + Number(c.total_paid || c.total_payments || 0),
    0,
  );
  const currentSaleTotal = saleItems.reduce((sum, item) => {
    const p = products.find(
      (product) => String(product.id) === String(item.product_id),
    );
    return sum + (p ? Number(p.price || 0) * Number(item.quantity || 0) : 0);
  }, 0);

  const showMessage = (message) => {
    setSuccess(message);
    setError("");
  };
  const openModal = (modal, customer = null) => {
    setError("");
    setSuccess("");
    setSelectedCustomer(customer);
    setHistory(null);
    setActiveModal(modal);
    if (modal === "payment" && customer)
      setPaymentForm({
        customer_id: String(customer.id),
        amount: "",
        notes: "",
      });
    if (modal === "sale" && customer)
      setSaleForm((old) => ({ ...old, customer_id: String(customer.id) }));
  };
  const closeModal = () => {
    setActiveModal("");
    setSelectedCustomer(null);
    setHistory(null);
    setError("");
  };

  const submitCustomer = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        method: "POST",
        headers: { ...tokenHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerForm.name.trim(),
          phone: customerForm.phone.trim(),
          notes: customerForm.notes.trim(),
        }),
      });
      await parseResponse(response, "Could not register customer.");
      setCustomerForm({ name: "", phone: "", notes: "" });
      closeModal();
      showMessage("Customer added successfully.");
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const submitSale = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    if (!saleForm.customer_id) {
      setError("Choose a customer first.");
      setBusy(false);
      return;
    }
    if (
      saleItems.some(
        (item) =>
          !item.product_id ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1,
      )
    ) {
      setError(
        "Choose a product and a valid whole-number quantity for every row.",
      );
      setBusy(false);
      return;
    }
    if (
      new Set(saleItems.map((item) => String(item.product_id))).size !==
      saleItems.length
    ) {
      setError("Each product should appear once. Update its quantity instead.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/credit/transactions`, {
        method: "POST",
        headers: { ...tokenHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: Number(saleForm.customer_id),
          items: saleItems.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
          })),
          notes: saleForm.notes.trim(),
          due_date: saleForm.due_date || null,
          initial_payment: Number(saleForm.initial_payment || 0),
        }),
      });
      await parseResponse(response, "Could not record credit sale.");
      closeModal();
      setSaleForm({
        customer_id: "",
        due_date: "",
        initial_payment: "",
        notes: "",
      });
      setSaleItems([{ product_id: "", quantity: 1 }]);
      showMessage("Credit sale recorded successfully.");
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const submitPayment = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const customer = customers.find(
      (c) => String(c.id) === String(paymentForm.customer_id),
    );
    const amount = Number(paymentForm.amount);
    if (!customer || amount <= 0 || !Number.isFinite(amount)) {
      setError("Choose a customer and enter a valid amount.");
      setBusy(false);
      return;
    }
    if (amount > Number(customer.outstanding_balance || 0)) {
      setError("Payment cannot exceed the current outstanding balance.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/credit/payments`, {
        method: "POST",
        headers: { ...tokenHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: Number(paymentForm.customer_id),
          amount,
          notes: paymentForm.notes.trim(),
        }),
      });
      await parseResponse(response, "Could not record repayment.");
      closeModal();
      showMessage("Repayment recorded successfully.");
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const viewHistory = async (customer) => {
    setSelectedCustomer(customer);
    setHistory(null);
    setError("");
    setActiveModal("history");
    setBusy(true);
    try {
      const response = await fetch(
        `${API_URL}/api/credit/customers/${customer.id}/history`,
        { headers: tokenHeaders() },
      );
      setHistory(
        await parseResponse(response, "Could not load customer history."),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const updateSaleItem = (index, field, value) =>
    setSaleItems((items) =>
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>🛒</div>
          <div>
            <strong>ABDU MART</strong>
            <span>Digital Shelf</span>
          </div>
        </div>
        <div className={styles.navLabel}>WORKSPACE</div>
        <nav className={styles.navigation}>
          {[
            ["⌂", "Dashboard"],
            ["▧", "Products"],
            ["◈", "Categories"],
            ["🛒", "Sales"],
            ["♙", "Customers"],
            ["▣", "Customer Credit"],
            ["▤", "Payments"],
            ["▥", "Reports"],
            ["▧", "Banner Manager"],
            ["⚙", "Shop Settings"],
          ].map(([icon, label]) => (
            <div
              key={label}
              className={`${styles.navItem} ${label === "Customer Credit" ? styles.navActive : ""}`}
            >
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div>
            ♧ &nbsp; Notifications <i>3</i>
          </div>
          <div className={styles.profile}>
            <div className={styles.profileAvatar}>M</div>
            <div>
              <strong>Mohammed Abdu</strong>
              <span>Owner</span>
            </div>
            <span className={styles.profileChevron}>⌄</span>
          </div>
        </div>
      </aside>

      <main className={styles.mainArea}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            Abdu Mart <span>/</span> Customer Credit
          </div>
          <div className={styles.topbarRight}>
            <label className={styles.globalSearch}>
              ⌕{" "}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
              />
            </label>
            <button
              className={styles.notificationButton}
              aria-label="Notifications"
            >
              ♧<i>3</i>
            </button>
            <div className={styles.topUser}>
              <div className={styles.profileAvatar}>M</div>
              <div>
                <strong>Mohammed Abdu</strong>
                <span>Owner</span>
              </div>
            </div>
          </div>
        </header>
        <section className={styles.pageContent}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.eyebrow}>FINANCE & CUSTOMER ACCOUNTS</div>
              <h1>Customer Credit</h1>
              <p>
                Track credit sales, customer balances and manage repayments.
              </p>
            </div>
            <div className={styles.headingActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setActiveModal("settings")}
              >
                ⚙ Settings
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => openModal("sale")}
              >
                ＋ New Credit Sale
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => openModal("customer")}
              >
                ♙ Add Customer
              </button>
            </div>
          </div>
          {error && !activeModal && (
            <div className={styles.errorBanner}>
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}
          {success && (
            <div className={styles.successBanner}>
              {success}
              <button onClick={() => setSuccess("")}>×</button>
            </div>
          )}
          <div className={styles.metricsGrid}>
            <Metric
              icon="▣"
              tone="green"
              label="Total Credit Given"
              value={money(totalCredit)}
              note="Across registered customers"
            />
            <Metric
              icon="⚠"
              tone="red"
              label="Outstanding Balance"
              value={money(totalOutstanding)}
              note={`${owingCount} customers with balances`}
            />
            <Metric
              icon="▣"
              tone="blue"
              label="Payments Received"
              value={money(totalPaid)}
              note="Recorded repayments"
            />
            <Metric
              icon="▦"
              tone="purple"
              label="Customers With Debt"
              value={owingCount}
              note="Require follow-up"
            />
          </div>
          <section className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div>
                <h2>Credit Accounts</h2>
                <p>Customer balances and account status</p>
              </div>
              <button
                className={styles.refreshButton}
                onClick={loadData}
                disabled={loading}
              >
                ↻ {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
            <div className={styles.tableTools}>
              <div className={styles.filterTabs}>
                {[
                  ["all", "All Customers"],
                  ["balance", "With Balance"],
                  ["paid", "Paid"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={filter === key ? styles.filterActive : ""}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className={styles.tableSearch}>
                ⌕{" "}
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or phone..."
                />
              </label>
              <button
                className={styles.filterButton}
                onClick={() =>
                  setFilter(filter === "balance" ? "all" : "balance")
                }
              >
                ☷ Filter
              </button>
            </div>
            <div className={styles.tableScroll}>
              <table className={styles.customerTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Total Credit</th>
                    <th>Paid</th>
                    <th>Outstanding</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className={styles.tableEmpty}>
                        Loading customer accounts…
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className={styles.tableEmpty}>
                        {customers.length
                          ? "No customers match your search."
                          : "No customers registered yet. Add your first customer to get started."}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer, index) => {
                      const debt = Number(customer.outstanding_balance || 0);
                      const paid = Number(
                        customer.total_paid || customer.total_payments || 0,
                      );
                      const credit = Number(
                        customer.total_credit ||
                          customer.total_credit_sales ||
                          0,
                      );
                      return (
                        <tr key={customer.id}>
                          <td className={styles.rowNumber}>{index + 1}</td>
                          <td>
                            <div className={styles.tableCustomer}>
                              <div className={styles.customerAvatar}>
                                {(customer.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{customer.name}</strong>
                                <small>
                                  {customer.notes ||
                                    `Customer ID: ${customer.id}`}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>{customer.phone || "—"}</td>
                          <td>{money(credit)}</td>
                          <td>{money(paid)}</td>
                          <td
                            className={
                              debt > 0 ? styles.debtAmount : styles.paidAmount
                            }
                          >
                            {money(debt)}
                          </td>
                          <td>
                            <span
                              className={`${styles.statusPill} ${debt > 0 ? styles.statusDue : styles.statusPaid}`}
                            >
                              {debt > 0 ? "Outstanding" : "Paid"}
                            </span>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button onClick={() => viewHistory(customer)}>
                                View
                              </button>
                              <button
                                className={styles.moreButton}
                                onClick={() => openModal("actions", customer)}
                                aria-label={`More actions for ${customer.name}`}
                              >
                                ⋮
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.tableFooter}>
              <span>
                Showing {filteredCustomers.length} of {customers.length}{" "}
                customers
              </span>
              <span>Balances shown in Ethiopian Birr</span>
            </div>
          </section>
          <div className={styles.lowerGrid}>
            <section className={styles.insightCard}>
              <div className={styles.sectionTitle}>
                <div>
                  <h2>Credit Management</h2>
                  <p>Common account actions</p>
                </div>
                <span className={styles.sectionIcon}>▣</span>
              </div>
              <div className={styles.quickActions}>
                <button onClick={() => openModal("customer")}>
                  <span>＋</span>
                  <div>
                    <strong>Add a customer</strong>
                    <small>Save customer contact details</small>
                  </div>
                  <b>›</b>
                </button>
                <button onClick={() => openModal("sale")}>
                  <span>↗</span>
                  <div>
                    <strong>Record a credit sale</strong>
                    <small>Add products to a customer account</small>
                  </div>
                  <b>›</b>
                </button>
                <button onClick={() => openModal("payment")}>
                  <span>↓</span>
                  <div>
                    <strong>Record a repayment</strong>
                    <small>Register money received</small>
                  </div>
                  <b>›</b>
                </button>
              </div>
            </section>
            <section className={styles.insightCard}>
              <div className={styles.sectionTitle}>
                <div>
                  <h2>SMS Notifications</h2>
                  <p>Automatic customer and staff updates</p>
                </div>
                <span className={styles.smsIcon}>✉</span>
              </div>
              <div className={styles.smsSummary}>
                <span
                  className={
                    smsSettings.enabled ? styles.liveDot : styles.offDot
                  }
                ></span>
                <div>
                  <strong>
                    {smsSettings.enabled
                      ? "SMS notifications enabled"
                      : "SMS notifications paused"}
                  </strong>
                  <small>
                    Manage recipients and message events in settings.
                  </small>
                </div>
                <button onClick={() => setActiveModal("settings")}>
                  Configure
                </button>
              </div>
              <p className={styles.helperText}>
                SMS sending will become active after the backend provider and
                delivery settings are connected.
              </p>
            </section>
          </div>
        </section>
      </main>

      {activeModal && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <section
            className={`${styles.modal} ${activeModal === "settings" ? styles.settingsModal : ""}`}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.eyebrow}>
                  ABDU MART · CREDIT MANAGEMENT
                </div>
                <h2>
                  {
                    {
                      customer: "Add Customer",
                      sale: "New Credit Sale",
                      payment: "Record Repayment",
                      history: "Customer Details",
                      settings: "SMS Notification Settings",
                      actions: "Customer Actions",
                    }[activeModal]
                  }
                </h2>
              </div>
              <button
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {error && <div className={styles.errorBanner}>{error}</div>}
            {activeModal === "customer" && (
              <form className={styles.modalBody} onSubmit={submitCustomer}>
                <p className={styles.modalIntro}>
                  Create a customer account so credit sales and repayments can
                  be tracked in one place.
                </p>
                <Field label="Customer name *">
                  <input
                    required
                    maxLength={150}
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </Field>
                <Field label="Phone number *">
                  <input
                    required
                    maxLength={25}
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+251 9XX XXX XXX"
                  />
                </Field>
                <Field label="Notes (optional)">
                  <textarea
                    rows="3"
                    value={customerForm.notes}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Additional customer information"
                  />
                </Field>
                <ModalActions
                  close={closeModal}
                  busy={busy}
                  submit="Save Customer"
                />
              </form>
            )}
            {activeModal === "sale" && (
              <form className={styles.modalBody} onSubmit={submitSale}>
                <div className={styles.stepBar}>
                  <span className={styles.stepActive}>
                    1 <b>Customer</b>
                  </span>
                  <i></i>
                  <span className={styles.stepActive}>
                    2 <b>Products</b>
                  </span>
                  <i></i>
                  <span className={styles.stepActive}>
                    3 <b>Review</b>
                  </span>
                </div>
                <Field label="Customer *">
                  <select
                    required
                    value={saleForm.customer_id}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, customer_id: e.target.value })
                    }
                  >
                    <option value="">Find customer by name or phone</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.phone}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className={styles.itemsHeading}>
                  <strong>Sale products</strong>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() =>
                      setSaleItems((items) => [
                        ...items,
                        { product_id: "", quantity: 1 },
                      ])
                    }
                  >
                    ＋ Add product
                  </button>
                </div>
                {saleItems.map((item, index) => (
                  <div className={styles.productLine} key={index}>
                    <Field label={`Product ${index + 1}`}>
                      <select
                        required
                        value={item.product_id}
                        onChange={(e) =>
                          updateSaleItem(index, "product_id", e.target.value)
                        }
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {money(p.price)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Qty">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          updateSaleItem(index, "quantity", e.target.value)
                        }
                      />
                    </Field>
                    {saleItems.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeLine}
                        onClick={() =>
                          setSaleItems((items) =>
                            items.filter((_, i) => i !== index),
                          )
                        }
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <div className={styles.formTwoCol}>
                  <Field label="Initial payment (Birr)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={saleForm.initial_payment}
                      onChange={(e) =>
                        setSaleForm({
                          ...saleForm,
                          initial_payment: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Due date">
                    <input
                      type="date"
                      value={saleForm.due_date}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, due_date: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Notes (optional)">
                  <textarea
                    rows="2"
                    value={saleForm.notes}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, notes: e.target.value })
                    }
                    placeholder="Payment agreement or other details"
                  />
                </Field>
                <div className={styles.debtPreview}>
                  <div>
                    <span>Total sale</span>
                    <strong>{money(currentSaleTotal)}</strong>
                  </div>
                  <div>
                    <span>Initial payment</span>
                    <strong>{money(saleForm.initial_payment)}</strong>
                  </div>
                  <div>
                    <span>Remaining debt</span>
                    <strong>
                      {money(
                        Math.max(
                          0,
                          currentSaleTotal -
                            Number(saleForm.initial_payment || 0),
                        ),
                      )}
                    </strong>
                  </div>
                </div>
                <p className={styles.smsNote}>
                  ✉ Customer SMS will be sent automatically once SMS delivery is
                  connected to the backend.
                </p>
                <ModalActions
                  close={closeModal}
                  busy={busy}
                  submit="Save Credit Sale"
                />
              </form>
            )}
            {activeModal === "payment" && (
              <form className={styles.modalBody} onSubmit={submitPayment}>
                <p className={styles.modalIntro}>
                  Record a full or partial payment against a customer's
                  outstanding balance.
                </p>
                <Field label="Customer *">
                  <select
                    required
                    value={paymentForm.customer_id}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        customer_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select customer</option>
                    {customers
                      .filter((c) => Number(c.outstanding_balance || 0) > 0)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — owes {money(c.outstanding_balance)}
                        </option>
                      ))}
                  </select>
                </Field>
                {paymentForm.customer_id && (
                  <div className={styles.balanceHighlight}>
                    <span>Current outstanding balance</span>
                    <strong>
                      {money(
                        customers.find(
                          (c) =>
                            String(c.id) === String(paymentForm.customer_id),
                        )?.outstanding_balance,
                      )}
                    </strong>
                  </div>
                )}
                <Field label="Amount received (Birr) *">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    placeholder="Enter amount received"
                  />
                </Field>
                <Field label="Notes (optional)">
                  <textarea
                    rows="3"
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, notes: e.target.value })
                    }
                    placeholder="Cash payment or other details"
                  />
                </Field>
                <p className={styles.smsNote}>
                  ✉ A payment confirmation SMS will be queued after backend SMS
                  integration.
                </p>
                <ModalActions
                  close={closeModal}
                  busy={busy}
                  submit="Record Repayment"
                />
              </form>
            )}
            {activeModal === "history" && (
              <div className={styles.modalBody}>
                {selectedCustomer && (
                  <div className={styles.customerProfile}>
                    <div className={styles.largeAvatar}>
                      {(selectedCustomer.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{selectedCustomer.name}</h3>
                      <p>{selectedCustomer.phone}</p>
                      <small>Customer ID: {selectedCustomer.id}</small>
                    </div>
                    <span
                      className={`${styles.statusPill} ${Number(selectedCustomer.outstanding_balance || 0) > 0 ? styles.statusDue : styles.statusPaid}`}
                    >
                      {Number(selectedCustomer.outstanding_balance || 0) > 0
                        ? "Outstanding"
                        : "Paid"}
                    </span>
                  </div>
                )}
                {busy && (
                  <p className={styles.tableEmpty}>Loading account history…</p>
                )}
                {history && (
                  <>
                    <div className={styles.debtPreview}>
                      <div>
                        <span>Total credit</span>
                        <strong>{money(history.summary?.total_credit)}</strong>
                      </div>
                      <div>
                        <span>Total paid</span>
                        <strong>{money(history.summary?.total_paid)}</strong>
                      </div>
                      <div>
                        <span>Outstanding</span>
                        <strong>
                          {money(history.summary?.outstanding_balance)}
                        </strong>
                      </div>
                    </div>
                    <h3 className={styles.subheading}>Credit purchases</h3>
                    {(history.purchases || []).length === 0 ? (
                      <p className={styles.muted}>No credit purchases found.</p>
                    ) : (
                      <div className={styles.historyList}>
                        {history.purchases.map((purchase) => (
                          <article
                            key={purchase.id}
                            className={styles.historyRecord}
                          >
                            <div>
                              <strong>Credit sale #{purchase.id}</strong>
                              <span>
                                {purchase.created_at
                                  ? new Date(
                                      purchase.created_at,
                                    ).toLocaleString()
                                  : "Date unavailable"}
                              </span>
                            </div>
                            <b>{money(purchase.total_amount)}</b>
                            {purchase.notes && <p>{purchase.notes}</p>}
                            {purchase.items?.map((item) => (
                              <div className={styles.historyItem} key={item.id}>
                                <span>
                                  {item.product_name} × {item.quantity}
                                </span>
                                <span>{money(item.line_total)}</span>
                              </div>
                            ))}
                          </article>
                        ))}
                      </div>
                    )}
                    <h3 className={styles.subheading}>Repayments</h3>
                    {(history.payments || []).length === 0 ? (
                      <p className={styles.muted}>No repayments recorded.</p>
                    ) : (
                      history.payments.map((payment) => (
                        <article
                          className={styles.paymentRecord}
                          key={payment.id}
                        >
                          <div>
                            <strong>{money(payment.amount)}</strong>
                            <span>
                              {payment.created_at
                                ? new Date(payment.created_at).toLocaleString()
                                : "Date unavailable"}
                            </span>
                          </div>
                          <p>{payment.notes || "Repayment received"}</p>
                        </article>
                      ))
                    )}
                  </>
                )}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => openModal("payment", selectedCustomer)}
                  >
                    ＋ Record Payment
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => openModal("sale", selectedCustomer)}
                  >
                    ＋ New Credit Sale
                  </button>
                </div>
              </div>
            )}
            {activeModal === "actions" && (
              <div className={styles.modalBody}>
                <div className={styles.actionCustomer}>
                  <div className={styles.largeAvatar}>
                    {(selectedCustomer?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedCustomer?.name}</h3>
                    <p>{selectedCustomer?.phone}</p>
                    <strong>
                      {money(selectedCustomer?.outstanding_balance)} outstanding
                    </strong>
                  </div>
                </div>
                <div className={styles.actionStack}>
                  <button onClick={() => viewHistory(selectedCustomer)}>
                    View customer details and history <b>›</b>
                  </button>
                  <button
                    onClick={() => openModal("payment", selectedCustomer)}
                  >
                    Record repayment <b>›</b>
                  </button>
                  <button onClick={() => openModal("sale", selectedCustomer)}>
                    Record new credit sale <b>›</b>
                  </button>
                </div>
              </div>
            )}
            {activeModal === "settings" && (
              <div className={styles.modalBody}>
                <p className={styles.modalIntro}>
                  Choose which events should generate SMS notifications. These
                  controls are frontend preferences for now; persistent settings
                  and actual delivery will be connected in the backend stage.
                </p>
                <div className={styles.settingRow}>
                  <div>
                    <strong>Enable SMS notifications</strong>
                    <small>
                      Automatically send SMS to customers and selected staff.
                    </small>
                  </div>
                  <Toggle
                    checked={smsSettings.enabled}
                    onChange={(checked) =>
                      setSmsSettings({ ...smsSettings, enabled: checked })
                    }
                  />
                </div>
                <h3 className={styles.settingsSection}>Recipients</h3>
                <SettingToggle
                  title="Customer"
                  detail="Send SMS to the customer's saved phone number"
                  checked
                  disabled
                />
                <SettingToggle
                  title="Shop owner"
                  detail="Owner notification recipient"
                  checked={smsSettings.owner}
                  onChange={(checked) =>
                    setSmsSettings({ ...smsSettings, owner: checked })
                  }
                />
                <SettingToggle
                  title="Manager"
                  detail="Manager notification recipient"
                  checked={smsSettings.manager}
                  onChange={(checked) =>
                    setSmsSettings({ ...smsSettings, manager: checked })
                  }
                />
                <h3 className={styles.settingsSection}>Notification events</h3>
                <SettingToggle
                  title="New credit sale"
                  checked={smsSettings.newSale}
                  onChange={(checked) =>
                    setSmsSettings({ ...smsSettings, newSale: checked })
                  }
                />
                <SettingToggle
                  title="Payment received"
                  checked={smsSettings.payment}
                  onChange={(checked) =>
                    setSmsSettings({ ...smsSettings, payment: checked })
                  }
                />
                <SettingToggle
                  title="Overdue reminder"
                  checked={smsSettings.overdue}
                  onChange={(checked) =>
                    setSmsSettings({ ...smsSettings, overdue: checked })
                  }
                />
                <SettingToggle
                  title="Daily summary"
                  detail="Optional daily credit summary"
                  checked={smsSettings.daily}
                  onChange={(checked) =>
                    setSmsSettings({ ...smsSettings, daily: checked })
                  }
                />
                <div className={styles.messagePreview}>
                  <div className={styles.previewTitle}>
                    CUSTOMER MESSAGE PREVIEW
                  </div>
                  <p>
                    Abdu Mart: Dear customer, your credit account has been
                    updated. Please contact the shop for your current balance.
                    Thank you.
                  </p>
                  <small>
                    Final message templates will be connected to the SMS
                    backend.
                  </small>
                </div>
                <ModalActions
                  close={closeModal}
                  busy={false}
                  submit="Save Preferences"
                  onSubmit={() => {
                    closeModal();
                    showMessage(
                      "Preferences updated for this session. Backend persistence will be added later.",
                    );
                  }}
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, tone, label, value, note }) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</div>
      <div className={styles.metricContent}>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}
function Field({ label, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}
function ModalActions({ close, busy, submit, onSubmit }) {
  return (
    <div className={styles.modalActions}>
      <button type="button" className={styles.secondaryButton} onClick={close}>
        Cancel
      </button>
      <button
        type="submit"
        className={styles.primaryButton}
        disabled={busy}
        onClick={onSubmit}
      >
        {busy ? "Saving…" : submit}
      </button>
    </div>
  );
}
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}
function SettingToggle({ title, detail, checked, onChange, disabled = false }) {
  return (
    <div className={styles.settingRow}>
      <div>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </div>
      {disabled ? (
        <span className={styles.fixedOn}>✓ Always on</span>
      ) : (
        <Toggle checked={checked} onChange={onChange} />
      )}
    </div>
  );
}

export default CustomerCredit;