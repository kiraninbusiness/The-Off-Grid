import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
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

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  /* ---------------------------------------------
     FIND PRODUCT
  --------------------------------------------- */

  const product = useMemo(() => {
    return products.find(
      (item) => String(item.id) === String(id)
    );
  }, [products, id]);

  /* ---------------------------------------------
     PRODUCT NOT FOUND
  --------------------------------------------- */

  if (!product) {
    return (
      <main className="page product-page">
        <div className="empty-state">

          <span className="eyebrow">
            THE OFF GRID
          </span>

          <h1>
            PRODUCT NOT FOUND
          </h1>

          <p>
            We couldn't find the product you're looking for.
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

  /* ---------------------------------------------
     DATA
  --------------------------------------------- */

  const sizes = product.size
    ? product.size
        .split("/")
        .map((size) => size.trim())
    : [];

  const isWishlisted = wishlist.some(
    (item) =>
      String(item) === String(product.id)
  );

  const discount =
    product.old_price && product.price
      ? Math.round(
          ((product.old_price - product.price) /
            product.old_price) *
            100
        )
      : 0;

  /* ---------------------------------------------
     ADD TO CART
  --------------------------------------------- */

  const handleAddToBag = () => {
    if (!product.stock) return;

    for (let i = 0; i < quantity; i++) {
      add?.(product);
    }
  };

  /* ---------------------------------------------
     BUY NOW
  --------------------------------------------- */

  const handleBuyNow = () => {
    if (!product.stock) return;

    for (let i = 0; i < quantity; i++) {
      add?.(product);
    }

    navigate("/checkout");
  };

  return (
    <main className="product-details-page">

      {/* -----------------------------------------
          HEADER
      ----------------------------------------- */}

      <header className="product-details-header">

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

        <Link
          to="/checkout"
          className="product-bag-link"
        >
          <ShoppingBag size={18} />
          BAG
        </Link>

      </header>

      {/* -----------------------------------------
          PRODUCT
      ----------------------------------------- */}

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

        {/* INFORMATION */}

        <div className="product-details-info">

          <div className="product-details-category">
            {product.category}
            {" · "}
            {product.gender}
          </div>

          <h1>
            {product.name}
          </h1>

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

          <div className="product-details-line"></div>

          {/* DESCRIPTION */}

          <div className="product-description">

            <p>
              {product.description ||
                "Designed for everyday wear with a clean silhouette and strong attention to detail."}
            </p>

          </div>

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
              <span>CONDITION</span>
              <strong>
                {product.condition || "NEW"}
              </strong>
            </div>

          </div>

          {/* SIZE */}

          {sizes.length > 0 && (
            <div className="product-size-section">

              <div className="product-option-heading">

                <span>
                  SELECT SIZE
                </span>

                <span>
                  SIZE GUIDE
                </span>

              </div>

              <div className="product-sizes">

                {sizes.map((size) => (

                  <button
                    type="button"
                    key={size}
                    className={
                      selectedSize === size
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedSize(size)
                    }
                  >
                    {size}

                    {selectedSize === size && (
                      <Check size={14} />
                    )}

                  </button>

                ))}

              </div>

            </div>
          )}

          {/* QUANTITY */}

          <div className="product-quantity">

            <span>
              QUANTITY
            </span>

            <div>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.max(1, quantity - 1)
                  )
                }
              >
                −
              </button>

              <strong>
                {quantity}
              </strong>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.min(
                      Number(product.stock) || 1,
                      quantity + 1
                    )
                  )
                }
              >
                +
              </button>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="product-actions">

            <button
              type="button"
              className="product-main-button"
              disabled={!product.stock}
              onClick={handleAddToBag}
            >

              <ShoppingBag size={18} />

              {product.stock
                ? "ADD TO BAG"
                : "SOLD OUT"}

            </button>

            <button
              type="button"
              className={
                isWishlisted
                  ? "product-wishlist-button active"
                  : "product-wishlist-button"
              }
              onClick={() =>
                toggle?.(product.id)
              }
              aria-label="Wishlist"
            >
              <Heart
                size={20}
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

          </div>

          <button
            type="button"
            className="product-buy-now"
            disabled={!product.stock}
            onClick={handleBuyNow}
          >
            BUY IT NOW
            <ArrowRight size={18} />
          </button>

          {/* DELIVERY */}

          <div className="product-benefits">

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

              <ShieldCheck size={19} />

              <div>
                <strong>
                  SECURE PAYMENT
                </strong>

                <span>
                  Safe & secure checkout
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
                  Simple return policy
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* -----------------------------------------
          RELATED / CONTINUE SHOPPING
      ----------------------------------------- */}

      <section className="product-details-bottom">

        <div>

          <span>
            THE OFF GRID
          </span>

          <h2>
            NOT MADE
            <br />
            FOR <em>EVERYONE.</em>
          </h2>

        </div>

        <Link
          to="/"
          className="product-continue"
        >
          CONTINUE SHOPPING
          <ArrowRight size={17} />
        </Link>

      </section>

    </main>
  );
}
