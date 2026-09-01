import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductDetails({
  products = [],
  add,
  wishlist = [],
  toggle,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  /*
   * IMPORTANT:
   * Convert both IDs to strings so that
   * /product/1 matches product.id = 1
   */
  const product = products.find(
    (item) =>
      String(item.id) === String(id)
  );

  /* =====================================================
     PRODUCT NOT FOUND
  ===================================================== */

  if (!product) {
    return (
      <main className="product-page">

        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px 20px",
          }}
        >

          <span className="eyebrow">
            THE OFF GRID
          </span>

          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 90px)",
              margin: "15px 0",
              letterSpacing: "-0.04em",
            }}
          >
            PRODUCT
            <br />
            NOT FOUND.
          </h1>

          <p
            style={{
              maxWidth: "500px",
              opacity: 0.65,
              marginBottom: "30px",
            }}
          >
            The product you're looking for
            doesn't exist or may have been
            removed.
          </p>

          <Link
            to="/"
            className="primary-button"
          >
            BACK TO SHOP
            <ArrowRight size={17} />
          </Link>

        </div>

      </main>
    );
  }


  /* =====================================================
     PRODUCT DATA
  ===================================================== */

  const isWishlisted = wishlist.some(
    (item) =>
      String(item) === String(product.id)
  );

  const discount =
    product.old_price &&
    product.price
      ? Math.round(
          ((product.old_price -
            product.price) /
            product.old_price) *
            100
        )
      : 0;


  /* =====================================================
     ADD TO BAG
  ===================================================== */

  const handleAdd = () => {
    if (!product.stock) return;

    if (add) {
      add(product);
    }
  };


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="product-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="product-header">

        <Link
          to="/"
          className="product-back"
        >
          <ArrowLeft size={17} />
          BACK TO SHOP
        </Link>


        <Link
          to="/"
          className="product-logo"
        >
          <small>THE</small>
          <strong>OFF GRID</strong>
        </Link>


        <button
          type="button"
          className="product-bag-link"
          onClick={() =>
            navigate("/checkout")
          }
        >
          <ShoppingBag size={19} />
          BAG
        </button>

      </header>


      {/* =================================================
          PRODUCT
      ================================================= */}

      <section className="product-details">

        {/* LEFT IMAGE */}

        <div className="product-details-image">

          <img
            src={product.image}
            alt={product.name}
          />

          <div className="product-image-label">

            <span>
              THE OFF GRID / {String(product.id).padStart(3, "0")}
            </span>

          </div>

        </div>


        {/* RIGHT INFORMATION */}

        <div className="product-details-info">

          <div className="product-details-top">

            <span className="product-category">
              {product.category}
              {" · "}
              {product.gender}
            </span>


            {product.condition && (
              <span className="product-condition">
                {product.condition}
              </span>
            )}

          </div>


          <h1>
            {product.name}
          </h1>


          <div className="product-price">

            <strong>
              {money(product.price)}
            </strong>

            {product.old_price && (
              <del>
                {money(product.old_price)}
              </del>
            )}

            {discount > 0 && (
              <span>
                SAVE {discount}%
              </span>
            )}

          </div>


          {/* DESCRIPTION */}

          <p className="product-description">
            {product.description ||
              "Designed for everyday wear with a clean silhouette, premium feel and The Off Grid attitude."}
          </p>


          {/* PRODUCT INFO */}

          <div className="product-specs">

            <div>
              <span>COLOR</span>
              <strong>
                {product.color || "—"}
              </strong>
            </div>


            <div>
              <span>FIT</span>
              <strong>
                {product.fit || "—"}
              </strong>
            </div>


            <div>
              <span>SIZE</span>
              <strong>
                {product.size || "—"}
              </strong>
            </div>

          </div>


          {/* SIZE */}

          <div className="product-size-section">

            <div className="product-size-heading">

              <span>
                SELECT SIZE
              </span>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Size guide coming soon."
                  )
                }
              >
                SIZE GUIDE
              </button>

            </div>


            <div className="product-sizes">

              {(product.size || "")
                .split("/")
                .map((size) => (
                  <button
                    type="button"
                    key={size.trim()}
                  >
                    {size.trim()}
                  </button>
                ))}

            </div>

          </div>


          {/* ADD TO BAG */}

          <button
            type="button"
            className="product-add-button"
            disabled={!product.stock}
            onClick={handleAdd}
          >

            <span>
              {product.stock
                ? "ADD TO BAG"
                : "SOLD OUT"}
            </span>

            <ShoppingBag size={19} />

          </button>


          {/* WISHLIST */}

          <button
            type="button"
            className={`product-wishlist-button ${
              isWishlisted
                ? "active"
                : ""
            }`}
            onClick={() =>
              toggle?.(product.id)
            }
          >

            <Heart
              size={18}
              fill={
                isWishlisted
                  ? "currentColor"
                  : "none"
              }
            />

            {isWishlisted
              ? "REMOVE FROM WISHLIST"
              : "ADD TO WISHLIST"}

          </button>


          {/* DELIVERY INFO */}

          <div className="product-service">

            <div>

              <Truck size={19} />

              <div>

                <strong>
                  FAST SHIPPING
                </strong>

                <span>
                  Delivery across India
                </span>

              </div>

            </div>


            <div>

              <RotateCcw size={19} />

              <div>

                <strong>
                  EASY RETURNS
                </strong>

                <span>
                  Simple & transparent
                </span>

              </div>

            </div>


            <div>

              <ShieldCheck size={19} />

              <div>

                <strong>
                  SECURE PAYMENT
                </strong>

                <span>
                  Safe checkout
                </span>

              </div>

            </div>

          </div>


          {/* BACK */}

          <Link
            to="/"
            className="product-continue"
          >
            CONTINUE SHOPPING
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>


      {/* =================================================
          BOTTOM STATEMENT
      ================================================= */}

      <section className="product-statement">

        <span>
          THE OFF GRID
        </span>

        <h2>
          NOT MADE
          <br />
          FOR <em>EVERYONE.</em>
        </h2>

      </section>

    </main>
  );
}
