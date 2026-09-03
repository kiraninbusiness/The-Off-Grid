import React, { useEffect, useState } from "react";
import { RefreshCw, Trash2, EyeOff, Eye, Users, MessageSquareWarning, PackageSearch, Undo2 } from "lucide-react";
import { api } from "../api";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const RETURN_STATUSES = ["requested", "approved", "rejected", "received", "refunded", "exchanged"];

export default function AdminExtras({ user }) {
  const [tab, setTab] = useState("returns");
  const [returns, setReturns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);

  const load = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    setErr("");
    try {
      const [r, c, rv, sa] = await Promise.all([
        api("/returns"),
        api("/admin/customers"),
        api("/admin/reviews"),
        api("/admin/stock-alerts"),
      ]);
      setReturns(Array.isArray(r) ? r : []);
      setCustomers(Array.isArray(c) ? c : []);
      setReviews(Array.isArray(rv) ? rv : []);
      setStockAlerts(Array.isArray(sa) ? sa : []);
    } catch (e) {
      setErr(e.message || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const updateReturn = async (id, patch) => {
    try {
      const updated = await api(`/returns/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setReturns((cur) => cur.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      setErr(e.message || "Could not update request.");
    }
  };

  const toggleReviewHidden = async (review) => {
    try {
      const updated = await api(`/admin/reviews/${review.id}`, { method: "PATCH", body: JSON.stringify({ hidden: !review.hidden }) });
      setReviews((cur) => cur.map((r) => (r.id === review.id ? updated : r)));
    } catch (e) {
      setErr(e.message || "Could not update review.");
    }
  };

  const deleteReview = async (review) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await api(`/admin/reviews/${review.id}`, { method: "DELETE" });
      setReviews((cur) => cur.filter((r) => r.id !== review.id));
    } catch (e) {
      setErr(e.message || "Could not delete review.");
    }
  };

  const openCustomer = async (id) => {
    if (expandedCustomer === id) { setExpandedCustomer(null); return; }
    setExpandedCustomer(id);
    try {
      const detail = await api(`/admin/customers/${id}`);
      setCustomerDetail(detail);
    } catch (e) {
      setErr(e.message || "Could not load customer.");
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <section className="admin-content admin-extras">
      <div className="admin-panel-header">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h2>Customers, Reviews, Returns & Stock Alerts</h2>
        </div>
        <button type="button" className="admin-refresh" onClick={load}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {err && <div className="admin-error">{err}</div>}

      <div className="admin-extras-tabs">
        <button type="button" className={tab === "returns" ? "active" : ""} onClick={() => setTab("returns")}>
          <Undo2 size={15} /> Returns <b>{returns.filter((r) => r.status === "requested").length}</b>
        </button>
        <button type="button" className={tab === "customers" ? "active" : ""} onClick={() => setTab("customers")}>
          <Users size={15} /> Customers <b>{customers.length}</b>
        </button>
        <button type="button" className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}>
          <MessageSquareWarning size={15} /> Reviews <b>{reviews.length}</b>
        </button>
        <button type="button" className={tab === "alerts" ? "active" : ""} onClick={() => setTab("alerts")}>
          <PackageSearch size={15} /> Stock Alerts <b>{stockAlerts.reduce((s, a) => s + a.waiting_count, 0)}</b>
        </button>
      </div>

      {tab === "returns" && (
        <div className="admin-product-list">
          {!returns.length && <div className="admin-empty"><p>No return or exchange requests yet.</p></div>}
          {returns.map((r) => (
            <article key={r.id} className="admin-product-card admin-return-card">
              <div className="admin-product-details">
                <div className="admin-product-title">
                  <strong>{r.type === "exchange" ? "EXCHANGE" : "RETURN"} — OG{String(r.order_id).padStart(6, "0")}</strong>
                  <span className={`order-status return-status-${r.status}`}>{r.status.toUpperCase()}</span>
                </div>
                <p className="muted">{r.customer_name} · {r.customer_email}</p>
                <p>{r.reason}</p>
                {r.exchange_size && <p className="muted">Requested size: {r.exchange_size}</p>}
                <div className="admin-product-actions admin-return-actions">
                  <select value={r.status} onChange={(e) => updateReturn(r.id, { status: e.target.value })}>
                    {RETURN_STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                  <input
                    placeholder="ADMIN NOTE (sent to customer)"
                    defaultValue={r.admin_notes || ""}
                    onBlur={(e) => { if (e.target.value !== (r.admin_notes || "")) updateReturn(r.id, { admin_notes: e.target.value }); }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "customers" && (
        <div className="admin-product-list">
          {!customers.length && <div className="admin-empty"><p>No customers yet.</p></div>}
          {customers.map((c) => (
            <article key={c.id} className="admin-product-card admin-customer-card">
              <div className="admin-product-details" onClick={() => openCustomer(c.id)} style={{ cursor: "pointer" }}>
                <div className="admin-product-title">
                  <strong>{c.name}</strong>
                  <span>{c.order_count} order{c.order_count === 1 ? "" : "s"} · {money(c.total_spent)}</span>
                </div>
                <p className="muted">{c.email} · joined {new Date(c.created_at).toLocaleDateString("en-IN")}</p>
                <p className="muted">{c.loyalty_points} points · {c.referral_count} referrals</p>
              </div>
              {expandedCustomer === c.id && customerDetail?.id === c.id && (
                <div className="admin-customer-expanded">
                  <h4>Recent orders</h4>
                  {customerDetail.orders.slice(0, 8).map((o) => (
                    <p key={o.id}>OG{String(o.id).padStart(6, "0")} · {money(o.total)} · {String(o.status).toUpperCase()}</p>
                  ))}
                  {!customerDetail.orders.length && <p className="muted">No orders yet.</p>}
                  <h4>Addresses</h4>
                  {customerDetail.addresses.map((a) => (
                    <p key={a.id}>{a.label}: {a.address}, {a.city}, {a.state} — {a.pincode}</p>
                  ))}
                  {!customerDetail.addresses.length && <p className="muted">No saved addresses.</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === "reviews" && (
        <div className="admin-product-list">
          {!reviews.length && <div className="admin-empty"><p>No reviews yet.</p></div>}
          {reviews.map((r) => (
            <article key={r.id} className={`admin-product-card ${r.hidden ? "admin-product-sold" : ""}`}>
              <div className="admin-product-details">
                <div className="admin-product-title">
                  <strong>{r.product_name}</strong>
                  <span>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} · {r.user_name}</span>
                </div>
                <p>{r.comment || <em>No comment left.</em>}</p>
                <div className="admin-product-actions">
                  <button type="button" onClick={() => toggleReviewHidden(r)}>
                    {r.hidden ? <><Eye size={15} /> Unhide</> : <><EyeOff size={15} /> Hide</>}
                  </button>
                  <button type="button" className="delete" onClick={() => deleteReview(r)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "alerts" && (
        <div className="admin-product-list">
          {!stockAlerts.length && <div className="admin-empty"><p>No customers are waiting on restocks right now.</p></div>}
          {stockAlerts.map((a) => (
            <article key={a.product_id} className="admin-product-card">
              <div className="admin-product-details">
                <div className="admin-product-title">
                  <strong>{a.product_name}</strong>
                  <span>{a.waiting_count} waiting</span>
                </div>
                <p className="muted">Current stock: {a.stock} · {a.notified_count} already notified</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
