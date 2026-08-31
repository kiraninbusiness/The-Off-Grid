import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle } from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Order() {
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <main className="page order-page">
        <div className="empty-state">
          <Package size={42} />
          <h1>NO ORDER FOUND</h1>
          <p>We couldn't find the order you're looking for.</p>

          <Link to="/" className="primary-button">
            BACK TO SHOP
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page order-page">

      <div className="order-container">

        <Link to="/" className="back-link">
          <ArrowLeft size={17} />
          CONTINUE SHOPPING
        </Link>

        <div className="order-header">

          <div>
            <span className="eyebrow">
              THE OFF GRID
            </span>

            <h1>
              ORDER DETAILS
            </h1>

            <p>
              Order #{order.id || "CONFIRMED"}
            </p>
          </div>

          <div className="order-status">
            <CheckCircle size={20} />
            CONFIRMED
          </div>

        </div>

        <section className="order-card">

          <div className="order-card-header">
            <div>
              <span>ORDER</span>
              <strong>
                #{order.id || "—"}
              </strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>
                {order.status || "CONFIRMED"}
              </strong>
            </div>
          </div>

          {order.items?.length > 0 && (

            <div className="order-items">

              {order.items.map((item, index) => (

                <div
                  className="order-item"
                  key={item.id || index}
                >

                  <div className="order-item-image">

                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    )}

                  </div>

                  <div className="order-item-info">

                    <span>
                      {item.category || "THE OFF GRID"}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      Qty: {item.quantity || item.qty || 1}
                    </p>

                  </div>

                  <strong>
                    {money(
                      Number(item.price || 0) *
                      Number(item.quantity || item.qty || 1)
                    )}
                  </strong>

                </div>

              ))}

            </div>

          )}

          <div className="order-summary">

            <div>
              <span>SUBTOTAL</span>
              <strong>
                {money(order.subtotal || order.total)}
              </strong>
            </div>

            <div>
              <span>SHIPPING</span>
              <strong>
                {order.shipping
                  ? money(order.shipping)
                  : "FREE"}
              </strong>
            </div>

            <div className="order-total">
              <span>TOTAL</span>
              <strong>
                {money(order.total)}
              </strong>
            </div>

          </div>

        </section>

        {order.customer && (

          <section className="order-card">

            <div className="section-heading">
              <span>DELIVERY</span>
              <h2>
                SHIPPING INFORMATION
              </h2>
            </div>

            <div className="shipping-info">

              <strong>
                {order.customer.name}
              </strong>

              {order.customer.phone && (
                <p>
                  {order.customer.phone}
                </p>
              )}

              {order.customer.address && (
                <p>
                  {order.customer.address}
                </p>
              )}

              <p>
                {order.customer.city}
                {order.customer.pincode
                  ? ` — ${order.customer.pincode}`
                  : ""}
              </p>

            </div>

          </section>

        )}

        <div className="order-actions">

          <Link
            to="/"
            className="primary-button"
          >
            CONTINUE SHOPPING
          </Link>

        </div>

      </div>

    </main>
  );
}
