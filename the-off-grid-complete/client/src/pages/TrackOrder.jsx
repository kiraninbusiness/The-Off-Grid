import React from "react";
import { useLocation } from "react-router-dom";

/*
  IMPORTANT FIX:
  This page used useParams() to read the order id, but the app never
  renders it inside a <Route path="/track-order/:id"> — App.jsx just
  checks location.pathname.startsWith(...) and renders this component
  directly. useParams() always returned {}, so no order could ever be
  found. We now parse the id from the pathname the same way App.jsx
  parses product ids. It also never received an `orders` list before,
  which would have crashed the page the moment it tried to search it.
*/
export default function TrackOrder({ orders = [] }) {
  const location = useLocation();
  const id = location.pathname.split("/track-order/")[1]?.split("/")[0];
  const o = orders.find((x) => String(x.id) === String(id));

  const steps = ["pending", "processing", "shipped", "delivered"];
  const cur = o ? steps.indexOf(o.status) : -1;

  return (
    <div className="page track-page">
      <div className="page-head">
        <span>THE OFF GRID / TRACKING</span>
        <h1>
          TRACK <em>YOUR ORDER.</em>
        </h1>
      </div>

      {o ? (
        <div className="track-card">
          <h2>{o.id}</h2>

          {o.status === "cancelled" ? (
            <p className="notify-me-error">This order was cancelled.</p>
          ) : (
            <div className="tracking-steps">
              {steps.map((s, i) => (
                <div className={i <= cur ? "done" : ""} key={s}>
                  <b>{i + 1}</b>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          <p>
            Shipping to {o.customer?.city}, {o.customer?.state} ·{" "}
            {o.customer?.pincode}
          </p>
        </div>
      ) : (
        <div className="empty-box">
          <h2>ORDER NOT FOUND.</h2>
        </div>
      )}
    </div>
  );
}
