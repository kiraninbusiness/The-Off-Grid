import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Instagram,
  Youtube,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  User,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";

import ProductCard from "./components/ProductCard";
import SizeGuideModal from "./components/SizeGuideModal";
import ProductReviews from "./components/ProductReviews";

import Checkout from "./pages/Checkout";
import Order from "./pages/Orders";
import Success from "./pages/Success";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import TrackOrder from "./pages/TrackOrder";

import { api } from "./api";

import "./styles.css";


/* =========================================================
   THE OFF GRID — PRODUCTS
   FALLBACK_PRODUCTS is shown only if the live /products API
   can't be reached, so the shop is never fully empty.
========================================================= */

const FALLBACK_PRODUCTS = [
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
   APP
========================================================= */

export default function App() {

  const location = useLocation();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api("/products")
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) {
          setProducts(data);
        }
      })
      .catch(() => {
        // API unreachable — keep FALLBACK_PRODUCTS so the shop isn't empty
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("thrift_user")) || null;
    } catch {
      return null;
    }
  });

  const [activeCategory, setActiveCategory] =
    useState("ALL");

  const [sortBy, setSortBy] =
    useState("FEATURED");

  const [newsletterEmail, setNewsletterEmail] =
    useState("");

  const [newsletterStatus, setNewsletterStatus] =
    useState("idle"); // idle | loading | success | error


  /* =======================================================
     CART
  ======================================================= */

  const addCart = (product) => {

    setCart((current) => {

      const existing = current.find(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

      if (existing) {

        return current.map((item) =>
          String(item.id) ===
          String(product.id)
            ? {
                ...item,
                qty:
                  Number(item.qty || 1) + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          qty: 1,
        },
      ];
    });
  };


  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart = () => {
    setCart([]);
  };


  /* =======================================================
     WISHLIST
  ======================================================= */

  const toggleWishlist = (id) => {

    setWishlist((current) => {

      const exists = current.some(
        (item) =>
          String(item) === String(id)
      );

      if (exists) {

        return current.filter(
          (item) =>
            String(item) !== String(id)
        );
      }

      return [...current, id];
    });
  };


  /* =======================================================
     NEWSLETTER
  ======================================================= */

  const handleNewsletterSubmit = async (e) => {

    e.preventDefault();

    if (!newsletterEmail.trim()) return;

    setNewsletterStatus("loading");

    try {

      await api("/newsletter", {
        method: "POST",
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });

      setNewsletterStatus("success");
      setNewsletterEmail("");

    } catch (err) {

      setNewsletterStatus("error");
    }
  };


  /* =======================================================
     SCROLL
  ======================================================= */

  const scroll = (id) => {

    setMenu(false);

    setTimeout(() => {

      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

    }, 50);
  };


  /* =======================================================
     SPECIAL ROUTES
  ======================================================= */

  if (location.pathname === "/checkout") {

    return (
      <Checkout
        cart={cart}
        clearCart={clearCart}
      />
    );
  }


  if (
    location.pathname === "/order" ||
    location.pathname === "/orders"
  ) {

    return <Order />;
  }


  if (
    location.pathname === "/order-success" ||
    location.pathname === "/success"
  ) {

    return <Success />;
  }


  if (location.pathname === "/account") {

    return (
      <Account
        user={user}
        setUser={setUser}
      />
    );
  }


  if (location.pathname === "/wishlist") {

    return (
      <Wishlist
        products={products}
        wishlist={wishlist}
        toggle={toggleWishlist}
        add={addCart}
      />
    );
  }


  if (location.pathname.startsWith("/track-order/")) {

    return <TrackOrder user={user} />;
  }


  /* =======================================================
     PRODUCT DETAIL ROUTE

     IMPORTANT:
     Product is found DIRECTLY from the SAME products
     array used by the shop.

     No ProductDetails.jsx.
     No props.
     No second product array.
  ======================================================= */

if (location.pathname.startsWith("/product/")) {

  const rawId =
    location.pathname
      .split("/product/")[1]
      ?.split("/")[0];

  /*
   * IMPORTANT:
   * Wait for the live products API to finish before
   * deciding that a product does not exist.
   *
   * This prevents:
   * PRODUCT NOT FOUND
   * appearing temporarily while products are loading.
   */

  if (productsLoading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ebe7dd",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "3px",
              marginBottom: "18px",
            }}
          >
            THE OFF GRID
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "-1px",
            }}
          >
            LOADING PRODUCT
          </div>

          <div
            style={{
              marginTop: "18px",
              fontSize: "11px",
              letterSpacing: "2px",
              opacity: 0.55,
            }}
          >
            PLEASE WAIT
          </div>
        </div>
      </div>
    );
  }

  /*
   * API has finished loading.
   * Now safely search the live products array.
   */

  const product = products.find(
    (item) =>
      String(item.id) ===
      String(rawId)
  );


  /*
   * Only show PRODUCT NOT FOUND after
   * the API has finished loading.
   */

  if (!product) {

    return (
      <ProductNotFound
        onBack={() => navigate("/")}
      />
    );
  }


  return (
    <ProductPage
      product={product}
      add={addCart}
      wishlist={wishlist}
      toggle={toggleWishlist}
      cart={cart}
    />
  );
}

  /* =======================================================
     FILTER / SEARCH / SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {

    let result = [...products];


    if (activeCategory !== "ALL") {

      result = result.filter(
        (product) =>
          product.category ===
          activeCategory
      );
    }


    if (searchText.trim()) {

      const query =
        searchText
          .toLowerCase()
          .trim();

      result = result.filter(
        (product) =>
          [
            product.name,
            product.category,
            product.gender,
            product.color,
            product.fit,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }


    if (sortBy === "PRICE LOW") {

      result.sort(
        (a, b) =>
          a.price - b.price
      );
    }


    if (sortBy === "PRICE HIGH") {

      result.sort(
        (a, b) =>
          b.price - a.price
      );
    }


    if (sortBy === "NAME") {

      result.sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      );
    }


    return result;

  }, [
    activeCategory,
    searchText,
    sortBy,
  ]);


  const categories = [
    "ALL",
    "T-SHIRTS",
    "SHIRTS",
    "HOODIES",
    "BOTTOMS",
    "JACKETS",
    "ACCESSORIES",
    "FOOTWEAR",
  ];


  /* =======================================================
     HOME
  ======================================================= */

  return (

    <div className="app">


      {/* TOPBAR */}

      <div className="topbar">

        <span>
          FREE SHIPPING ON ORDERS ABOVE ₹1,499
        </span>

        <span>
          THE OFF GRID — EST. 2026
        </span>

        <span>
          INDIA / WORLDWIDE
        </span>

      </div>


      {/* NAVBAR */}

      <header className="navbar">

        <button
          className="mobile-menu-btn"
          type="button"
          onClick={() => setMenu(true)}
        >
          <Menu size={23} />
        </button>


        <nav className="nav-left">

          <button
            type="button"
            onClick={() => scroll("shop")}
          >
            SHOP
          </button>

          <button
            type="button"
            onClick={() =>
              scroll("categories")
            }
          >
            CATEGORIES
          </button>

          <button
            type="button"
            onClick={() =>
              scroll("story")
            }
          >
            STORY
          </button>

        </nav>


        <button
          type="button"
          className="logo"
          onClick={() =>
            scroll("home")
          }
        >

          <small>THE</small>

          <strong>
            OFF GRID
          </strong>

        </button>


        <div className="nav-right">

          <button
            type="button"
            onClick={() =>
              setSearchOpen(true)
            }
          >

            <Search size={19} />

            <span>
              SEARCH
            </span>

          </button>


          <button
            type="button"
            onClick={() => navigate("/account")}
          >

            <User size={19} />

          </button>


          <button
            type="button"
            onClick={() => navigate("/wishlist")}
          >

            <Heart size={19} />

            {wishlist.length > 0 && (
              <b>
                {wishlist.length}
              </b>
            )}

          </button>


          <button
            type="button"
            onClick={() =>
              cart.length
                ? navigate("/checkout")
                : scroll("shop")
            }
          >

            <ShoppingBag size={19} />

            {cart.length > 0 && (
              <b>
                {cart.reduce(
                  (total, item) =>
                    total +
                    Number(item.qty || 1),
                  0
                )}
              </b>
            )}

          </button>

        </div>

      </header>


      {/* MOBILE MENU */}

      {menu && (

        <div className="mobile-menu">

          <button
            type="button"
            className="mobile-close"
            onClick={() => setMenu(false)}
          >
            <X size={28} />
          </button>


          <div className="mobile-logo">

            <small>
              THE
            </small>

            <strong>
              OFF GRID
            </strong>

          </div>


          <div className="mobile-links">

            <button
              type="button"
              onClick={() => scroll("shop")}
            >
              SHOP
            </button>

            <button
              type="button"
              onClick={() =>
                scroll("categories")
              }
            >
              CATEGORIES
            </button>

            <button
              type="button"
              onClick={() =>
                scroll("story")
              }
            >
              OUR STORY
            </button>

            <button
              type="button"
              onClick={() =>
                scroll("journal")
              }
            >
              JOURNAL
            </button>

          </div>


          <p>
            NO RULES.
            <br />
            JUST STYLE.
          </p>

        </div>
      )}


      {/* SEARCH */}

      {searchOpen && (

        <div className="search-overlay">

          <button
            type="button"
            className="search-close"
            onClick={() => {
              setSearchOpen(false);
              setSearchText("");
            }}
          >
            <X size={28} />
          </button>


          <div className="search-inner">

            <span>
              SEARCH THE OFF GRID
            </span>


            <div className="big-search">

              <Search size={25} />

              <input
                autoFocus
                type="text"
                value={searchText}
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    setSearchOpen(false);

                    setTimeout(
                      () => scroll("shop"),
                      50
                    );
                  }

                }}
                placeholder="Search products..."
              />

            </div>


            <p>
              TRY "TEE", "HOODIE", "CARGO" OR "JACKET"
            </p>

          </div>

        </div>
      )}


      {/* HERO */}

      <section
        className="hero"
        id="home"
      >

        <img
          src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1800&q=90"
          alt="The Off Grid collection"
        />

        <div className="hero-dark"></div>


        <div className="hero-content">

          <span className="eyebrow">
            THE OFF GRID / 001
          </span>


          <h1>
            WEAR
            <br />
            <i>YOUR</i>
            <br />
            WAY<span>.</span>
          </h1>


          <p>
            Clothing for independent minds.
            <br />
            Clean silhouettes. Strong details.
            <br />
            Zero unnecessary rules.
          </p>


          <div className="hero-buttons">

            <button
              type="button"
              className="orange-btn"
              onClick={() =>
                scroll("shop")
              }
            >
              SHOP NEW ARRIVALS
              <ArrowRight size={18} />
            </button>


            <button
              type="button"
              className="outline-btn"
              onClick={() =>
                scroll("story")
              }
            >
              OUR STORY
            </button>

          </div>

        </div>


        <div className="hero-bottom">

          <span>
            01
          </span>

          <span>
            NOT MADE FOR EVERYONE.
          </span>

        </div>

      </section>


      {/* MARQUEE */}

      <div className="marquee">

        <div>

          NOT MADE FOR EVERYONE
          <span>✦</span>

          MADE FOR YOU
          <span>✦</span>

          OFF THE GRID
          <span>✦</span>

          NEW DROP
          <span>✦</span>

          NOT MADE FOR EVERYONE
          <span>✦</span>

        </div>

      </div>


      {/* STORY */}

      <section
        className="story section"
        id="story"
      >

        <div className="section-number">
          01 / THE OFF GRID
        </div>


        <div className="story-grid">

          <h2>
            NOT MADE
            <br />
            FOR <em>EVERYONE.</em>
          </h2>


          <div>

            <p>
              The Off Grid is an independent
              clothing label built around
              individuality. We believe your
              clothes should reflect your point
              of view — not somebody else's.
            </p>


            <button
              type="button"
              className="under-btn"
              onClick={() =>
                scroll("journal")
              }
            >
              DISCOVER OUR STORY
              <ArrowRight size={15} />
            </button>

          </div>

        </div>


        <div className="benefits">

          <div>
            <strong>01</strong>
            <h3>FAST SHIPPING</h3>
            <p>Across India</p>
          </div>


          <div>
            <strong>02</strong>
            <h3>QUALITY FIRST</h3>
            <p>Every piece checked</p>
          </div>


          <div>
            <strong>03</strong>
            <h3>EASY RETURNS</h3>
            <p>Simple & transparent</p>
          </div>

        </div>

      </section>


      {/* CATEGORIES */}

      <section
        className="categories section"
        id="categories"
      >

        <div className="section-title">

          <div>

            <span>
              EXPLORE
            </span>

            <h2>
              FIND YOUR
              <br />
              <em>CATEGORY.</em>
            </h2>

          </div>


          <div className="round-arrow">
            ↓
          </div>

        </div>


        <div className="category-grid">

          <Category
            title="TEES"
            number="01"
            image={products[0].image}
            click={() => {
              setActiveCategory("T-SHIRTS");
              scroll("shop");
            }}
          />


          <Category
            title="SHIRTS"
            number="02"
            image={products[1].image}
            click={() => {
              setActiveCategory("SHIRTS");
              scroll("shop");
            }}
          />


          <Category
            title="BOTTOMS"
            number="03"
            image={products[2].image}
            click={() => {
              setActiveCategory("BOTTOMS");
              scroll("shop");
            }}
          />


          <Category
            title="HOODIES"
            number="04"
            image={products[3].image}
            click={() => {
              setActiveCategory("HOODIES");
              scroll("shop");
            }}
          />

        </div>

      </section>


      {/* SHOP */}

      <section
        className="shop section"
        id="shop"
      >

        <div className="section-title shop-title">

          <div>

            <span>
              02 / NEW DROP
            </span>

            <h2>
              EVERYDAY
              <br />
              <em>ESSENTIALS.</em>
            </h2>

          </div>


          <p>
            BUILT FOR REPEAT WEAR.
          </p>

        </div>


        {searchText && (

          <div className="shop-search-result">

            <span>
              SEARCH RESULTS
            </span>

            <strong>
              "{searchText}"
            </strong>

            <button
              type="button"
              onClick={() =>
                setSearchText("")
              }
            >
              CLEAR
              <X size={14} />
            </button>

          </div>

        )}


        <div className="shop-controls">

          <div className="category-filters">

            {categories.map(
              (category) => (

                <button
                  type="button"
                  key={category}
                  className={
                    activeCategory ===
                    category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>


          <div className="sort-wrapper">

            <span>
              SORT BY
            </span>


            <div>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
              >

                <option>
                  FEATURED
                </option>

                <option>
                  PRICE LOW
                </option>

                <option>
                  PRICE HIGH
                </option>

                <option>
                  NAME
                </option>

              </select>

              <ChevronDown size={15} />

            </div>

          </div>

        </div>


        <div className="products">

          {filteredProducts.length > 0 ? (

            filteredProducts.map(
              (product) => (

                <ProductCard
                  key={product.id}
                  p={product}
                  add={addCart}
                  wish={wishlist}
                  toggle={toggleWishlist}
                />

              )
            )

          ) : (

            <div className="no-products">

              <span>
                NO PRODUCTS FOUND
              </span>

              <h3>
                NOTHING HERE.
              </h3>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("ALL");
                  setSearchText("");
                }}
              >
                VIEW ALL PRODUCTS
                <ArrowRight size={16} />
              </button>

            </div>

          )}

        </div>


        <div className="shop-count">

          SHOWING{" "}
          <strong>
            {filteredProducts.length}
          </strong>{" "}
          OF{" "}
          <strong>
            {products.length}
          </strong>{" "}
          PRODUCTS

        </div>

      </section>


      {/* STATEMENT */}

      <section className="statement">

        <span>
          03
        </span>

        <h2>
          YOUR STYLE
          <br />
          DOESN'T NEED
          <br />
          <em>PERMISSION.</em>
        </h2>

      </section>


      {/* JOURNAL */}

      <section
        className="journal section"
        id="journal"
      >

        <div className="journal-image">

          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90"
            alt="The Off Grid editorial"
          />

        </div>


        <div className="journal-content">

          <span>
            THE JOURNAL / 001
          </span>

          <h2>
            THE ART OF
            <br />
            <em>STANDING OUT.</em>
          </h2>


          <p>
            Trends disappear. Personal style
            stays. Build a wardrobe that feels
            like you.
          </p>


          <button
            type="button"
            className="orange-btn"
            onClick={() =>
              alert(
                "The Off Grid Journal is coming soon."
              )
            }
          >
            READ JOURNAL
            <ArrowRight size={18} />
          </button>

        </div>

      </section>


      {/* NEWSLETTER */}

      <section className="newsletter">

        <div>

          <span>
            JOIN THE OFF GRID
          </span>

          <h2>
            GET IN.
            <br />
            <em>STAY DIFFERENT.</em>
          </h2>

        </div>


        <form onSubmit={handleNewsletterSubmit}>

          <label>
            EMAIL ADDRESS
          </label>


          <div>

            <input
              type="email"
              placeholder="you@example.com"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                if (newsletterStatus !== "idle") {
                  setNewsletterStatus("idle");
                }
              }}
              required
            />

            <button
              type="submit"
              disabled={newsletterStatus === "loading"}
            >
              <ArrowRight />
            </button>

          </div>


          <small>
            {newsletterStatus === "success"
              ? "YOU'RE ON THE OFF GRID LIST."
              : newsletterStatus === "error"
              ? "SOMETHING WENT WRONG. TRY AGAIN."
              : "NEW DROPS. LIMITED EDITS. ZERO SPAM."}
          </small>

        </form>

      </section>


      {/* FOOTER */}

      <footer>

        <div className="footer-grid">


          <div className="footer-brand">

            <small>
              THE
            </small>

            <strong>
              OFF GRID
            </strong>

            <p>
              Independent clothing for
              independent minds.
              <br />
              Est. 2026 / India.
            </p>

          </div>


          <div>

            <h4>
              SHOP
            </h4>


            <button
              type="button"
              onClick={() => {
                setActiveCategory("ALL");
                scroll("shop");
              }}
            >
              NEW ARRIVALS
            </button>


            <button
              type="button"
              onClick={() => {
                setActiveCategory("T-SHIRTS");
                scroll("shop");
              }}
            >
              TEES
            </button>


            <button
              type="button"
              onClick={() => {
                setActiveCategory("SHIRTS");
                scroll("shop");
              }}
            >
              SHIRTS
            </button>


            <button
              type="button"
              onClick={() => {
                setActiveCategory("BOTTOMS");
                scroll("shop");
              }}
            >
              BOTTOMS
            </button>

          </div>


          <div>

            <h4>
              INFO
            </h4>


            <button
              type="button"
              onClick={() =>
                alert(
                  "Shipping across India."
                )
              }
            >
              SHIPPING
            </button>


            <button
              type="button"
              onClick={() =>
                alert(
                  "Easy and transparent returns."
                )
              }
            >
              RETURNS
            </button>


            <button
              type="button"
              onClick={() =>
                alert(
                  "Contact: hello@theoffgrid.in"
                )
              }
            >
              CONTACT
            </button>


            <button
              type="button"
              onClick={() =>
                alert(
                  "Privacy policy coming soon."
                )
              }
            >
              PRIVACY
            </button>

          </div>


          <div>

            <h4>
              FOLLOW
            </h4>


            <a
              href="https://instagram.com/theoffgrid.in"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={16} />
              INSTAGRAM
            </a>


            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
            >
              <Youtube size={16} />
              YOUTUBE
            </a>


            <button
              type="button"
              onClick={() =>
                alert(
                  "Pinterest coming soon."
                )
              }
            >
              PINTEREST
            </button>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 THE OFF GRID
          </span>

          <span>
            MADE WITH INTENT.
          </span>

          <span>
            INDIA
          </span>

        </div>

      </footer>


      {/* FLOATING BAG */}

      {cart.length > 0 && (

        <button
          type="button"
          className="floating-bag"
          onClick={() =>
            navigate("/checkout")
          }
        >

          <ShoppingBag size={18} />

          <span>

            {cart.reduce(
              (total, item) =>
                total +
                Number(item.qty || 1),
              0
            )}{" "}

            {cart.reduce(
              (total, item) =>
                total +
                Number(item.qty || 1),
              0
            ) === 1
              ? "ITEM"
              : "ITEMS"}

          </span>

          <ArrowUpRight size={16} />

        </button>

      )}

    </div>
  );
}


