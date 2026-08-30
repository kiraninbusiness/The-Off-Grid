import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default
function Card({
  p,
  add,
  wish,
  toggle
}) {

  const [added, setAdded] =
    useState(false);

  const stock =
    Number(p.stock) || 0;

  const price =
    Number(p.price) || 0;

  const oldPrice =
    Number(p.old_price) || 0;


  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) /
            oldPrice) *
            100
        )
      : 0;


  /*
    If your backend has a created_at field,
    that will be used to determine newness.
    Otherwise IDs are used as fallback.
  */

  const isNew =
    p.created_at
      ? (
          Date.now() -
            new Date(
              p.created_at
            ).getTime()
        ) <
        1000 *
          60 *
          60 *
          24 *
          14
      : Number(p.id) >= 1;


  const isWishlisted =
    wish.includes(p.id);


  const handleAdd = () => {

    if (stock < 1) return;

    add(p);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };


  return (

    <article
      className={`product premium-product ${
        stock < 1
          ? "product-sold-out"
          : ""
      }`}
    >

      {/* IMAGE */}

      <Link
        to={`/product/${p.id}`}
        className="photo premium-product-photo"
      >

        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
        />


        {/* PRODUCT NUMBER */}

        <div className="product-number">
          {String(p.id).padStart(2, "0")}
        </div>


        {/* BADGES */}

        <div className="product-badges">

          {discount > 0 &&
            stock > 0 && (
              <span className="product-sale-badge">
                -{discount}%
              </span>
            )}

          {isNew &&
            stock > 0 && (
              <span className="product-new-badge">
                NEW
              </span>
            )}

        </div>


        {/* WISHLIST */}

        <button
          type="button"
          className="product-heart"
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          onClick={(e) => {

            e.preventDefault();
            e.stopPropagation();

            toggle(p.id);

          }}
        >

          <Heart
            size={18}
            strokeWidth={1.5}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />

        </button>


        {/* TAG */}

        <span className="product-condition">

          {stock < 1
            ? "SOLD OUT"
            : p.condition ||
              "NEW"}

        </span>

      </Link>


      {/* PRODUCT INFO */}

      <div className="info premium-product-info">

        <div>

          <small>

            {p.category}

            {p.gender
              ? ` · ${p.gender}`
              : ""}

            {p.size
              ? ` · ${p.size}`
              : ""}

          </small>


          <h3>

            <Link
              to={`/product/${p.id}`}
            >
              {p.name}
            </Link>

          </h3>

        </div>


        {/* PRICE */}

        <strong className="product-price">

          {money(price)}

          {oldPrice > price && (
            <del>
              {money(oldPrice)}
            </del>
          )}

        </strong>

      </div>


      {/* LOW STOCK */}

      {stock > 0 &&
        stock <= 2 && (

          <p className="low-stock-message">

            Only {stock}{" "}
            {stock === 1
              ? "left"
              : "left"}

          </p>

        )}


      {/* ADD TO BAG */}

      <button
        type="button"
        className={`add premium-add ${
          added
            ? "added-to-bag"
            : ""
        }`}
        onClick={handleAdd}
        disabled={stock < 1}
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
            <ArrowRight size={15} />
          </>

        )}

      </button>

    </article>
  );
}
