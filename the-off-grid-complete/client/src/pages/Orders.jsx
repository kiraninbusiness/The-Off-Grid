import React from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle2, Clock3, XCircle } from "lucide-react";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function StatusIcon({ status }) {
  if (status === "delivered") return <CheckCircle2 size={15} />;
  if (status === "shipped") return <Truck size={15} />;
  if (status === "processing") return <Package size={15} />;
  if (status === "cancelled") return <XCircle size={15} />;
  return <Clock3 size={15} />;
}

export default function Orders({ orders = [], onCancel, loading = false }) {
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

                <div className="order-actions">
                  {order.status !== "cancelled" && (
                    <Link className="text-button" to={`/track-order/${order.id}`}>TRACK ORDER</Link>
                  )}
                  {order.status === "pending" && payment === "COD" && (
                    <button className="text-button" onClick={() => onCancel(order.id)}>CANCEL ORDER</button>
                  )}
                </div>
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