/* =========================================================
   PRODUCT PAGE
========================================================= */

function ProductPage({
  product,
  add,
  wishlist,
  toggle,
}) {

  const navigate = useNavigate();

  const [qty, setQty] = useState(1);

  const [selectedSize, setSelectedSize] =
    useState("");

  const [sizeGuideOpen, setSizeGuideOpen] =
    useState(false);


  const isWishlisted =
    wishlist.some(
      (item) =>
        String(item) ===
        String(product.id)
    );


  const discount =
    product.old_price && product.price
      ? Math.round(
          ((product.old_price -
            product.price) /
            product.old_price) *
            100
        )
      : 0;


  const sizes =
    product.size
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
      value > 1
        ? value - 1
        : 1
    );
  };


  const handleAdd = () => {

    if (!product.stock) return;


    for (
      let i = 0;
      i < qty;
      i++
    ) {
      add(product);
    }


    navigate("/checkout");
  };


  return (

    <div className="product-details-page">


      {/* HEADER */}

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

          <small>
            THE
          </small>

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


      {/* MAIN */}

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


        {/* INFO */}

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
              ₹{Number(product.price).toLocaleString("en-IN")}
            </strong>


            {product.old_price && (
              <del>
                ₹{Number(product.old_price).toLocaleString("en-IN")}
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


          {/* SIZE */}

          {sizes.length > 0 && (

            <div className="product-size-section">

              <div className="product-size-title">

                <span>
                  SELECT SIZE
                </span>

                <span
                  className="size-guide-trigger"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSizeGuideOpen(true)}
                >
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


          {/* BUY ROW */}

          <div className="product-buy-row">


            <div className="product-quantity">

              <button
                type="button"
                onClick={decreaseQty}
              >
                <Minus size={15} />
              </button>


              <span>
                {qty}
              </span>


              <button
                type="button"
                onClick={increaseQty}
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
                toggle(product.id)
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


          {/* ADD */}

          <button
            type="button"
            className="product-detail-add"
            disabled={!product.stock}
            onClick={handleAdd}
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


      {/* EXTRA */}

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


      {/* REVIEWS */}

      <ProductReviews productId={product.id} />


      {/* BACK */}

      <div className="product-details-bottom">

        <button
          type="button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          CONTINUE SHOPPING
        </button>

      </div>


      {sizeGuideOpen && (
        <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />
      )}

    </div>
  );
}


/* =========================================================
   PRODUCT NOT FOUND
========================================================= */

function ProductNotFound({
  onBack,
}) {

  return (

    <div className="product-not-found-page">

      <div className="product-not-found-inner">

        <span>
          THE OFF GRID
        </span>


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
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          BACK TO SHOP
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   CATEGORY
========================================================= */

function Category({
  title,
  number,
  image,
  click,
}) {

  return (

    <button
      type="button"
      className="category"
      onClick={click}
    >

      <img
        src={image}
        alt={title}
        loading="lazy"
      />


      <div className="category-overlay"></div>


      <div className="category-info">

        <small>
          {number}
        </small>


        <h3>
          {title}
        </h3>


        <span>
          SHOP NOW
          <ArrowRight size={15} />
        </span>

      </div>

    </button>
  );
}
