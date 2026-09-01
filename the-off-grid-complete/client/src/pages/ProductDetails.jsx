import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
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

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  /*
   * IMPORTANT:
   * URL gives id as a STRING.
   * Product IDs may be NUMBERS.
   * Convert both to String before comparing.
   */
  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  /* PRODUCT NOT FOUND */
  if (!product) {
    return (
      <div className="product-not-found-page">

        <div className="product-not-found-inner">

          <span>THE OFF GRID</span>

          <h1>
            PRODUCT NOT
            <br />
            FOUND
          </h1>

          <p>
            We couldn't find the product you're
            looking for.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={17} />
            BACK TO SHOP
          </button>

        </div>

      </div>
    );
  }

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

  const sizes = product.size
    ? product.size
        .split("/")
        .map((s) => s.trim())
    : [];

  const increaseQty = () => {
    if (
      product.stock &&
      qty < Number(product.stock)
    ) {
      setQty((value) => value + 1);
    }
  };

  const decreaseQty = () => {
    setQty((value) =>
      value > 1 ? value - 1 : 1
    );
  };

  const handleAddToBag = () => {
    if (!product.stock) return;

    /*
     * Add the product the number of times
     * selected by the customer.
     */
    for (let i = 0; i < qty; i++) {
      add?.(product);
    }

    navigate("/checkout");
  };

  return (
    <div className="product-details-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="product-details-header">

        <Link
          to="/"
          className="product-back"
        >
          <ArrowLeft size={18} />
          BACK TO SHOP
        </Link>

        <Link
          to="/"
          className="product-details-logo"
        >
          <small>THE</small>
          <strong>OFF GRID</strong>
        </Link>

        <div className="product-details-header-right">
          <span>PRODUCT / {product.id}</span>
        </div>

      </header>


      {/* =================================================
          PRODUCT
      ================================================= */}

      <main className="product-details-main">

        {/* IMAGE */}

        <div className="product-details-image">

          <img
            src={product.image}
            alt={product.name}
          />

          <div className="product-details-image-badge">

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

          <div className="product-details-number">
            01 / THE OFF GRID
          </div>

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

          <p className="product-details-description">
            {product.description}
          </p>


          {/* PRODUCT DETAILS */}

          <div className="product-details-specs">

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

              <div className="product-size-title">

                <span>
                  SELECT SIZE
                </span>

                <span>
                  SIZE GUIDE
                </span>

              </div>

              <div className="product-size-buttons">

                {sizes.map((size) => (

                  <button
                    key={size}
                    type="button"
                    className={
                      selectedSize === size
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedSize(size)
                    }
                  >
                    {size}
                  </button>

                ))}

              </div>

            </div>
          )}


          {/* QUANTITY + WISHLIST */}

          <div className="product-buy-row">

            <div className="product-quantity">

              <button
                type="button"
                onClick={decreaseQty}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>

              <span>
                {qty}
              </span>

              <button
                type="button"
                onClick={increaseQty}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>

            </div>

            <button
              type="button"
              className={`product-detail-wishlist ${
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
                size={20}
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

          </div>


          {/* ADD TO BAG */}

          <button
            type="button"
            className="product-detail-add"
            disabled={!product.stock}
            onClick={handleAddToBag}
          >

            <span>
              {product.stock
                ? "ADD TO BAG"
                : "SOLD OUT"}
            </span>

            {product.stock ? (
              <ShoppingBag size={19} />
            ) : (
              <ArrowRight size={19} />
            )}

          </button>


          {/* STOCK */}

          {product.stock > 0 && (
            <p className="product-stock">

              {product.stock <= 5
                ? `ONLY ${product.stock} LEFT`
                : `${product.stock} AVAILABLE`}

            </p>
          )}


          {/* BENEFITS */}

          <div className="product-benefits">

            <div>

              <Truck size={20} />

              <div>
                <strong>
                  FAST SHIPPING
                </strong>

                <span>
                  Across India
                </span>
              </div>

            </div>


            <div>

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


            <div>

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

      </main>


      {/* =================================================
          LOWER PRODUCT INFORMATION
      ================================================= */}

      <section className="product-details-extra">

        <div>

          <span>
            THE OFF GRID / DETAILS
          </span>

          <h2>
            BUILT FOR
            <br />
            <em>REPEAT WEAR.</em>
          </h2>

        </div>

        <div>

          <p>
            {product.description}
          </p>

          <p>
            Designed with a focus on clean
            silhouettes, everyday comfort and
            effortless styling.
          </p>

        </div>

      </section>


      {/* =================================================
          BACK
      ================================================= */}

      <div className="product-details-bottom">

        <Link to="/">
          <ArrowLeft size={17} />
          CONTINUE SHOPPING
        </Link>

      </div>

    </div>
  );
}
