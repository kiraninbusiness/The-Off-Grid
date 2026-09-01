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

import SizeGuideModal from "../components/SizeGuideModal";
import ProductReviews from "../components/ProductReviews";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;


/* =========================================================
   THE OFF GRID — 12 PRODUCTS
========================================================= */

const PRODUCTS = [
  {
    id: 1,
    name: "ZENITH OVERSIZED TEE",
    price: 1599,
    old_price: 1999,
    category: "T-SHIRTS",
    gender: "UNISEX",
    color: "CHARCOAL",
    size: "S / M / L / XL",
    fit: "OVERSIZED",
    condition: "NEW",
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90",
    description:
      "Heavyweight oversized cotton tee designed for everyday wear.",
  },

  {
    id: 2,
    name: "LUNA LINEN SHIRT",
    price: 2499,
    old_price: 2999,
    category: "SHIRTS",
    gender: "UNISEX",
    color: "OFF WHITE",
    size: "S / M / L / XL",
    fit: "RELAXED",
    condition: "NEW",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=90",
    description:
      "Relaxed linen shirt with a clean silhouette and lightweight feel.",
  },

  {
    id: 3,
    name: "TERRA CARGO PANTS",
    price: 2799,
    old_price: 3299,
    category: "BOTTOMS",
    gender: "UNISEX",
    color: "OLIVE",
    size: "28 / 30 / 32 / 34 / 36",
    fit: "RELAXED",
    condition: "NEW",
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=90",
    description:
      "Utility-inspired cargo pants with a relaxed streetwear fit.",
  },

  {
    id: 4,
    name: "SIGNATURE HOODIE",
    price: 3299,
    old_price: 3999,
    category: "HOODIES",
    gender: "UNISEX",
    color: "BONE",
    size: "S / M / L / XL",
    fit: "OVERSIZED",
    condition: "BESTSELLER",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90",
    description:
      "Premium heavyweight hoodie with an oversized silhouette.",
  },

  {
    id: 5,
    name: "RAYON BOMBER JACKET",
    price: 3999,
    old_price: 4999,
    category: "JACKETS",
    gender: "UNISEX",
    color: "BLACK",
    size: "S / M / L / XL",
    fit: "REGULAR",
    condition: "NEW",
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=90",
    description:
      "Minimal bomber jacket with a structured modern silhouette.",
  },

  {
    id: 6,
    name: "CLASSIC OFF GRID CAP",
    price: 999,
    old_price: 1299,
    category: "ACCESSORIES",
    gender: "UNISEX",
    color: "BLACK",
    size: "ONE SIZE",
    fit: "ADJUSTABLE",
    condition: "NEW",
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=90",
    description:
      "Minimal six-panel cap finished with The Off Grid branding.",
  },

  {
    id: 7,
    name: "CORE RIBBED TANK",
    price: 1299,
    old_price: 1599,
    category: "TANK TOPS",
    gender: "UNISEX",
    color: "BLACK",
    size: "S / M / L / XL",
    fit: "SLIM",
    condition: "NEW",
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3c990?auto=format&fit=crop&w=1200&q=90",
    description:
      "Clean ribbed tank designed for layering or standalone wear.",
  },

  {
    id: 8,
    name: "GRID RUNNER SNEAKERS",
    price: 4499,
    old_price: 5499,
    category: "FOOTWEAR",
    gender: "UNISEX",
    color: "WHITE / GREY",
    size: "6 / 7 / 8 / 9 / 10 / 11",
    fit: "REGULAR",
    condition: "NEW",
    stock: 9,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90",
    description:
      "Everyday sneakers built around a clean technical streetwear aesthetic.",
  },

  {
    id: 9,
    name: "SHADOW UTILITY VEST",
    price: 2899,
    old_price: 3499,
    category: "JACKETS",
    gender: "UNISEX",
    color: "GRAPHITE",
    size: "S / M / L / XL",
    fit: "RELAXED",
    condition: "NEW",
    stock: 7,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=90",
    description:
      "Utility vest with multiple pockets and a contemporary streetwear cut.",
  },

  {
    id: 10,
    name: "MONOCHROME OVERSHIRT",
    price: 2699,
    old_price: 3199,
    category: "SHIRTS",
    gender: "UNISEX",
    color: "GREY",
    size: "S / M / L / XL",
    fit: "RELAXED",
    condition: "NEW",
    stock: 11,
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90",
    description:
      "Structured overshirt designed to work as a light outer layer.",
  },

  {
    id: 11,
    name: "VOID WIDE LEG DENIM",
    price: 2999,
    old_price: 3699,
    category: "BOTTOMS",
    gender: "UNISEX",
    color: "WASHED BLACK",
    size: "28 / 30 / 32 / 34 / 36",
    fit: "WIDE LEG",
    condition: "NEW",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=90",
    description:
      "Wide-leg denim with a relaxed profile and washed finish.",
  },

  {
    id: 12,
    name: "NIGHT SHIFT TEE",
    price: 1499,
    old_price: 1899,
    category: "T-SHIRTS",
    gender: "UNISEX",
    color: "WASHED BLACK",
    size: "S / M / L / XL",
    fit: "OVERSIZED",
    condition: "BESTSELLER",
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=90",
    description:
      "Relaxed everyday tee with a vintage-inspired washed finish.",
  },
];


