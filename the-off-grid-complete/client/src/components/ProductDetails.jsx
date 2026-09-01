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
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductDetails({
  products = [],
  add,
  wishlist = [],
  toggle,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  /*
    App.jsx currently displays ProductDetails conditionally
    when the URL starts with /product/.

    Therefore we read the product ID directly from the URL.
    This avoids the previous useParams() problem.
  */
  const id = location.pathname.split("/")[2];

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = useMemo(() => {
    return products.find(
      (item) => String(item.id) === String(id)
    );
  }, [products, id]);

  /*
    PRODUCT NOT FOUND
  */

  if (!product) {
    return (
      <main className="product-not-found-page">
        <div className="product-not-found-content">

          <span className="product-detail-eyebrow">
            404 / PRODUCT
          </span>

          <h1>
            PRODUCT
            <br />
            <em>NOT FOUND.</em>
          </h1>

          <p>
            The product you're looking for doesn't
            exist or may have been removed.
          </p>

          <Link
            to="/"
            className="product-not-found-button"
          >
            BACK TO SHOP
            <ArrowRight size={18} />
          </Link>

        </div>
      </main>
    );
  }

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

  /*
    QUANTITY
  */

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

  /*
    ADD TO BAG
  */

  const handleAddToBag = () => {
    if (stock < 1 || !add) return;

    for (let i = 0; i < quantity; i++) {
      add(product);
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  /*
    BUY NOW
  */

  const handleBuyNow = () => {
    if (stock < 1 || !add) return;

    for (let i = 0; i < quantity; i++) {
      add(product);
    }

    navigate("/checkout");
  };

  /*
    WISHLIST
  */

  const handleWishlist = () => {
    if (toggle) {
      toggle(product.id);
    }
  };

  return (
    <main className="product-detail-page">

      {/* TOP BAR */}

      <div className="product-detail-top">

        <button
          type="button"
          className="product-detail-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          BACK
        </button>

        <Link
          to="/"
          className="product-detail-logo"
        >
          <small>THE</small>
          <strong>OFF GRID</strong>
        </Link>

        <span className="product-detail-code">
          PRODUCT / {String(product.id).padStart(3, "0")}
        </span>

      </div>

      {/* MAIN PRODUCT */}

      <section className="product-detail-main">

        {/* IMAGE */}

        <div className="product-detail-image">

          <img
            src={product.image}
            alt={product.name}
          />

          <div className="product-detail-badges">

            {discount > 0 && (
              <span className="product-badge sale">
                -{discount}%
              </span>
            )}

            {product.condition && (
              <span className="product-badge">
                {product.condition}
              </span>
            )}

            {stock < 1 && (
              <span className="product-badge sold">
                SOLD OUT
              </span>
            )}

          </div>

          <div className="product-image-number">
            001 / THE OFF GRID
          </div>

        </div>

        {/* INFORMATION */}

        <div className="product-detail-content">

          <div className="product-detail-category">
            {product.category || "COLLECTION"}
            {product.gender
              ? ` · ${product.gender}`
              : ""}
          </div>

          <h1>
            {product.name}
          </h1>

          {/* PRICE */}

          <div className="product-detail-price">

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

          <p className="product-detail-description">
            {product.description ||
              "Designed for everyday wear with clean silhouettes, strong details and a distinctly Off Grid attitude."}
          </p>

          {/* PRODUCT DETAILS */}

          <div className="product-detail-specs">

            <div>
              <span>SIZE</span>
              <strong>
                {product.size || "ONE SIZE"}
              </strong>
            </div>

            <div>
              <span>COLOR</span>
              <strong>
                {product.color || "STANDARD"}
              </strong>
            </div>

            <div>
              <span>FIT</span>
              <strong>
                {product.fit || "REGULAR"}
              </strong>
            </div>

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

          {/* QUANTITY */}

          {stock > 0 && (
            <div className="product-detail-quantity">

              <span>QUANTITY</span>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <strong>
                  {quantity}
                </strong>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= stock}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>

              </div>

            </div>
          )}

          {/* ACTIONS */}

          <div className="product-detail-actions">

            <button
              type="button"
              className={`product-detail-add ${
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
              className="product-detail-buy"
              disabled={stock < 1}
              onClick={handleBuyNow}
            >
              BUY IT NOW
            </button>

            <button
              type="button"
              className={`product-detail-wishlist ${
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

          {/* SERVICE INFORMATION */}

          <div className="product-service-grid">

            <div className="product-service">

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

            <div className="product-service">

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

            <div className="product-service">

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

      {/* PRODUCT STORY */}

      <section className="product-story">

        <div className="product-story-heading">

          <span>
            THE OFF GRID / DETAILS
          </span>

          <h2>
            BUILT FOR
            <br />
            <em>YOUR EVERYDAY.</em>
          </h2>

        </div>

        <div className="product-story-text">

          <p>
            {product.description ||
              "Clean silhouettes. Strong details. Zero unnecessary rules."}
          </p>

          <p>
            The Off Grid pieces are designed
            to work beyond trends. Wear them
            your way, layer them your way and
            make them part of your everyday.
          </p>

        </div>

      </section>

      {/* PRODUCT DATA */}

      <section className="product-data-grid">

        <div>
          <span>CATEGORY</span>
          <strong>
            {product.category || "COLLECTION"}
          </strong>
        </div>

        <div>
          <span>GENDER</span>
          <strong>
            {product.gender || "UNISEX"}
          </strong>
        </div>

        <div>
          <span>COLOR</span>
          <strong>
            {product.color || "STANDARD"}
          </strong>
        </div>

        <div>
          <span>FIT</span>
          <strong>
            {product.fit || "REGULAR"}
          </strong>
        </div>

      </section>

      {/* BACK TO SHOP */}

      <section className="product-detail-bottom">

        <Link
          to="/"
          className="product-back-shop"
        >
          <ArrowLeft size={17} />
          CONTINUE SHOPPING
        </Link>

      </section>

    </main>
  );
}
