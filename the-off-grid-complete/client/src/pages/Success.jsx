import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Check,
  ArrowRight,
  Package
} from "lucide-react";

export default function Success() {
  const location = useLocation();

  const order = location.state?.order;

  return (
    <main className="page success-page">

      <div className="success-container">

        <div className="success-icon">
          <Check size={34} />
        </div>

        <span className="eyebrow">
          THE OFF GRID
        </span>

        <h1>
          ORDER<br />
          CONFIRMED.
        </h1>

        <p className="success-message">
          Thank you for shopping with The Off Grid.
          Your order has been successfully placed.
        </p>

        {order?.id && (

          <div className="success-order-number">

            <span>
              ORDER NUMBER
            </span>

            <strong>
              #{order.id}
            </strong>

          </div>

        )}

        <div className="success-actions">

          {order && (

            <Link
              to="/order"
              state={{ order }}
              className="primary-button"
            >
              VIEW ORDER
              <ArrowRight size={17} />
            </Link>

          )}

          <Link
            to="/"
            className="secondary-button"
          >
            CONTINUE SHOPPING
          </Link>

        </div>

        <div className="success-note">

          <Package size={20} />

          <div>
            <strong>
              WHAT'S NEXT?
            </strong>

            <p>
              We'll prepare your order and keep you
              updated about its delivery.
            </p>
          </div>

        </div>

      </div>

    </main>
  );
}