/* =========================================================
   PRODUCT DETAILS PAGE
========================================================= */

export default function ProductDetails({
  products = PRODUCTS,
  add,
  wishlist = [],
  toggle,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  /*
   * First use products received from App.
   * If App does not provide products, use the 12
   * local products above.
   */
  const productList =
    Array.isArray(products) && products.length
      ? products
      : PRODUCTS;

  const product = productList.find(
    (item) => String(item.id) === String(id)
  );


  /* =======================================================
     PRODUCT NOT FOUND
  ======================================================= */

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


  /* =======================================================
     PRODUCT CALCULATIONS
  ======================================================= */

  const isWishlisted = wishlist.some(
    (item) =>
      String(item) === String(product.id)
  );

  const discount =
    product.old_price && product.price
      ? Math.round(
          ((Number(product.old_price) -
            Number(product.price)) /
            Number(product.old_price)) *
            100
        )
      : 0;

  const sizes = product.size
    ? String(product.size)
        .split("/")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];


  /* =======================================================
     QUANTITY
  ======================================================= */

  const increaseQty = () => {
    const stock = Number(product.stock || 0);

    if (stock > 0 && qty < stock) {
      setQty((value) => value + 1);
    }
  };

  const decreaseQty = () => {
    setQty((value) =>
      value > 1 ? value - 1 : 1
    );
  };


  /* =======================================================
     ADD TO BAG
  ======================================================= */

  const handleAddToBag = () => {

    if (!product.stock) return;

    /*
     * If product has sizes, require size selection.
     */
    if (
      sizes.length > 0 &&
      !selectedSize
    ) {
      alert("PLEASE SELECT A SIZE");
      return;
    }

    /*
     * Add selected quantity.
     */
    for (let i = 0; i < qty; i++) {
      add?.({
        ...product,
        selectedSize:
          selectedSize || null,
      });
    }

    navigate("/checkout");
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="product-details-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="product-details-header">

        <button
          type="button"
          className="product-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          BACK TO SHOP
        </button>


        <Link
          to="/"
          className="product-details-logo"
        >
          <small>THE</small>

          <strong>
            OFF GRID
          </strong>
        </Link>


        <div className="product-details-header-right">

          <span>
            PRODUCT / {product.id}
          </span>

        </div>

      </header>


      {/* =================================================
          PRODUCT MAIN
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


        {/* PRODUCT INFORMATION */}

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


          {/* PRICE */}

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


          {/* DESCRIPTION */}

          <p className="product-details-description">
            {product.description}
          </p>


          {/* SPECS */}

          <div className="product-details-specs">

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
                CONDITION
              </span>

              <strong>
                {product.condition || "NEW"}
              </strong>

            </div>

          </div>


          {/* =================================================
              SIZE
          ================================================= */}

          {sizes.length > 0 && (

            <div className="product-size-section">

              <div className="product-size-title">

                <span>
                  SELECT SIZE
                </span>

                <button
                  type="button"
                  className="size-guide-trigger"
                  onClick={() =>
                    setSizeGuideOpen(true)
                  }
                >
                  SIZE GUIDE
                </button>

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


          {/* =================================================
              QUANTITY + WISHLIST
          ================================================= */}

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


          {/* =================================================
              ADD TO BAG
          ================================================= */}

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

              {Number(product.stock) <= 5
                ? `ONLY ${product.stock} LEFT`
                : `${product.stock} AVAILABLE`}

            </p>

          )}


          {/* =================================================
              BENEFITS
          ================================================= */}

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
          EXTRA INFORMATION
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
          REVIEWS
      ================================================= */}

      <ProductReviews
        productId={product.id}
      />


      {/* =================================================
          CONTINUE SHOPPING
      ================================================= */}

      <div className="product-details-bottom">

        <button
          type="button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          CONTINUE SHOPPING
        </button>

      </div>


      {/* =================================================
          SIZE GUIDE
      ================================================= */}

      {sizeGuideOpen && (

        <SizeGuideModal
          onClose={() =>
            setSizeGuideOpen(false)
          }
        />

      )}

    </div>
  );
}
