import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
  const [added, setAdded] = useState(false);

  /* =====================================================
     FIND PRODUCT
  ===================================================== */

  const product = useMemo(() => {
    return products.find(
      (item) => String(item.id) === String(id)
    );
  }, [products, id]);

  /* =====================================================
     PRODUCT NOT FOUND
  ===================================================== */

  if (!product) {
    return (
      <div className="product-not-found">

        <span>404 / PRODUCT</span>

        <h1>
          PRODUCT
          <br />
          NOT FOUND.
        </h1>

        <Link to="/" className="orange-btn">
          BACK TO SHOP
          <ArrowRight size={18} />
        </Link>

      </div>
    );
  }

  /* =====================================================
     PRODUCT DATA
  ===================================================== */

  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.old_price) || 0;

  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      : 0;

  const isWishlisted = wishlist.includes(product.id);

  /* =====================================================
     QUANTITY
  ===================================================== */

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(stock || 1, current + 1)
    );
  };

  /* =====================================================
     ADD TO BAG
  ===================================================== */

  const handleAddToBag = () => {
    if (stock < 1) return;

    for (let i = 0; i < quantity; i++) {
      add(product);
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const handleBuyNow = () => {
    if (stock < 1) return;

    for (let i = 0; i < quantity; i++) {
      add(product);
    }

    navigate("/checkout");
  };

  /* =====================================================
     WISHLIST
  ===================================================== */

  const handleWishlist = () => {
    if (toggle) {
      toggle(product.id);
    }
  };

  return (
    <main className="product-details-page">

      {/* =================================================
          TOP NAV
      ================================================= */}

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

      {/* =================================================
          PRODUCT
      ================================================= */}

      <section className="product-details">

        {/* IMAGE */}
        <div className="product-details-image">

          <img
            src={product.image}
            alt={product.name}
          />

          {/* BADGES */}

          <div className="product-details-badges">

            {discount > 0 && (
              <span className="badge sale">
                -{discount}%
              </span>
            )}

            {product.condition && (
              <span className="badge">
                {product.condition}
              </span>
            )}

            {stock < 1 && (
              <span className="badge sold">
                SOLD OUT
              </span>
            )}

          </div>

        </div>

        {/* INFORMATION */}
        <div className="product-details-content">

          <div className="product-details-category">
            {product.category || "COLLECTION"}

            {product.gender &&
              ` · ${product.gender}`}
          </div>

          <h1>
            {product.name}
          </h1>

          {/* PRICE */}

          <div className="product-details-price">

            <strong>
              {money(price)}
            </strong>

            {oldPrice > price && (
              <del>
                {money(oldPrice)}
              </del>
            )}

            {discount > 0 && (
              <span>
                SAVE {discount}%
              </span>
            )}

          </div>

          {/* DESCRIPTION */}

          {product.description && (
            <p className="product-details-description">
              {product.description}
            </p>
          )}

          {/* PRODUCT META */}

          <div className="product-specifications">

            <div>
              <span>SIZE</span>
              <strong>
                {product.size || "ONE SIZE"}
              </strong>
            </div>

            {product.color && (
              <div>
                <span>COLOR</span>
                <strong>
                  {product.color}
                </strong>
              </div>
            )}

            {product.fit && (
              <div>
                <span>FIT</span>
                <strong>
                  {product.fit}
                </strong>
              </div>
            )}

            <div>
              <span>AVAILABILITY</span>

              <strong
                className={
                  stock > 0
                    ? "available"
                    : "unavailable"
                }
              >
                {stock > 0
                  ? `${stock} IN STOCK`
                  : "SOLD OUT"}
              </strong>

            </div>

          </div>

          {/* =================================================
              QUANTITY
          ================================================= */}

          {stock > 0 && (
            <div className="quantity-section">

              <span>
                QUANTITY
              </span>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>

                <strong>
                  {quantity}
                </strong>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    quantity >= stock
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="product-details-actions">

            <button
              type="button"
              className={`product-details-add ${
                added ? "added" : ""
              }`}
              disabled={stock < 1}
              onClick={handleAddToBag}
            >

              {stock < 1 ? (
                "SOLD OUT"
              ) : added ? (
                <>
                  ADDED TO BAG
                  <Check size={18} />
                </>
              ) : (
                <>
                  ADD TO BAG
                  <ArrowRight size={18} />
                </>
              )}

            </button>

            <button
              type="button"
              className="product-details-buy"
              disabled={stock < 1}
              onClick={handleBuyNow}
            >
              BUY IT NOW
            </button>

            <button
              type="button"
              className={`product-details-wishlist ${
                isWishlisted
                  ? "wishlisted"
                  : ""
              }`}
              onClick={handleWishlist}
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

          {/* =================================================
              SERVICE INFO
          ================================================= */}

          <div className="product-service-info">

            <div className="service-item">

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

            <div className="service-item">

              <ShieldCheck size={20} />

              <div>
                <strong>
                  QUALITY GUARANTEED
                </strong>

                <span>
                  Every piece checked
                </span>
              </div>

            </div>

            <div className="service-item">

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

      {/* =================================================
          PRODUCT INFORMATION
      ================================================= */}

      <section className="product-information">

        <div className="product-information-heading">

          <span>
            THE OFF GRID / DETAILS
          </span>

          <h2>
            BUILT FOR
            <br />
            <em>YOUR EVERYDAY.</em>
          </h2>

        </div>

        <div className="product-information-text">

          <p>
            {product.description ||
              "Designed with a focus on clean silhouettes, strong details and everyday comfort."}
          </p>

          <p>
            The Off Grid pieces are designed
            to be worn your way. Simple,
            versatile and made for repeat wear.
          </p>

        </div>

      </section>

      {/* =================================================
          PRODUCT DATA
      ================================================= */}

      <section className="product-data">

        <div>

          <span>
            CATEGORY
          </span>

          <strong>
            {product.category ||
              "COLLECTION"}
          </strong>

        </div>

        <div>

          <span>
            GENDER
          </span>

          <strong>
            {product.gender ||
              "UNISEX"}
          </strong>

        </div>

        <div>

          <span>
            COLOR
          </span>

          <strong>
            {product.color ||
              "STANDARD"}
          </strong>

        </div>

        <div>

          <span>
            FIT
          </span>

          <strong>
            {product.fit ||
              "REGULAR"}
          </strong>

        </div>

      </section>

      {/* =================================================
          BACK TO SHOP
      ================================================= */}

      <div className="product-details-bottom">

        <Link
          to="/"
          className="product-back-shop"
        >
          <ArrowLeft size={17} />
          CONTINUE SHOPPING
        </Link>

      </div>

    </main>
  );
}
