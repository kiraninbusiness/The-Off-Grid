import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Eye,
  X,
  Check,
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* =========================================================
   PRODUCT CARD (grid tile)
   Props: p (product), add, wish (wishlist ids), toggle
========================================================= */

export default function ProductCard({
  p,
  add,
  wish = [],
  toggle,
}) {
  const [added, setAdded] = useState(false);
  const [quickView, setQuickView] = useState(false);

  const isWishlisted = wish.some(
    (item) => String(item) === String(p.id)
  );

  const discount =
    p.old_price && p.price
      ? Math.round(
          ((p.old_price - p.price) / p.old_price) * 100
        )
      : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!p.stock) return;

    add?.(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div className="product-card">

        <div className="product-image-wrap">

          <Link to={`/product/${p.id}`} className="product-image">
            <img src={p.image} alt={p.name} loading="lazy" />
          </Link>

          <div className="product-badges">
            {discount > 0 && (
              <span className="badge sale">-{discount}%</span>
            )}
            {!p.stock && (
              <span className="badge sold">SOLD OUT</span>
            )}
          </div>

          <button
            type="button"
            className={`wishlist-button ${isWishlisted ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              toggle?.(p.id);
            }}
            aria-label="Toggle wishlist"
          >
            <Heart
              size={17}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>

          <button
            type="button"
            className="quick-view-button"
            onClick={(e) => {
              e.preventDefault();
              setQuickView(true);
            }}
          >
            <Eye size={14} />
            QUICK VIEW
          </button>

        </div>

        <div className="product-content">

          <div className="product-info">

            <div>
              <div className="product-category">
                {p.category}
                {p.gender ? ` · ${p.gender}` : ""}
              </div>

              <h3>
                <Link to={`/product/${p.id}`}>{p.name}</Link>
              </h3>
            </div>

            <div className="product-price">
              <strong>{money(p.price)}</strong>
              {p.old_price && <del>{money(p.old_price)}</del>}
            </div>

          </div>

          {(p.color || p.fit || p.size) && (
            <div className="product-meta">
              {p.color && <span>{p.color}</span>}
              {p.fit && <span>{p.fit}</span>}
              {p.size && <span>{p.size}</span>}
            </div>
          )}

          <button
            type="button"
            className={`product-add-button ${added ? "added" : ""}`}
            disabled={!p.stock}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <Check size={15} />
                ADDED
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                {p.stock ? "ADD TO BAG" : "SOLD OUT"}
              </>
            )}
          </button>

        </div>

      </div>

      {quickView && (
        <QuickViewModal
          product={p}
          isWishlisted={isWishlisted}
          onClose={() => setQuickView(false)}
          onAdd={add}
          onToggleWishlist={toggle}
        />
      )}
    </>
  );
}

/* =========================================================
   QUICK VIEW MODAL
========================================================= */

function QuickViewModal({
  product,
  isWishlisted,
  onClose,
  onAdd,
  onToggleWishlist,
}) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const discount =
    product.old_price && product.price
      ? Math.round(
          ((product.old_price - product.price) / product.old_price) * 100
        )
      : 0;

  const handleAdd = () => {
    if (!product.stock) return;
    onAdd?.(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="quick-view-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="quick-view-modal">

        <button
          type="button"
          className="quick-view-close"
          onClick={onClose}
          aria-label="Close quick view"
        >
          <X size={18} />
        </button>

        <div className="quick-view-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="quick-view-details">

          <div className="product-category">
            {product.category}
            {product.gender ? ` · ${product.gender}` : ""}
          </div>

          <h2>{product.name}</h2>

          <div className="quick-view-price">
            <strong>{money(product.price)}</strong>
            {product.old_price && <del>{money(product.old_price)}</del>}
            {discount > 0 && <span>SAVE {discount}%</span>}
          </div>

          <p className="quick-view-description">
            {product.description ||
              "Designed with a focus on clean silhouettes, everyday comfort and effortless styling."}
          </p>

          <div className="quick-view-meta">
            <div>
              <span>COLOR</span>
              <strong>{product.color || "—"}</strong>
            </div>
            <div>
              <span>FIT</span>
              <strong>{product.fit || "—"}</strong>
            </div>
            <div>
              <span>SIZE</span>
              <strong>{product.size || "—"}</strong>
            </div>
            <div>
              <span>CONDITION</span>
              <strong>{product.condition || "NEW"}</strong>
            </div>
          </div>

          <div className="quick-view-actions">
            <button
              type="button"
              className={`product-add-button ${added ? "added" : ""}`}
              disabled={!product.stock}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <Check size={15} />
                  ADDED
                </>
              ) : (
                <>
                  <ShoppingBag size={15} />
                  {product.stock ? "ADD TO BAG" : "SOLD OUT"}
                </>
              )}
            </button>

            <button
              type="button"
              className={`product-detail-wishlist ${isWishlisted ? "wishlisted" : ""}`}
              onClick={() => onToggleWishlist?.(product.id)}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          <button
            type="button"
            className="quick-view-full-link"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            VIEW FULL DETAILS
          </button>

        </div>

      </div>
    </div>
  );
}
