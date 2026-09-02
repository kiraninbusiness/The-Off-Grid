import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, Package, Truck, XCircle, MapPin, RefreshCw } from "lucide-react";
import { api } from "../api";
import "../track-order.css";

const steps = ["pending", "processing", "shipped", "delivered"];
const labels = { pending: "Order placed", processing: "Processing", shipped: "Shipped", delivered: "Delivered" };

function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function formatDate(date) { return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
function etaFor(order) { const base = order?.created_at || order?.date || new Date(); if (order?.status === "delivered") return formatDate(order.updated_at || base); if (order?.status === "cancelled") return "—"; return `${formatDate(addDays(base, 4))} – ${formatDate(addDays(base, 7))}`; }

export default function TrackOrder({ orders = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.pathname.split("/track-order/")[1]?.split("/")[0];
  const existing = orders.find((item) => String(item.id) === String(id));
  const [order, setOrder] = useState(existing || null);
  const [loading, setLoading] = useState(!existing);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try { const data = await api(`/orders/${id}`); setOrder(data); setError(""); }
    catch (err) { setError(err.message || "Order not found"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (existing) { setOrder(existing); setLoading(false); return; } loadOrder(); }, [id, existing]);
  useEffect(() => { if (!id || order?.status === "delivered" || order?.status === "cancelled") return; const timer = setInterval(() => loadOrder(true), 30000); return () => clearInterval(timer); }, [id, order?.status]);

  const current = order ? steps.indexOf(order.status) : -1;
  const displayId = order ? `OG${String(order.id).padStart(6, "0")}` : id;
  const eta = useMemo(() => etaFor(order), [order]);
  const items = Array.isArray(order?.items) ? order.items : [];
  const itemCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  const statusMessage = order?.status === "delivered" ? "YOUR ORDER HAS ARRIVED. THANK YOU FOR GOING OFF GRID." : order?.status === "shipped" ? "YOUR ORDER IS ON THE WAY. KEEP AN EYE ON YOUR DELIVERY ADDRESS." : order?.status === "processing" ? "YOUR ORDER IS BEING PREPARED FOR DISPATCH." : "YOUR ORDER HAS BEEN RECEIVED. WE'LL KEEP YOU UPDATED AS IT MOVES.";

  return (
    <div className="page track-page">
      <div className="page-head"><span>THE OFF GRID / TRACKING</span><h1>TRACK <em>YOUR ORDER.</em></h1></div>
      {loading ? <div className="empty-box"><h2>LOADING ORDER...</h2></div> : order ? <div className="track-card">
        <div className="track-card-head"><div><small>ORDER</small><h2>{displayId}</h2></div><span className={`order-status ${order.status}`}>{order.status === "cancelled" ? <XCircle size={15} /> : order.status === "delivered" ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}{String(order.status || "pending").toUpperCase()}</span></div>
        {order.status === "cancelled" ? <p className="notify-me-error">This order was cancelled and its reserved stock was released.</p> : <>
          <div className="tracking-summary"><div><span>ESTIMATED DELIVERY</span><strong>{eta}</strong></div><div><span>ITEMS</span><strong>{itemCount || items.length || 0} {itemCount === 1 ? "ITEM" : "ITEMS"}</strong></div><div><span>DELIVERY TO</span><strong>{order.shipping_city || "—"}, {order.shipping_state || "—"}</strong></div></div>
          <div className="tracking-message">{statusMessage}</div>
          <div className="tracking-steps">{steps.map((status, index) => <div className={`tracking-step ${index <= current ? "done" : ""} ${index === current ? "current" : ""}`} key={status}><div className="tracking-step-dot">{index < current ? <CheckCircle2 size={15} /> : index === current ? <Package size={15} /> : <Truck size={15} />}</div><span>{labels[status]}</span><small>{index === 0 && order.created_at ? formatDate(order.created_at) : index === current ? "CURRENT STATUS" : index < current ? "COMPLETED" : "UP NEXT"}</small></div>)}</div>
          {items.length > 0 && <div className="track-items"><h3>ORDER ITEMS</h3>{items.map((item, index) => <div className="track-item" key={`${item.product_id || item.id || index}-${index}`}><span>{item.name}{item.selected_size ? ` · ${item.selected_size}` : ""}{item.selected_color ? ` · ${item.selected_color}` : ""}</span><span>× {item.quantity}</span></div>)}</div>}
        </>}
        <div className="track-order-meta"><p><MapPin size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />Shipping to {order.shipping_address || "—"}, {order.shipping_city || "—"}, {order.shipping_state || "—"} · {order.shipping_pincode || "—"}</p><p>Payment: {String(order.payment_method || order.payment || "cod").toUpperCase()} · {String(order.payment_status || "pending").toUpperCase()}</p></div>
        <button className="text-button" type="button" onClick={() => navigate("/orders")}>BACK TO ORDERS</button><button className="text-button" type="button" onClick={() => loadOrder(true)} disabled={refreshing} style={{ marginLeft: 18 }}><RefreshCw size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />{refreshing ? "REFRESHING" : "REFRESH STATUS"}</button>
      </div> : <div className="empty-box"><h2>{error || "ORDER NOT FOUND."}</h2><button className="orange-btn" type="button" onClick={() => navigate("/orders")}>VIEW ORDERS</button></div>}
    </div>
  );
}
