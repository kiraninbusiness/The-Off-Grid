import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { api } from "../api";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function StatusIcon({ status }) {
  if (status === "delivered") return <CheckCircle2 size={15} />;
  if (status === "shipped") return <Truck size={15} />;
  if (status === "processing") return <Package size={15} />;
  if (status === "cancelled") return <XCircle size={15} />;
  return <Clock3 size={15} />;
}

const RETURN_WINDOW_DAYS = 10;

function withinReturnWindow(order) {
  if (!order.delivered_at) return true; // legacy orders without a timestamp: let the backend be the source of truth
  const deadline = new Date(order.delivered_at).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() <= deadline;
}

function ReturnForm({ order, onDone, onCancel }) {
  const [type, setType] = useState("return");
  const [reason, setReason] = useState("");
  const [size, setSize] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setErr("Please tell us why."); return; }
    setBusy(true);
    setErr("");
    try {
      const created = await api("/returns", {
        method: "POST",
        body: JSON.stringify({
          order_id: order.id,
          type,
          reason: reason.trim(),
          exchange_size: type === "exchange" ? size : null,
        }),
      });
      onDone(created);
    } catch (e) {
      setErr(e.message || "Could not submit request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="return-request-form" onSubmit={submit}>
      <div className="payment-options">
        <button type="button" className={type === "return" ? "active" : ""} onClick={() => setType("return")}>RETURN</button>
        <button type="button" className={type === "exchange" ? "active" : ""} onClick={() => setType("exchange")}>EXCHANGE</button>
      </div>
      {type === "exchange" && (
        <input placeholder="DESIRED SIZE" value={size} onChange={(e) => setSize(e.target.value)} />
      )}
      <textarea
        required
        placeholder="REASON (e.g. wrong size, damaged, changed my mind)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
      />
      {err && <p className="notify-me-error">{err}</p>}
      <div>
        <button className="orange-btn" disabled={busy}>{busy ? "SUBMITTING..." : "SUBMIT REQUEST"}</button>
        <button type="button" className="text-button" onClick={onCancel}>CANCEL</button>
      </div>
    </form>
  );
}

export default function Orders({ orders = [], onCancel, loading = false }) {
  const [returns, setReturns] = useState([]);
  const [openReturnFor, setOpenReturnFor] = useState(null);

  useEffect(() => {
    api("/returns/mine").then((rows) => setReturns(Array.isArray(rows) ? rows : [])).catch(() => {});
  }, [orders.length]);

  const returnFor = (orderId) => returns.find((r) => String(r.order_id) === String(orderId));

  return (
    <div className="page">
      <div className="page-head">
        <span>THE OFF GRID / ORDERS</span>
        <h1>YOUR <em>ORDERS.</em></h1>
      </div>

      {loading ? (
        <div className="empty-box"><h2>LOADING ORDERS...</h2></div>
      ) : orders.length ? (
        <div className="orders-list">
          {orders.map((order) => {
            const displayId = `OG${String(order.id).padStart(6, "0")}`;
            const date = order.created_at || order.date;
            const payment = String(order.payment_method || order.payment || "cod").toUpperCase();
            const items = Array.isArray(order.items) ? order.items : [];
            const existingReturn = returnFor(order.id);
            const canRequestReturn = order.status === "delivered" && !existingReturn && withinReturnWindow(order);

            return (
              <article className="order-card" key={order.id}>
                <div>
                  <strong>{displayId}</strong>
                  <span>{date ? new Date(date).toLocaleDateString("en-IN") : "—"}</span>
                </div>

                <h3>{items.length ? items.map((item) => `${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ""}`).join(", ") : "THE OFF GRID ORDER"}</h3>
                <p>{money(order.total)} · {payment}</p>

                <span className={`order-status ${order.status}`}>
                  <StatusIcon status={order.status} />
                  {String(order.status || "pending").toUpperCase()}
                </span>

                {existingReturn && (
                  <span className={`order-status return-status-${existingReturn.status}`}>
                    {existingReturn.type === "exchange" ? "EXCHANGE" : "RETURN"}: {existingReturn.status.toUpperCase()}
                  </span>
                )}

                <div className="order-actions">
                  {order.status !== "cancelled" && (
                    <Link className="text-button" to={`/track-order/${order.id}`}>TRACK ORDER</Link>
                  )}
                  {order.status === "pending" && payment === "COD" && (
                    <button className="text-button" onClick={() => onCancel(order.id)}>CANCEL ORDER</button>
                  )}
                  {canRequestReturn && openReturnFor !== order.id && (
                    <button className="text-button" onClick={() => setOpenReturnFor(order.id)}>REQUEST RETURN / EXCHANGE</button>
                  )}
                </div>

                {openReturnFor === order.id && (
                  <ReturnForm
                    order={order}
                    onCancel={() => setOpenReturnFor(null)}
                    onDone={(created) => { setReturns((cur) => [created, ...cur]); setOpenReturnFor(null); }}
                  />
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-box">
          <h2>NO ORDERS YET.</h2>
          <Link className="orange-btn" to="/">START SHOPPING</Link>
        </div>
      )}
    </div>
  );
}
