import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

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

  /* -----------------------------------------
     FIND PRODUCT
  ----------------------------------------- */

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  /* -----------------------------------------
     PRODUCT NOT FOUND
  ----------------------------------------- */

  if (!product) {
    return (
      <main className="page product-not-found">
        <div className="product-not-found-inner">

          <span className="eyebrow">
            THE OFF GRID
          </span>

          <h1>
            PRODUCT NOT
            <br />
            <em>FOUND.</em>
          </h1>

          <p>
            We couldn't find the product you're
            looking for.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/")}
          >
            BACK TO SHOP
            <ArrowRight size={17} />
          </button>

        </div>
      </main>
    );
  }

  /* -----------------------------------------
     WISHLIST
  ----------------------------------------- */

  const isWishlisted = wishlist.some(
    (item) =>
      String(item) === String(product.id)
  );

  /* -----------------------------------------
     DISCOUNT
  ----------------------------------------- */

  const discount =
    product.old_price && product.price
      ? Math.round(
          ((product.old_price - product.price) /
            product.old_price) *
            100
        )
      : 0;

  /* -----------------------------------------
     ADD TO BAG
  ----------------------------------------- */

  const handleAddToBag = () => {
    if (product.stock) {
      add?.(product);
    }
  };

  return (
    <main className="page product-details-page">

      {/* ---------------------------------------
          TOP NAV
      --------------------------------------- */}

      <div className="product-details-top">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          BACK
        </button>

        <span>
          THE OFF GRID / PRODUCT
        </span>

      </div>

      {/* ---------------------------------------
          PRODUCT
      --------------------------------------- */}

      <section className="product-details">

        {/* IMAGE */}
        <div className="product-details-image">

          <img
            src={product.image}
            alt={product.name}
          />

          <div className="product-details-badges">

            {discount > 0 && (
              <span>
                -{discount}%
              </span>
            )}

            {product.condition && (
              <span>
                {product.condition}
              </span>
            )}

          </div>

        </div>

        {/* INFO */}
        <div className="product-details-info">

          <span className="eyebrow">
            {product.category}
            {" / "}
            {product.gender}
          </span>

          <h1>
            {product.name}
          </h1>

          {/* PRICE */}

          <div className="product-details-price">

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
            {product.description}
          </p>

          {/* PRODUCT META */}

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

            <div>
              <span>AVAILABILITY</span>
              <strong>
                {product.stock
                  ? `${product.stock} IN STOCK`
                  : "SOLD OUT"}
              </strong>
            </div>

          </div>

          {/* SIZE DISPLAY */}

          <div className="product-size-section">

            <div className="product-option-title">
              <span>AVAILABLE SIZES</span>
            </div>

            <div className="product-size-list">

              {(product.size || "")
                .split("/")
                .map((size) => size.trim())
                .filter(Boolean)
                .map((size) => (
                  <span
                    key={size}
                    className="product-size"
                  >
                    {size}
                  </span>
                ))}

            </div>

          </div>

          {/* ACTIONS */}

          <div className="product-details-actions">

            <button
              type="button"
              className="product-details-add"
              disabled={!product.stock}
              onClick={handleAddToBag}
            >

              <span>
                {product.stock
                  ? "ADD TO BAG"
                  : "SOLD OUT"}
              </span>

              {product.stock && (
                <ShoppingBag size={19} />
              )}

            </button>

            <button
              type="button"
              className={`product-details-wishlist ${
                isWishlisted
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                toggle?.(product.id)
              }
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <Heart
                size={21}
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

          </div>

          {/* FEATURES */}

          <div className="product-features">

            <div className="product-feature">

              <Truck size={20} />

              <div>
                <strong>
                  FAST SHIPPING
                </strong>

                <span>
                  Delivery across India
                </span>
              </div>

            </div>

            <div className="product-feature">

              <ShieldCheck size={20} />

              <div>
                <strong>
                  QUALITY FIRST
                </strong>

                <span>
                  Every piece checked
                </span>
              </div>

            </div>

            <div className="product-feature">

              <RotateCcw size={20} />

              <div>
                <strong>
                  EASY RETURNS
                </strong>

                <span>
                  Simple & transparent
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ---------------------------------------
          BACK TO SHOP
      --------------------------------------- */}

      <section className="product-details-bottom">

        <Link
          to="/"
          className="under-btn"
        >
          <ArrowLeft size={15} />
          CONTINUE SHOPPING
        </Link>

      </section>

    </main>
  );
}
