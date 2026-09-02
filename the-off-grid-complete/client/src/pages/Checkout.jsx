import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShieldCheck, Tag, LockKeyhole } from "lucide-react";
import { api } from "../api";
import "../checkout-conversion.css";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const FREE_SHIPPING_THRESHOLD = 1499;

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector('script[data-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });

export default function Checkout({ cart, setCart, user, onOrder }) {
  const nav = useNavigate();
  const paymentSucceededRef = useRef(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: "", email: user?.email || "", address: "", city: "", state: "Karnataka", pincode: "" });
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState("idle");
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => { if (user) setForm((current) => ({ ...current, name: current.name || user.name || "", email: current.email || user.email || "" })); }, [user]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0), [cart]);
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
  const discount = Number(coupon?.discount || 0);
  const grand = Math.max(0, total + shipping - discount);
  const shippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const shippingProgress = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));

  const change = (index, delta) => setCart((current) => current.map((item, i) => i !== index ? item : { ...item, qty: Math.max(1, Math.min(Math.max(1, Number(item.stock || 99)), Number(item.qty || 1) + delta)) }));

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponStatus("loading"); setCouponMsg("");
    try {
      const res = await api("/coupons/validate", { method: "POST", body: JSON.stringify({ code: couponCode.trim(), subtotal: total }) });
      setCoupon(res); setCouponStatus("success");
    } catch (err) { setCoupon(null); setCouponStatus("error"); setCouponMsg(err.message || "Invalid coupon code"); }
  };
  const removeCoupon = () => { setCoupon(null); setCouponCode(""); setCouponStatus("idle"); setCouponMsg(""); };
  const backendItems = () => cart.map((item) => ({ productId: Number(item.id), quantity: Number(item.qty || 1), selectedSize: item.selectedSize || null, selectedColor: item.selectedColor || null }));
  const shippingPayload = { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim().toLowerCase(), address: form.address.trim(), city: form.city.trim(), state: form.state.trim(), pincode: form.pincode.trim() };

  const cancelUnpaidOnlineOrder = async (orderId) => { if (!orderId || paymentSucceededRef.current) return; try { await api(`/orders/${orderId}/payment-cancel`, { method: "PATCH" }); } catch (err) { console.error("Unable to cancel unpaid payment order", err); } };

  const placeCodOrder = async () => {
    const response = await api("/orders/create", { method: "POST", body: JSON.stringify({ items: backendItems(), shipping: shippingPayload, payment_method: "cod", coupon_code: coupon?.code || "" }) });
    const order = response.order;
    const displayOrder = { ...order, items: cart, payment: "COD", date: order.created_at || new Date().toISOString(), customer: shippingPayload, shipping, subtotal: total, discount, total: Number(order.total || grand), status: order.status || "pending" };
    onOrder?.(displayOrder); setCart([]); nav("/success", { state: { order: displayOrder } });
  };

  const placeOnlineOrder = async () => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) throw new Error("Online payment is not configured yet. Please choose Cash on Delivery.");
    await loadRazorpay();
    const response = await api("/orders/create", { method: "POST", body: JSON.stringify({ items: backendItems(), shipping: shippingPayload, payment_method: "online", coupon_code: coupon?.code || "" }) });
    const order = response.order;
    if (!order?.razorpay_order_id) throw new Error("Could not create the online payment order.");
    paymentSucceededRef.current = false;
    await new Promise((resolve, reject) => {
      let settled = false;
      const finishReject = async (message, cancel = true) => { if (settled) return; settled = true; if (cancel) await cancelUnpaidOnlineOrder(order.id); reject(new Error(message)); };
      const finishResolve = () => { if (settled) return; settled = true; resolve(); };
      const rzp = new window.Razorpay({ key, amount: Math.round(Number(order.total) * 100), currency: "INR", name: "THE OFF GRID", description: "THE OFF GRID order", order_id: order.razorpay_order_id, prefill: { name: shippingPayload.name, email: shippingPayload.email, contact: shippingPayload.phone }, notes: { offgrid_order_id: String(order.id) }, theme: { color: "#111111" }, handler: async (payment) => {
        try {
          const verified = await api("/orders/verify-payment", { method: "POST", body: JSON.stringify({ orderId: order.id, razorpay_order_id: payment.razorpay_order_id, razorpay_payment_id: payment.razorpay_payment_id, razorpay_signature: payment.razorpay_signature }) });
          paymentSucceededRef.current = true;
          const displayOrder = { ...verified, items: cart, payment: "ONLINE", date: verified.created_at || new Date().toISOString(), customer: shippingPayload, shipping, subtotal: total, discount, total: Number(verified.total || grand), status: verified.status || "processing" };
          onOrder?.(displayOrder); setCart([]); finishResolve(); nav("/success", { state: { order: displayOrder } });
        } catch (err) { await finishReject(err.message || "Payment verification failed. Please contact support before retrying."); }
      }, modal: { ondismiss: async () => { if (!paymentSucceededRef.current) await finishReject("Payment was cancelled."); } } });
      rzp.on("payment.failed", async (response) => { await finishReject(response?.error?.description || "Payment failed. No payment was confirmed."); });
      rzp.open();
    });
  };

  const submit = async (e) => {
    e.preventDefault(); if (!cart.length) return;
    if (!user) { setError("Please sign in before checkout so your order can be securely saved to your account."); return; }
    setLoading(true); setError("");
    try { if (method === "COD") await placeCodOrder(); else await placeOnlineOrder(); } catch (err) { setError(err.message || "Could not place your order."); } finally { setLoading(false); }
  };

  if (!user) return <div className="checkout-page"><header className="simple-header"><Link to="/"><ArrowLeft /> THE OFF GRID</Link><span>SECURE CHECKOUT</span></header><main className="checkout-auth-required"><LockKeyhole size={42}/><span>THE OFF GRID / CHECKOUT</span><h1>SIGN IN TO<br/><em>CHECK OUT.</em></h1><p>Your cart is saved. Sign in so we can securely create and track your order.</p><button className="orange-btn" type="button" onClick={()=>nav("/account")}>SIGN IN / CREATE ACCOUNT</button><button className="text-button" type="button" onClick={()=>nav("/")}>CONTINUE SHOPPING</button></main></div>;

  return <div className="checkout-page"><header className="simple-header"><Link to="/"><ArrowLeft /> THE OFF GRID</Link><span>SECURE CHECKOUT</span></header><main className="checkout-grid"><section><div className="checkout-title"><span>THE OFF GRID / CHECKOUT</span><h1>YOUR <em>BAG.</em></h1></div>{!cart.length?<div className="empty-box"><h2>YOUR BAG IS EMPTY.</h2><Link className="orange-btn" to="/">SHOP NOW</Link></div>:cart.map((item,index)=><article className="checkout-item" key={`${item.id}-${item.selectedSize||""}-${item.selectedColor||""}`}><img src={item.image} alt={item.name}/><div><small>{item.category}</small><h3>{item.name}</h3>{item.selectedSize&&<p>SIZE: {item.selectedSize}</p>}{item.selectedColor&&<p>COLOR: {item.selectedColor}</p>}<strong>{money(item.price)}</strong><div className="quantity-line"><button type="button" onClick={()=>change(index,-1)}><Minus/></button><span>{item.qty||1}</span><button type="button" onClick={()=>change(index,1)}><Plus/></button><button type="button" onClick={()=>setCart(current=>current.filter((_,i)=>i!==index))}><Trash2/></button></div></div></article>)}</section><form className="checkout-form" onSubmit={submit}><h2>DELIVERY</h2>{["name","phone","email","address","city","state","pincode"].map(key=><input key={key} required value={form[key]} placeholder={key.toUpperCase()} type={key==="email"?"email":"text"} inputMode={key==="phone"||key==="pincode"?"numeric":undefined} maxLength={key==="phone"?10:key==="pincode"?6:undefined} onChange={e=>setForm(current=>({...current,[key]:e.target.value}))}/>) }<h2>PAYMENT</h2><div className="payment-options"><button type="button" className={method==="COD"?"active":""} onClick={()=>setMethod("COD")}>CASH ON DELIVERY</button><button type="button" className={method==="ONLINE"?"active":""} onClick={()=>setMethod("ONLINE")}>ONLINE PAYMENT</button></div><p className="payment-note"><ShieldCheck/> {method==="ONLINE"?"Secure Razorpay payment. Your card/UPI details are handled by Razorpay.":"Pay when your order is delivered."}</p><h2>COUPON</h2>{coupon?<div className="coupon-applied"><span><Tag size={13}/> {coupon.code} applied</span><button type="button" onClick={removeCoupon}>REMOVE</button></div>:<div className="coupon-row"><input value={couponCode} placeholder="ENTER COUPON CODE" onChange={e=>{setCouponCode(e.target.value.toUpperCase());if(couponStatus==="error"){setCouponStatus("idle");setCouponMsg("")}}}/><button type="button" onClick={applyCoupon} disabled={couponStatus==="loading"}>{couponStatus==="loading"?"...":"APPLY"}</button></div>}{couponStatus==="error"&&<p className="notify-me-error">{couponMsg}</p>}{error&&<p className="notify-me-error">{error}</p>}<div className="order-total"><span>SUBTOTAL <b>{money(total)}</b></span><span>SHIPPING <b>{shipping?money(shipping):"FREE"}</b></span>{discount>0&&<span>DISCOUNT <b>-{money(discount)}</b></span>}<strong>TOTAL <b>{money(grand)}</b></strong></div>{cart.length>0&&<div className="free-shipping-progress" aria-live="polite"><div className="free-shipping-progress-head"><span>{shippingGap>0?`ADD ${money(shippingGap)} MORE FOR FREE SHIPPING`:"YOU'VE UNLOCKED FREE SHIPPING"}</span><strong>{shippingProgress}%</strong></div><div className="free-shipping-progress-track"><span style={{width:`${shippingProgress}%`}}/></div></div>}<button className="product-detail-add" disabled={loading||!cart.length}>{loading?(method==="ONLINE"?"OPENING PAYMENT...":"PLACING ORDER..."):method==="ONLINE"?`PAY ${money(grand)}`:"PLACE COD ORDER"}</button></form></main></div>;
}
