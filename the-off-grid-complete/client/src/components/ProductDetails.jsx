import React, { useMemo, useState } from "react";
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
  const [selectedSize, setSelectedSize] = useState("");

  /*
   * IMPORTANT:
   * Convert both URL ID and product ID to strings.
   * This prevents the "Product not found" problem
   * caused by number/string mismatch.
   */
  const product = useMemo(() => {
    return products.find(
      (item) => String(item.id) === String(id)
    );
  }, [products, id]);

  if (!product) {
    return (
      <main className="page product-page">
        <div className="product-not-found">

          <span className="eyebrow">
            THE OFF GRID
          </span>

          <h1>
            PRODUCT
            <br />
            NOT FOUND.
          </h1>

          <p>
            The product you're looking for
            doesn't exist or may have been removed.
          </p>

          <Link
            to="/"
            className="primary-button"
          >
            <ArrowLeft size={17} />
            BACK TO SHOP
          </Link>

        </div>
      </main>
    );
  }

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

  const handleAddToCart = () => {
    if (
      sizes.length > 0 &&
      !selectedSize
    ) {
      document
        .getElementById("size-selector")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

      return;
    }

    for (let i = 0; i < quantity; i++) {
      add?.({
        ...product,
        selectedSize:
          selectedSize || sizes[0] || "",
      });
    }
  };

  const increaseQuantity = () => {
    if (
      product.stock &&
      quantity >= product.stock
    ) {
      return;
    }

    setQuantity((value) => value + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((value) =>
      Math.max(1, value - 1)
    );
  };

  return (
    <main className="page product-page">

      {/* HEADER */}

      <div className="product-topbar">

        <Link
          to="/"
          className="back-link"
        >
          <ArrowLeft size={17} />
          BACK TO SHOP
        </Link>

        <span>
          THE OFF GRID / PRODUCT
        </span>

      </div>

      {/* PRODUCT */}

      <div className="product-detail">

        {/* IMAGE */}

        <div className="product-detail-image">

          <div className="product-badges">

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
            aria-label="Wishlist"
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

          <img
            src={product.image}
            alt={product.name}
          />

        </div>

        {/* INFORMATION */}

        <div className="product-detail-info">

          <span className="product-category">
            {product.category}
            {" · "}
            {product.gender}
          </span>

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

          <p className="product-description">
            {product.description}
          </p>

          {/* PRODUCT DETAILS */}

          <div className="product-meta">

            <div>
              <span>
                COLOR
              </span>

              <strong>
                {product.color || "—"}
              </strong>
            </div>

            <div>
              <span>
                FIT
              </span>

              <strong>
                {product.fit || "—"}
              </strong>
            </div>

            <div>
              <span>
                AVAILABILITY
              </span>

              <strong>
                {product.stock > 0
                  ? `${product.stock} IN STOCK`
                  : "OUT OF STOCK"}
              </strong>
            </div>

          </div>

          {/* SIZE */}

          {sizes.length > 0 && (
            <div
              className="product-size"
              id="size-selector"
            >

              <div className="product-option-heading">

                <span>
                  SELECT SIZE
                </span>

                {selectedSize && (
                  <strong>
                    {selectedSize}
                  </strong>
                )}

              </div>

              <div className="size-options">

                {sizes.map((size) => (

                  <button
                    type="button"
                    key={size}
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

          {/* QUANTITY */}

          <div className="product-quantity">

            <span>
              QUANTITY
            </span>

            <div>

              <button
                type="button"
                onClick={decreaseQuantity}
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
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>

            </div>

          </div>

          {/* ADD TO CART */}

          <button
            type="button"
            className="product-add-button"
            disabled={!product.stock}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={19} />

            {product.stock
              ? "ADD TO BAG"
              : "SOLD OUT"}

            <ArrowRight size={17} />
          </button>

          {/* BUY NOW */}

          <button
            type="button"
            className="product-buy-button"
            disabled={!product.stock}
            onClick={() => {
              handleAddToCart();

              if (
                !sizes.length ||
                selectedSize
              ) {
                navigate("/checkout");
              }
            }}
          >
            BUY NOW
          </button>

          {/* SERVICE FEATURES */}

          <div className="product-features">

            <div>

              <Truck size={21} />

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

              <ShieldCheck size={21} />

              <div>
                <strong>
                  QUALITY CHECKED
                </strong>

                <span>
                  Every piece inspected
                </span>
              </div>

            </div>

            <div>

              <RotateCcw size={21} />

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

          {/* PRODUCT INFO */}

          <div className="product-extra">

            <details open>

              <summary>
                PRODUCT DETAILS
                <Plus size={17} />
              </summary>

              <p>
                {product.description}
              </p>

              <ul>
                <li>
                  Category: {product.category}
                </li>

                <li>
                  Gender: {product.gender}
                </li>

                <li>
                  Color: {product.color}
                </li>

                <li>
                  Fit: {product.fit}
                </li>
              </ul>

            </details>

            <details>

              <summary>
                SHIPPING & RETURNS
                <Plus size={17} />
              </summary>

              <p>
                Fast shipping across India.
                Returns are handled through
                our simple and transparent
                return process.
              </p>

            </details>

          </div>

          {/* SKU */}

          <div className="product-sku">

            <span>
              PRODUCT
            </span>

            <strong>
              OG-{String(product.id).padStart(3, "0")}
            </strong>

          </div>

        </div>

      </div>

      {/* BACK */}

      <div className="product-bottom-nav">

        <Link
          to="/"
          className="under-btn"
        >
          <ArrowLeft size={15} />
          CONTINUE SHOPPING
        </Link>

        <span>
          THE OFF GRID / 2026
        </span>

      </div>

    </main>
  );
}
