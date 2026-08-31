import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  Truck
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Checkout({
  cart = [],
  user = null,
  clearCart
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [payment, setPayment] =
    useState("cod");

  const [placing, setPlacing] =
    useState(false);

  const [error, setError] =
    useState("");

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.qty || 1),
      0
    );
  }, [cart]);

  const shipping =
    subtotal >= 1999 || subtotal === 0
      ? 0
      : 99;

  const total =
    subtotal + shipping;


  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter your address.");
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

    setPlacing(true);

    /*
      Keep this frontend-safe for now.
      Your existing backend/order API can be
      connected here later.
    */

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      if (clearCart) {
        clearCart();
      }

      navigate("/order-success");
    } catch (err) {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };


  /* EMPTY CART */

  if (!cart.length) {
    return (
      <main className="checkout-page empty-checkout">

        <div className="empty-checkout-content">

          <p className="checkout-eyebrow">
            YOUR BAG
          </p>

          <h1>
            Your bag is empty.
          </h1>

          <p>
            Discover something new from
            The Off Grid collection.
          </p>

          <Link
            to="/shop"
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
          THE OFF GRID
        </Link>

        <div className="checkout-secure">
          <ShieldCheck size={16} />
          SECURE CHECKOUT
        </div>

      </header>


      {/* PAGE TITLE */}

      <div className="checkout-title">

        <p className="checkout-eyebrow">
          CHECKOUT
        </p>

        <h1>
          Complete your order.
        </h1>

      </div>


      {/* CONTENT */}

      <section className="checkout-layout">

        {/* LEFT */}

        <div className="checkout-main">

          <form
            onSubmit={handleSubmit}
            className="checkout-form"
          >

            {/* CONTACT */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  01
                </span>

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
                  <span>
                    FULL NAME
                  </span>

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
                  />
                </label>


                <label>
                  <span>
                    PHONE NUMBER
                  </span>

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
                  />
                </label>


                <label className="full-width">
                  <span>
                    EMAIL ADDRESS
                  </span>

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
                  />
                </label>

              </div>

            </section>


            {/* SHIPPING */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  02
                </span>

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
                  <span>
                    ADDRESS
                  </span>

                  <textarea
                    rows="3"
                    value={form.address}
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="House number, street, area"
                  />
                </label>


                <label>
                  <span>
                    CITY
                  </span>

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
                  />
                </label>


                <label>
                  <span>
                    STATE
                  </span>

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
                  />
                </label>


                <label>
                  <span>
                    PINCODE
                  </span>

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
                  />
                </label>

              </div>

            </section>


            {/* PAYMENT */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  03
                </span>

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

                <label
                  className={
                    payment === "cod"
                      ? "payment-option selected"
                      : "payment-option"
                  }
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
                    <Truck size={19} />
                  </div>

                  <div>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives
                    </span>
                  </div>

                  {payment === "cod" && (
                    <Check size={18} />
                  )}

                </label>


                <label
                  className={
                    payment === "online"
                      ? "payment-option selected"
                      : "payment-option"
                  }
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
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <strong>
                      Online Payment
                    </strong>

                    <span>
                      UPI, card or net banking
                    </span>
                  </div>

                  {payment === "online" && (
                    <Check size={18} />
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


            {/* SUBMIT */}

            <button
              type="submit"
              className="place-order-button"
              disabled={placing}
            >

              {placing ? (
                <>
                  PLACING ORDER...
                </>
              ) : (
                <>
                  PLACE ORDER
                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>

        </div>


        {/* RIGHT — SUMMARY */}

        <aside className="checkout-summary">

          <div className="summary-sticky">

            <div className="summary-heading">

              <span>
                YOUR ORDER
              </span>

              <strong>
                {cart.length}{" "}
                {cart.length === 1
                  ? "ITEM"
                  : "ITEMS"}
              </strong>

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


                    <strong>
                      {money(
                        Number(item.price || 0) *
                          qty
                      )}
                    </strong>

                  </div>
                );
              })}

            </div>


            {/* TOTALS */}

            <div className="summary-totals">

              <div>
                <span>
                  SUBTOTAL
                </span>

                <strong>
                  {money(subtotal)}
                </strong>
              </div>


              <div>
                <span>
                  SHIPPING
                </span>

                <strong>
                  {shipping === 0
                    ? "FREE"
                    : money(shipping)}
                </strong>
              </div>


              {shipping === 0 &&
                subtotal > 0 && (
                  <p className="free-shipping-note">
                    FREE SHIPPING APPLIED
                  </p>
                )}

            </div>


            {/* GRAND TOTAL */}

            <div className="summary-total">

              <span>
                TOTAL
              </span>

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
                <MapPin size={17} />

                <span>
                  Delivery across India
                </span>
              </div>

            </div>

          </div>

        </aside>

      </section>


      {/* FOOTER NOTE */}

      <footer className="checkout-footer">

        <span>
          THE OFF GRID
        </span>

        <p>
          Built for those who don't follow
          the usual.
        </p>

      </footer>

    </main>
  );
}
