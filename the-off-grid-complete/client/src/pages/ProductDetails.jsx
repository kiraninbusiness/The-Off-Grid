import React, { useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductDetails({
  products = [],
  add,
  wishlist = [],
  toggle,
  setCart
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find(
    (p) => String(p.id) === String(id)
  );

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(
    product?.image || ""
  );

  /* PRODUCT NOT FOUND */

  if (!product) {
    return (
      <main className="product-not-found">

        <div>
          <p className="eyebrow">
            PRODUCT
          </p>

          <h1>
            Product not found.
          </h1>

          <p>
            This piece may have been removed
            or is no longer available.
          </p>

          <Link
            to="/shop"
            className="product-back-button"
          >
            <ArrowLeft size={17} />
            BACK TO SHOP
          </Link>
        </div>

      </main>
    );
  }

  const stock =
    Number(product.stock) || 0;

  const price =
    Number(product.price) || 0;

  const oldPrice =
    Number(product.old_price) || 0;

  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) /
            oldPrice) *
            100
        )
      : 0;

  const isWishlisted =
    wishlist.includes(product.id);

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(
        stock || 1,
        current + 1
      )
    );
  };

  const handleAdd = () => {
    if (stock < 1) return;

    /*
      Add once through the existing App
      cart system, then increase quantity
      if necessary.
    */

    add(product);

    if (quantity > 1 && setCart) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                qty: Math.min(
                  stock,
                  quantity
                )
              }
            : item
        )
      );
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1600);
  };

  return (
    <main className="product-page">

      {/* BACK */}

      <div className="product-page-top">

        <button
          type="button"
          className="product-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          BACK
        </button>

        <span>
          THE OFF GRID / COLLECTION
        </span>

      </div>


      {/* PRODUCT */}

      <section className="product-detail">

        {/* GALLERY */}

        <div className="product-gallery">

          <div className="product-main-image">

            <img
              src={activeImage || product.image}
              alt={product.name}
            />

            {discount > 0 && (
              <span className="detail-sale">
                -{discount}%
              </span>
            )}

            {stock < 1 && (
              <span className="detail-sold">
                SOLD OUT
              </span>
            )}

          </div>


          {/* THUMBNAIL */}

          <div className="product-thumbnails">

            <button
              type="button"
              className={
                activeImage === product.image
                  ? "thumbnail active"
                  : "thumbnail"
              }
              onClick={() =>
                setActiveImage(product.image)
              }
            >
              <img
                src={product.image}
                alt={product.name}
              />
            </button>

          </div>

        </div>


        {/* INFORMATION */}

        <div className="product-details-content">

          <div className="product-detail-heading">

            <p className="eyebrow">
              {product.category || "COLLECTION"}
              {product.gender
                ? ` · ${product.gender}`
                : ""}
            </p>

            <h1>
              {product.name}
            </h1>

            <button
              type="button"
              className={`detail-wishlist ${
                isWishlisted
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                toggle(product.id)
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

          </div>


          {/* PRICE */}

          <div className="detail-price">

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


          {/* AVAILABILITY */}

          <div className="detail-availability">

            <span
              className={
                stock > 0
                  ? "available"
                  : "unavailable"
              }
            />

            {stock > 0
              ? stock <= 2
                ? `ONLY ${stock} LEFT`
                : "IN STOCK"
              : "SOLD OUT"}

          </div>


          {/* DESCRIPTION */}

          {product.description && (
            <div className="detail-description">

              <p>
                {product.description}
              </p>

            </div>
          )}


          {/* PRODUCT ATTRIBUTES */}

          <div className="detail-specifications">

            <div>
              <span>
                SIZE
              </span>

              <strong>
                {product.size || "ONE SIZE"}
              </strong>
            </div>


            {product.color && (
              <div>
                <span>
                  COLOR
                </span>

                <strong>
                  {product.color}
                </strong>
              </div>
            )}


            {product.fit && (
              <div>
                <span>
                  FIT
                </span>

                <strong>
                  {product.fit}
                </strong>
              </div>
            )}


            {product.condition && (
              <div>
                <span>
                  CONDITION
                </span>

                <strong>
                  {product.condition}
                </strong>
              </div>
            )}

          </div>


          {/* PURCHASE */}

          {stock > 0 && (

            <div className="purchase-area">

              <div className="quantity-selector">

                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    quantity <= 1
                  }
                >
                  <Minus size={16} />
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    quantity >= stock
                  }
                >
                  <Plus size={16} />
                </button>

              </div>


              <button
                type="button"
                className={`detail-add-button ${
                  added
                    ? "added"
                    : ""
                }`}
                onClick={handleAdd}
              >

                {added ? (
                  <>
                    ADDED TO BAG
                    <span>✓</span>
                  </>
                ) : (
                  <>
                    ADD TO BAG
                    <ShoppingBag size={18} />
                  </>
                )}

              </button>

            </div>

          )}


          {stock < 1 && (
            <button
              type="button"
              className="detail-sold-button"
              disabled
            >
              SOLD OUT
            </button>
          )}


          {/* SHOPPING INFORMATION */}

          <div className="detail-information">

            <div className="detail-info-row">

              <span>
                SHIPPING
              </span>

              <p>
                Fast delivery across India.
              </p>

            </div>


            <div className="detail-info-row">

              <span>
                PACKAGING
              </span>

              <p>
                Carefully packed before dispatch.
              </p>

            </div>


            <div className="detail-info-row">

              <span>
                SUPPORT
              </span>

              <p>
                Need help? Contact us anytime.
              </p>

            </div>

          </div>


          {/* CONTINUE SHOPPING */}

          <Link
            to="/shop"
            className="continue-shopping-link"
          >
            CONTINUE SHOPPING
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>


      {/* LOWER PRODUCT SECTION */}

      <section className="product-bottom-section">

        <div>

          <p className="eyebrow">
            THE OFF GRID
          </p>

          <h2>
            Made to stand
            <br />
            <em>apart.</em>
          </h2>

        </div>


        <div>

          <p>
            Every piece in the collection
            is selected with intention.
            No unnecessary noise, no
            chasing every trend — just
            clothing that deserves a place
            in your wardrobe.
          </p>

          <Link to="/our-story">
            OUR STORY
            <ArrowUpRight size={16} />
          </Link>

        </div>

      </section>

    </main>
  );
}
