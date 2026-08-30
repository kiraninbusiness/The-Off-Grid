import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  LogOut,
  Package,
  ShoppingBag,
  UserRound,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { api } from "../api";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

function OrderTracking({ status }) {
  const steps = [
    {
      key: "pending",
      label: "Order Placed",
      icon: Clock
    },
    {
      key: "processing",
      label: "Processing",
      icon: Package
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: Truck
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: CheckCircle
    }
  ];

  if (status === "cancelled") {
    return (
      <div className="order-tracking cancelled-tracking">
        <div className="tracking-step active cancelled">
          <XCircle size={18} />

          <span>
            <strong>Order Cancelled</strong>

            <small>
              This order has been cancelled.
            </small>
          </span>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex(
    (step) => step.key === status
  );

  return (
    <div className="order-tracking">

      {steps.map((step, index) => {
        const Icon = step.icon;

        const completed =
          currentIndex >= index;

        return (
          <div
            className={
              completed
                ? "tracking-step completed"
                : "tracking-step"
            }
            key={step.key}
          >

            <div className="tracking-icon">
              <Icon size={17} />
            </div>

            <span>
              <strong>{step.label}</strong>

              {completed &&
                index === currentIndex && (
                  <small>Current status</small>
                )}
            </span>

            {index < steps.length - 1 && (
              <div
                className={
                  currentIndex > index
                    ? "tracking-line active"
                    : "tracking-line"
                }
              />
            )}

          </div>
        );
      })}

    </div>
  );
}

export default function Account({ user, setUser }) {

  const [mode, setMode] = useState("login");

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [forgotMessage, setForgotMessage] =
    useState("");

  const [forgotLoading, setForgotLoading] =
    useState(false);

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    referral_code: ""
  });

  const [err, setErr] = useState("");

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [cancelId, setCancelId] =
    useState(null);

  const [points, setPoints] =
    useState(0);

  const [referralCode, setReferralCode] =
    useState("");

  const [referralCount, setReferralCount] =
    useState(0);


  // =====================================================
  // LOAD ORDERS
  // =====================================================

  async function loadOrders() {
    try {

      const data = await api("/orders/mine");

      setOrders(data);

    } catch (e) {

      console.error(e);

      setOrders([]);

    }
  }


  async function loadPoints() {
    try {

      const me = await api("/auth/me");

      setPoints(Number(me.loyalty_points) || 0);
      setReferralCode(me.referral_code || "");
      setReferralCount(Number(me.referral_count) || 0);

    } catch (e) {
      console.error(e);
    }
  }


  useEffect(() => {

    const ref = new URLSearchParams(
      window.location.search
    ).get("ref");

    if (ref) {
      setMode("register");
      setF((prev) => ({
        ...prev,
        referral_code: ref.toUpperCase()
      }));
    }

  }, []);


  useEffect(() => {

    if (user) {
      loadOrders();
      loadPoints();
    }

  }, [user]);


  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {

    localStorage.removeItem(
      "thrift_token"
    );

    localStorage.removeItem(
      "thrift_user"
    );

    setUser(null);
  }


  // =====================================================
  // CANCEL ORDER
  // =====================================================

  async function cancelOrder(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );

    if (!confirmed) return;

    setCancelId(id);

    try {

      await api(
        `/orders/${id}/cancel`,
        {
          method: "PATCH"
        }
      );

      await loadOrders();

      alert(
        "Order cancelled successfully."
      );

    } catch (e) {

      alert(
        e.message ||
        "Could not cancel order."
      );

    } finally {

      setCancelId(null);

    }
  }


  // =====================================================
  // LOGGED-IN CUSTOMER / ADMIN
  // =====================================================

  if (user) {

    return (
      <main className="account-premium">

        <section className="account-hero">

          <div>

            <p className="eyebrow">
              THE OFF GRID
            </p>

            <h1>
              Welcome,
              <br />
              <em>{user.name}.</em>
            </h1>

            <p className="account-email">
              {user.email}
            </p>

          </div>

          <div className="account-profile-icon">
            <UserRound size={34} />
          </div>

        </section>


        {/* REWARDS */}

        <section className="rewards-card">

          <div>
            <p className="eyebrow">YOUR REWARDS</p>
            <h2>{points} points</h2>
            <p>
              Worth {`₹${points.toLocaleString("en-IN")}`}{" "}
              off your next order. Earn 1 point for every
              ₹100 you spend.
            </p>
          </div>

        </section>


        {/* REFERRAL */}

        {referralCode && (

          <section className="referral-card">

            <div>
              <p className="eyebrow">INVITE A FRIEND</p>
              <h3>
                Share your code, earn 100 points
                per friend who orders.
              </h3>

              <div className="referral-code-row">

                <code>{referralCode}</code>

                <button
                  type="button"
                  className="button dark small"
                  onClick={() => {

                    const link =
                      `${window.location.origin}/account?ref=${referralCode}`;

                    navigator.clipboard
                      .writeText(link)
                      .then(() =>
                        alert("Referral link copied!")
                      )
                      .catch(() => {});

                  }}
                >
                  COPY LINK
                </button>

              </div>

              {referralCount > 0 && (
                <small>
                  {referralCount} friend
                  {referralCount === 1 ? "" : "s"}{" "}
                  joined using your code.
                </small>
              )}

            </div>

          </section>

        )}


        <section className="account-toolbar">

          <div className="account-welcome">

            <Package size={18} />

            <span>

              <strong>
                Your wardrobe story
              </strong>

              <small>
                Manage your orders and account.
              </small>

            </span>

          </div>


          <div className="account-actions">

            {user.role === "admin" && (

              <Link
                className="account-admin-button"
                to="/admin"
              >
                ADMIN DASHBOARD
                <ArrowRight size={15} />
              </Link>

            )}

            <button
              className="account-logout"
              onClick={logout}
            >
              <LogOut size={15} />
              LOG OUT
            </button>

          </div>

        </section>


        <section className="account-orders">

          <div className="orders-heading">

            <div>

              <p className="eyebrow">
                YOUR HISTORY
              </p>

              <h2>
                Your orders
              </h2>

            </div>

            <span>
              {orders.length}{" "}
              {orders.length === 1
                ? "ORDER"
                : "ORDERS"}
            </span>

          </div>


          {!orders.length ? (

            <div className="orders-empty">

              <div className="orders-empty-icon">
                <ShoppingBag size={28} />
              </div>

              <p className="eyebrow">
                NOTHING HERE YET
              </p>

              <h3>
                Your next favourite
                <br />
                piece is waiting.
              </h3>

              <p>
                Explore our collection of carefully
                designed pieces.
              </p>

              <Link
                to="/shop"
                className="account-shop-button"
              >
                EXPLORE THE COLLECTION
                <ArrowRight size={16} />
              </Link>

            </div>

          ) : (

            <div className="orders-list">

              {orders.map((o) => (

                <article
                  className="premium-order-card"
                  key={o.id}
                >

                  <div className="order-main">

                    <div className="order-icon">
                      <Package size={20} />
                    </div>

                    <div className="order-info">

                      <span className="order-label">
                        ORDER
                      </span>

                      <strong>
                        #{o.id}
                      </strong>

                      <small>
                        {new Date(
                          o.created_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          }
                        )}
                      </small>

                    </div>

                  </div>


                  <div className="order-status">

                    <span
                      className={`status status-${o.status}`}
                    >
                      {o.status}
                    </span>

                  </div>


                  <div className="order-total">

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      {money(o.total)}
                    </strong>

                  </div>


                  <OrderTracking
                    status={o.status}
                  />


                  <Link
                    to={`/track-order/${o.id}`}
                    className="track-order-link"
                  >
                    VIEW FULL DETAILS
                    <ArrowRight size={14} />
                  </Link>


                  {o.status === "pending" && (

                    <button
                      className="cancel-order-button"
                      disabled={
                        cancelId === o.id
                      }
                      onClick={() =>
                        cancelOrder(o.id)
                      }
                    >
                      {cancelId === o.id
                        ? "CANCELLING..."
                        : "CANCEL ORDER"}
                    </button>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>


        <section className="account-footer-message">

          <span>
            THE OFF GRID
          </span>

          <p>
            Every purchase gives a beautiful
            piece another story.
          </p>

          <Link to="/shop">
            CONTINUE SHOPPING
            <ArrowRight size={15} />
          </Link>

        </section>

      </main>
    );
  }


  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  async function forgotPassword(e) {

    e.preventDefault();

    setErr("");
    setForgotMessage("");
    setForgotLoading(true);

    try {

      const data = await api(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({
            email: forgotEmail
          })
        }
      );

      setForgotMessage(
        data.message
      );

    } catch (e) {

      setErr(
        e.message ||
        "Could not process request."
      );

    } finally {

      setForgotLoading(false);

    }
  }


  // =====================================================
  // LOGIN / REGISTER
  // =====================================================

  async function submit(e) {

    e.preventDefault();

    setErr("");
    setLoading(true);

    try {

      const d = await api(
        "/auth/" + mode,
        {
          method: "POST",
          body: JSON.stringify(f)
        }
      );

      localStorage.setItem(
        "thrift_token",
        d.token
      );

      localStorage.setItem(
        "thrift_user",
        JSON.stringify(d.user)
      );

      setUser(d.user);

    } catch (e) {

      setErr(e.message);

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // AUTH PAGE
  // =====================================================

  return (
    <main className="account-auth">

      <div className="auth-decoration">

        <span>
          THE
        </span>

        <em>
          OFF
        </em>

        <span>
          GRID
        </span>

      </div>


      <section className="auth-card">

        <p className="eyebrow">
          YOUR ACCOUNT
        </p>


        <h1>

          {mode === "login"
            ? "Welcome back."
            : mode === "register"
            ? "Join THE OFF GRID."
            : "Reset your password."}

        </h1>


        <p className="auth-intro">

          {mode === "login"
            ? "Sign in to view your orders and continue your wardrobe story."
            : mode === "register"
            ? "Create an account to save your orders and discover your next favourite piece."
            : "Enter your email address and we'll send you a password reset link."}

        </p>


        {/* =================================================
            FORGOT PASSWORD FORM
        ================================================= */}

        {mode === "forgot" ? (

          <form
            className="premium-account-form"
            onSubmit={forgotPassword}
          >

            <label>

              EMAIL

              <input
                required
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) =>
                  setForgotEmail(
                    e.target.value
                  )
                }
              />

            </label>


            {err && (

              <p className="error">
                {err}
              </p>

            )}


            {forgotMessage && (

              <p className="success-message">
                {forgotMessage}
              </p>

            )}


            <button
              type="submit"
              disabled={forgotLoading}
              className="auth-submit"
            >

              {forgotLoading
                ? "PLEASE WAIT..."
                : "SEND RESET LINK"}

              {!forgotLoading && (
                <ArrowRight size={16} />
              )}

            </button>

          </form>

        ) : (


          /* =================================================
             LOGIN / REGISTER FORM
          ================================================= */

          <form
            className="premium-account-form"
            onSubmit={submit}
          >

            {mode === "register" && (

              <label>

                FULL NAME

                <input
                  required
                  placeholder="Your full name"
                  value={f.name}
                  onChange={(e) =>
                    setF({
                      ...f,
                      name: e.target.value
                    })
                  }
                />

              </label>

            )}


            {mode === "register" && (

              <label>

                REFERRAL CODE (OPTIONAL)

                <input
                  placeholder="Got a code? Enter it here"
                  value={f.referral_code}
                  onChange={(e) =>
                    setF({
                      ...f,
                      referral_code:
                        e.target.value.toUpperCase()
                    })
                  }
                />

              </label>

            )}


            <label>

              EMAIL

              <input
                required
                type="email"
                placeholder="you@example.com"
                value={f.email}
                onChange={(e) =>
                  setF({
                    ...f,
                    email: e.target.value
                  })
                }
              />

            </label>


            <label>

              PASSWORD

              <input
                required
                minLength="6"
                type="password"
                placeholder="Your password"
                value={f.password}
                onChange={(e) =>
                  setF({
                    ...f,
                    password: e.target.value
                  })
                }
              />

            </label>


            {/* FORGOT PASSWORD */}

            {mode === "login" && (

              <button
                type="button"
                className="forgot-password"
                onClick={() => {

                  setErr("");
                  setForgotMessage("");

                  setForgotEmail(
                    f.email
                  );

                  setMode("forgot");

                }}
              >
                Forgot password?
              </button>

            )}


            {err && (

              <p className="error">
                {err}
              </p>

            )}


            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >

              {loading
                ? "PLEASE WAIT..."
                : mode === "login"
                ? "LOGIN"
                : "CREATE ACCOUNT"}

              {!loading && (
                <ArrowRight size={16} />
              )}

            </button>

          </form>

        )}


        {/* =================================================
            SWITCH LOGIN / REGISTER / FORGOT
        ================================================= */}

        <button
          type="button"
          className="auth-switch"
          onClick={() => {

            setErr("");
            setForgotMessage("");

            if (mode === "forgot") {

              setMode("login");

            } else {

              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              );

            }

          }}
        >

          {mode === "login"
            ? "Don't have an account? Create one"
            : mode === "register"
            ? "Already registered? Login"
            : "Back to Login"}

        </button>

      </section>

    </main>
  );
}
