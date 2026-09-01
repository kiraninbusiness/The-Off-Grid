import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  Truck,
  Lock,
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Checkout({
  cart = [],
  user = null,
  clearCart,
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [payment, setPayment] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  /*
    CALCULATE SUBTOTAL
  */

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.qty || 1),
      0
    );
  }, [cart]);

  /*
    SHIPPING

    Free shipping above ₹1,499,
    matching the website's top bar.
  */

  const shipping =
    subtotal >= 1499 || subtotal === 0
      ? 0
      : 99;

  const total = subtotal + shipping;

  /*
    UPDATE FORM
  */

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
    PLACE ORDER
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!form.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode)) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (!cart.length) {
      setError("Your bag is empty.");
      return;
    }

    setPlacing(true);

    try {
      /*
        Temporary frontend order creation.

        Later, this exact object can be sent
        to your backend/database/payment gateway.
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      const orderId =
        "OG" +
        Date.now()
          .toString()
          .slice(-8);

      const order = {
        id: orderId,

        status: "CONFIRMED",

        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price || 0),
          quantity: Number(item.qty || 1),
          qty: Number(item.qty || 1),
          category:
            item.category || "THE OFF GRID",
          image: item.image || "",
        })),

        customer: {
          name: form.name.trim(),
          phone: form.phone,
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode,
        },

        payment:
          payment === "cod"
            ? "Cash on Delivery"
            : "Online Payment",

        subtotal,
        shipping,
        total,

        createdAt:
          new Date().toISOString(),
      };

      /*
        Clear cart only after order object
        has been successfully created.
      */

      if (clearCart) {
        clearCart();
      }

      /*
        IMPORTANT:
        Send the order through router state
        so Success.jsx and Order.jsx can display it.
      */

      navigate("/order-success", {
        state: {
          order,
        },
      });
    } catch (err) {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  /*
    EMPTY CART
  */

  if (!cart.length) {
    return (
      <main className="checkout-page empty-checkout">

        <div className="empty-checkout-content">

          <span className="checkout-eyebrow">
            YOUR BAG
          </span>

          <h1>
            YOUR BAG
            <br />
            <em>IS EMPTY.</em>
          </h1>

          <p>
            Discover something new from
            The Off Grid collection.
          </p>

          <Link
            to="/"
            className="checkout-shop-button"
          >
            SHOP COLLECTION
            <ArrowRight size={17} />
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="checkout-page">

      {/* HEADER */}

      <header className="checkout-header">

        <button
          type="button"
          className="checkout-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          BACK
        </button>

        <Link
          to="/"
          className="checkout-logo"
        >
          <small>THE</small>
          <strong>OFF GRID</strong>
        </Link>

        <div className="checkout-secure">
          <ShieldCheck size={16} />
          SECURE CHECKOUT
        </div>

      </header>

      {/* TITLE */}

      <section className="checkout-title">

        <span className="checkout-eyebrow">
          CHECKOUT / 001
        </span>

        <h1>
          COMPLETE
          <br />
          <em>YOUR ORDER.</em>
        </h1>

        <p>
          You're almost there. Complete your
          details below to place your order.
        </p>

      </section>

      {/* MAIN LAYOUT */}

      <section className="checkout-layout">

        {/* LEFT */}

        <div className="checkout-main">

          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >

            {/* CONTACT */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>01</span>

                <div>
                  <h2>
                    Contact details
                  </h2>

                  <p>
                    Where can we reach you?
                  </p>
                </div>

              </div>

              <div className="checkout-grid">

                <label>
                  <span>FULL NAME</span>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      updateField(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </label>

                <label>
                  <span>PHONE NUMBER</span>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                  />
                </label>

                <label className="full-width">
                  <span>EMAIL ADDRESS</span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>

              </div>

            </section>

            {/* DELIVERY */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>02</span>

                <div>
                  <h2>
                    Delivery address
                  </h2>

                  <p>
                    Where should we deliver your order?
                  </p>
                </div>

              </div>

              <div className="checkout-grid">

                <label className="full-width">

                  <span>ADDRESS</span>

                  <textarea
                    rows="4"
                    value={form.address}
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="House number, street, area"
                    autoComplete="street-address"
                  />

                </label>

                <label>

                  <span>CITY</span>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City"
                    autoComplete="address-level2"
                  />

                </label>

                <label>

                  <span>STATE</span>

                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      updateField(
                        "state",
                        e.target.value
                      )
                    }
                    placeholder="State"
                    autoComplete="address-level1"
                  />

                </label>

                <label>

                  <span>PINCODE</span>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) =>
                      updateField(
                        "pincode",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="6-digit pincode"
                    autoComplete="postal-code"
                  />

                </label>

              </div>

            </section>

            {/* PAYMENT */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>03</span>

                <div>
                  <h2>
                    Payment
                  </h2>

                  <p>
                    Choose how you want to pay.
                  </p>
                </div>

              </div>

              <div className="payment-options">

                {/* COD */}

                <label
                  className={`payment-option ${
                    payment === "cod"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={
                      payment === "cod"
                    }
                    onChange={(e) =>
                      setPayment(
                        e.target.value
                      )
                    }
                  />

                  <div className="payment-icon">
                    <Truck size={20} />
                  </div>

                  <div className="payment-copy">
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives
                    </span>
                  </div>

                  {payment === "cod" && (
                    <div className="payment-check">
                      <Check size={16} />
                    </div>
                  )}

                </label>

                {/* ONLINE */}

                <label
                  className={`payment-option ${
                    payment === "online"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={
                      payment === "online"
                    }
                    onChange={(e) =>
                      setPayment(
                        e.target.value
                      )
                    }
                  />

                  <div className="payment-icon">
                    <CreditCard size={20} />
                  </div>

                  <div className="payment-copy">
                    <strong>
                      Online Payment
                    </strong>

                    <span>
                      UPI, card or net banking
                    </span>
                  </div>

                  {payment === "online" && (
                    <div className="payment-check">
                      <Check size={16} />
                    </div>
                  )}

                </label>

              </div>

            </section>

            {/* ERROR */}

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            {/* PLACE ORDER */}

            <button
              type="submit"
              className="place-order-button"
              disabled={placing}
            >

              {placing ? (
                <>
                  <span className="checkout-spinner"></span>
                  PLACING ORDER...
                </>
              ) : (
                <>
                  PLACE ORDER
                  <ArrowRight size={18} />
                </>
              )}

            </button>

            <div className="checkout-secure-note">

              <Lock size={14} />

              <span>
                YOUR INFORMATION IS SECURE AND
                WILL ONLY BE USED TO PROCESS YOUR ORDER.
              </span>

            </div>

          </form>

        </div>

        {/* RIGHT SUMMARY */}

        <aside className="checkout-summary">

          <div className="summary-sticky">

            <div className="summary-heading">

              <div>
                <span>YOUR ORDER</span>

                <strong>
                  {cart.reduce(
                    (total, item) =>
                      total +
                      Number(item.qty || 1),
                    0
                  )}{" "}
                  {cart.reduce(
                    (total, item) =>
                      total +
                      Number(item.qty || 1),
                    0
                  ) === 1
                    ? "ITEM"
                    : "ITEMS"}
                </strong>
              </div>

            </div>

            {/* ITEMS */}

            <div className="summary-items">

              {cart.map((item, index) => {

                const qty =
                  Number(item.qty) || 1;

                return (
                  <div
                    className="summary-item"
                    key={
                      item.id ||
                      `${item.name}-${index}`
                    }
                  >

                    <div className="summary-item-image">

                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <span>
                        {qty}
                      </span>

                    </div>

                    <div className="summary-item-info">

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.category ||
                          "THE OFF GRID"}
                      </span>

                    </div>

                    <strong className="summary-item-price">
                      {money(
                        Number(
                          item.price || 0
                        ) * qty
                      )}
                    </strong>

                  </div>
                );
              })}

            </div>

            {/* TOTALS */}

            <div className="summary-totals">

              <div>
                <span>SUBTOTAL</span>

                <strong>
                  {money(subtotal)}
                </strong>
              </div>

              <div>
                <span>SHIPPING</span>

                <strong>
                  {shipping === 0
                    ? "FREE"
                    : money(shipping)}
                </strong>
              </div>

              {shipping === 0 &&
                subtotal > 0 && (
                  <div className="free-shipping-note">
                    FREE SHIPPING APPLIED
                  </div>
                )}

            </div>

            {/* TOTAL */}

            <div className="summary-total">

              <span>TOTAL</span>

              <strong>
                {money(total)}
              </strong>

            </div>

            {/* TRUST */}

            <div className="checkout-trust">

              <div>
                <ShieldCheck size={17} />

                <span>
                  Secure checkout
                </span>
              </div>

              <div>
                <Truck size={17} />

                <span>
                  Delivery across India
                </span>
              </div>

              <div>
                <MapPin size={17} />

                <span>
                  India / Worldwide
                </span>
              </div>

            </div>

          </div>

        </aside>

      </section>

      {/* FOOTER */}

      <footer className="checkout-footer">

        <div>
          <small>THE</small>
          <strong>OFF GRID</strong>
        </div>

        <p>
          BUILT FOR THOSE WHO DON'T FOLLOW
          THE USUAL.
        </p>

        <span>
          © 2026 THE OFF GRID
        </span>

      </footer>

    </main>
  );
}
