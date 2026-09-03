import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Gift } from "lucide-react";
import { api } from "../api";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function GiftCards({ user }) {
  const nav = useNavigate();
  const [amounts, setAmounts] = useState([500, 1000, 2000, 5000]);
  const [amount, setAmount] = useState(1000);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const [mine, setMine] = useState([]);

  useEffect(() => {
    api("/gift-cards/amounts").then((data) => Array.isArray(data) && setAmounts(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api("/gift-cards/mine").then((data) => Array.isArray(data) && setMine(data)).catch(() => {});
  }, [user, done]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { nav("/account"); return; }
    setErr("");
    setBusy(true);
    try {
      const card = await api("/gift-cards/purchase", {
        method: "POST",
        body: JSON.stringify({ amount, recipient_email: recipientEmail.trim(), recipient_name: recipientName.trim(), message: message.trim() }),
      });
      setDone(card);
      setRecipientEmail("");
      setRecipientName("");
      setMessage("");
    } catch (e) {
      setErr(e.message || "Could not purchase gift card.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <span>THE OFF GRID / GIFT CARDS</span>
        <h1>GIVE THE <em>GRID.</em></h1>
      </div>

      <div className="giftcard-layout">
        <form className="giftcard-form" onSubmit={submit}>
          <h2>CHOOSE AN AMOUNT</h2>
          <div className="giftcard-amounts">
            {amounts.map((a) => (
              <button type="button" key={a} className={amount === a ? "active" : ""} onClick={() => setAmount(a)}>{money(a)}</button>
            ))}
          </div>

          <h2>RECIPIENT</h2>
          <input required type="email" placeholder="RECIPIENT EMAIL" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
          <input placeholder="RECIPIENT NAME (OPTIONAL)" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          <textarea placeholder="PERSONAL MESSAGE (OPTIONAL)" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />

          {err && <p className="notify-me-error">{err}</p>}
          {!user && <p className="notify-me-error">Sign in to purchase a gift card.</p>}

          <button className="orange-btn" disabled={busy}>
            <Gift size={16} /> {busy ? "SENDING..." : `SEND ${money(amount)} GIFT CARD`}
          </button>
        </form>

        <div className="giftcard-side">
          {done && (
            <div className="giftcard-success">
              <h3>SENT.</h3>
              <p>Code {done.code} for {money(done.initial_value)} has been emailed to {done.recipient_email}.</p>
            </div>
          )}

          {user && mine.length > 0 && (
            <div className="giftcard-history">
              <h3>GIFT CARDS YOU'VE SENT</h3>
              {mine.map((c) => (
                <div key={c.id}>
                  <strong>{c.code}</strong>
                  <span>{money(c.balance)} of {money(c.initial_value)} remaining · to {c.recipient_email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
