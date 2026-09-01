import React from "react";
import {
  Heart,
  Eye,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductCard({
  p,
  add,
  wish = [],
  toggle,
}) {
  if (!p) return null;

  const isWishlisted = wish.some(
    (id) =>
      String(id) === String(p.id)
  );

  const discount =
    p.old_price && p.price
      ? Math.round(
          ((p.old_price - p.price) /
            p.old_price) *
            100
        )
      : 0;

  return (
    <article className="product-card">

      {/* IMAGE */}

      <div className="product-card-image">

        <Link
          to={`/product/${p.id}`}
          className="product-image-link"
          aria-label={`View ${p.name}`}
        >

          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
          />

        </Link>

        {/* BADGES */}

        <div className="product-card-badges">

          {discount > 0 && (
            <span>
              -{discount}%
            </span>
          )}

          {p.condition && (
            <span>
              {p.condition}
            </span>
          )}

        </div>

        {/* WISHLIST */}

        <button
          type="button"
          className={`product-wishlist ${
            isWishlisted
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggle?.(p.id)
          }
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={19}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* QUICK VIEW */}

        <Link
          to={`/product/${p.id}`}
          className="quick-view"
        >
          <Eye size={15} />
          QUICK VIEW
        </Link>

      </div>

      {/* PRODUCT INFORMATION */}

      <div className="product-card-info">

        <div className="product-card-top">

          <span className="product-card-category">
            {p.category}
            {" · "}
            {p.gender}
          </span>

          <div className="product-card-price">

            <strong>
              {money(p.price)}
            </strong>

            {p.old_price && (
              <del>
                {money(p.old_price)}
              </del>
            )}

          </div>

        </div>

        <Link
          to={`/product/${p.id}`}
          className="product-card-name"
        >
          {p.name}
        </Link>

        <div className="product-card-meta">

          <span>
            {p.size}
          </span>

          <span>
            {p.color}
          </span>

          <span>
            {p.fit}
          </span>

        </div>

        {/* ADD TO BAG */}

        <button
          type="button"
          className="product-add"
          disabled={!p.stock}
          onClick={() =>
            add?.(p)
          }
        >

          <span>
            {p.stock
              ? "ADD TO BAG"
              : "SOLD OUT"}
          </span>

          {p.stock ? (
            <ShoppingBag size={16} />
          ) : (
            <ArrowUpRight size={16} />
          )}

        </button>

      </div>

    </article>
  );
}
