import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Eye,
  X,
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductCard({
  p,
  add,
  wish = [],
  toggle,
}) {
  const [added, setAdded] = useState(false);
  const [quickView, setQuickView] = useState(false);

  const stock = Number(p.stock) || 0;
  const price = Number(p.price) || 0;
  const oldPrice = Number(p.old_price) || 0;

  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      : 0;

  const isWishlisted = wish.includes(p.id);

  const handleAdd = () => {
    if (stock < 1) return;

    add(p);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1400);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (toggle) {
      toggle(p.id);
    }
  };

  return (
    <>
      <article
        className={`product-card ${
          stock < 1 ? "sold-out" : ""
        }`}
      >

        {/* ================= IMAGE ================= */}

        <div className="product-image-wrap">

          <Link
            to={`/product/${p.id}`}
            className="product-image"
          >
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
            />
          </Link>

          {/* BADGES */}

          <div className="product-badges">

            {discount > 0 && stock > 0 && (
              <span className="badge sale">
                -{discount}%
              </span>
            )}

            {stock > 0 && (
              <span className="badge">
                {p.condition || "NEW"}
              </span>
            )}

            {stock < 1 && (
              <span className="badge sold">
                SOLD OUT
              </span>
            )}

          </div>

          {/* WISHLIST */}

          <button
            type="button"
            className="wishlist-button"
            onClick={handleWishlist}
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <Heart
              size={19}
              strokeWidth={1.6}
              fill={
                isWishlisted
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          {/* QUICK VIEW */}

          <button
            type="button"
            className="quick-view-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickView(true);
            }}
          >
            <Eye size={16} />
            QUICK VIEW
          </button>

        </div>

        {/* ================= PRODUCT CONTENT ================= */}

        <div className="product-content">

          <div className="product-info">

            <div>

              <p className="product-category">
                {p.category || "COLLECTION"}

                {p.gender
                  ? ` · ${p.gender}`
                  : ""}
              </p>

              <h3>
                <Link
                  to={`/product/${p.id}`}
                >
                  {p.name}
                </Link>
              </h3>

            </div>

            {/* PRICE */}

            <div className="product-price">

              <strong>
                {money(price)}
              </strong>

              {oldPrice > price && (
                <del>
                  {money(oldPrice)}
                </del>
              )}

            </div>

          </div>

          {/* ================= META ================= */}

          <div className="product-meta">

            {p.size && (
              <span>
                {p.size}
              </span>
            )}

            {p.color && (
              <span>
                {p.color}
              </span>
            )}

            {p.fit && (
              <span>
                {p.fit}
              </span>
            )}

          </div>

          {/* ================= ADD TO BAG ================= */}

          <button
            type="button"
            className={`product-add-button ${
              added ? "added" : ""
            }`}
            disabled={stock < 1}
            onClick={handleAdd}
          >

            {stock < 1 ? (
              "SOLD OUT"
            ) : added ? (
              <>
                ADDED TO BAG
                <span>✓</span>
              </>
            ) : (
              <>
                ADD TO BAG
                <ArrowUpRight size={17} />
              </>
            )}

          </button>

        </div>

      </article>

      {/* =====================================================
          QUICK VIEW MODAL
      ===================================================== */}

      {quickView && (

        <div
          className="quick-view-overlay"
          onClick={() =>
            setQuickView(false)
          }
        >

          <div
            className="quick-view-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="quick-view-close"
              onClick={() =>
                setQuickView(false)
              }
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* IMAGE */}

            <div className="quick-view-image">

              <img
                src={p.image}
                alt={p.name}
              />

            </div>

            {/* DETAILS */}

            <div className="quick-view-details">

              <p className="product-category">
                {p.category || "COLLECTION"}

                {p.gender
                  ? ` · ${p.gender}`
                  : ""}
              </p>

              <h2>
                {p.name}
              </h2>

              {/* PRICE */}

              <div className="quick-view-price">

                <strong>
                  {money(price)}
                </strong>

                {oldPrice > price && (
                  <del>
                    {money(oldPrice)}
                  </del>
                )}

              </div>

              {/* DESCRIPTION */}

              {p.description && (
                <p className="quick-view-description">
                  {p.description}
                </p>
              )}

              {/* PRODUCT DETAILS */}

              <div className="quick-view-meta">

                <div>
                  <span>
                    SIZE
                  </span>

                  <strong>
                    {p.size ||
                      "ONE SIZE"}
                  </strong>
                </div>

                {p.color && (
                  <div>
                    <span>
                      COLOR
                    </span>

                    <strong>
                      {p.color}
                    </strong>
                  </div>
                )}

                {p.fit && (
                  <div>
                    <span>
                      FIT
                    </span>

                    <strong>
                      {p.fit}
                    </strong>
                  </div>
                )}

                <div>
                  <span>
                    AVAILABILITY
                  </span>

                  <strong>
                    {stock > 0
                      ? `${stock} AVAILABLE`
                      : "SOLD OUT"}
                  </strong>
                </div>

              </div>

              {/* ADD */}

              <button
                type="button"
                className={`product-add-button ${
                  added ? "added" : ""
                }`}
                disabled={stock < 1}
                onClick={handleAdd}
              >

                {stock < 1
                  ? "SOLD OUT"
                  : added
                  ? "ADDED TO BAG ✓"
                  : "ADD TO BAG"}

              </button>

              {/* FULL DETAILS */}

              <Link
                to={`/product/${p.id}`}
                className="quick-view-full-link"
                onClick={() =>
                  setQuickView(false)
                }
              >
                VIEW FULL DETAILS
                <ArrowUpRight size={16} />
              </Link>

            </div>

          </div>

        </div>

      )}

    </>
  );
}
