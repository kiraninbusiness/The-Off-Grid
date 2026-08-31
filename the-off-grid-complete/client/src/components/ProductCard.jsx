import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Check, ArrowUpRight } from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductCard({
  p,
  add,
  wish = [],
  toggle
}) {
  const [added, setAdded] = useState(false);

  const stock = Number(p.stock) || 0;
  const price = Number(p.price) || 0;
  const oldPrice = Number(p.old_price) || 0;

  const discount =
    oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  const isWishlisted = wish.includes(p.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

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

    toggle(p.id);
  };

  return (
    <article className="new-product-card">

      {/* PRODUCT IMAGE */}

      <div className="new-product-image-wrap">

        <Link
          to={`/product/${p.id}`}
          className="new-product-image"
        >

          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
          />

          <div className="new-product-image-hover">
            VIEW PRODUCT
            <ArrowUpRight size={17} />
          </div>

        </Link>


        {/* BADGES */}

        <div className="new-product-badges">

          {discount > 0 && stock > 0 && (
            <span className="sale-badge">
              -{discount}%
            </span>
          )}

          {stock < 1 && (
            <span className="sold-badge">
              SOLD OUT
            </span>
          )}

        </div>


        {/* WISHLIST */}

        <button
          type="button"
          className={`new-wishlist ${
            isWishlisted ? "active" : ""
          }`}
          onClick={handleWishlist}
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

      </div>


      {/* PRODUCT INFORMATION */}

      <div className="new-product-info">

        <div className="new-product-top">

          <div>

            <p className="new-product-category">
              {p.category || "COLLECTION"}
            </p>

            <h3>
              <Link to={`/product/${p.id}`}>
                {p.name}
              </Link>
            </h3>

          </div>


          <div className="new-product-price">

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


        {/* DETAILS */}

        <div className="new-product-details">

          {p.size && (
            <span>
              SIZE {p.size}
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


        {/* ADD BUTTON */}

        <button
          type="button"
          className={`new-add-button ${
            added ? "added" : ""
          }`}
          disabled={stock < 1}
          onClick={handleAdd}
        >

          {stock < 1 ? (
            <>
              SOLD OUT
            </>
          ) : added ? (
            <>
              ADDED TO BAG
              <Check size={17} />
            </>
          ) : (
            <>
              ADD TO BAG
              <Plus size={17} />
            </>
          )}

        </button>


        {/* LOW STOCK */}

        {stock > 0 && stock <= 2 && (
          <p className="new-low-stock">
            ONLY {stock} LEFT
          </p>
        )}

      </div>

    </article>
  );
}
