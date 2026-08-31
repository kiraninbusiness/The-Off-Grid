import React, { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  Heart,
  ArrowRight,
  Instagram,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

import { api } from "./api";

import Card from "./components/ProductCard";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Wishlist from "./pages/Wishlist";
import TrackOrder from "./pages/TrackOrder";

/* =========================================================
   HELPERS
========================================================= */

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

const getStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/* =========================================================
   HEADER
========================================================= */

function Header({
  cart,
  wish,
  user,
  openMenu,
  setOpenMenu,
  setCartOpen,
}) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );

  const handleSearch = (e) => {
    if (e.key !== "Enter") return;

    const value = searchValue.trim();

    setOpenMenu(false);

    if (!value) {
      navigate("/shop");
      return;
    }

    navigate(`/shop?search=${encodeURIComponent(value)}`);
  };

  return (
    <>
      {/* TOP BAR */}

      <div className="top-bar">
        <span>FREE SHIPPING ON ORDERS OVER ₹1,499</span>
        <span className="top-bar-desktop">
          BUILT DIFFERENT. WORN YOUR WAY.
        </span>
      </div>

      {/* HEADER */}

      <header className="main-header">
        <div className="header-inner">

          {/* MOBILE MENU */}

          <button
            type="button"
            className="header-icon mobile-menu-button"
            onClick={() => setOpenMenu((v) => !v)}
            aria-label="Menu"
          >
            {openMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* LOGO */}

          <Link
            to="/"
            className="brand-logo"
            onClick={() => setOpenMenu(false)}
          >
            THE OFF<span>GRID</span>
          </Link>

          {/* NAVIGATION */}

          <nav className={`main-nav ${openMenu ? "open" : ""}`}>
            <Link
              to="/"
              onClick={() => setOpenMenu(false)}
            >
              HOME
            </Link>

            <Link
              to="/shop"
              onClick={() => setOpenMenu(false)}
            >
              SHOP
            </Link>

            <Link
              to="/our-story"
              onClick={() => setOpenMenu(false)}
            >
              ABOUT
            </Link>

            <a
              href="/#contact"
              onClick={() => setOpenMenu(false)}
            >
              CONTACT
            </a>

            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpenMenu(false)}
              >
                ADMIN
              </Link>
            )}
          </nav>

          {/* ACTIONS */}

          <div className="header-actions">

            <label className="header-search">
              <Search size={18} />

              <input
                type="text"
                value={searchValue}
                placeholder="Search"
                aria-label="Search"
                onChange={(e) =>
                  setSearchValue(e.target.value)
                }
                onKeyDown={handleSearch}
              />
            </label>

            <Link
              to="/wishlist"
              className="header-icon header-count-icon"
              aria-label="Wishlist"
            >
              <Heart size={21} />

              {wish.length > 0 && (
                <span>{wish.length}</span>
              )}
            </Link>

            <Link
              to="/account"
              className="header-icon"
              aria-label="Account"
            >
              <User size={21} />
            </Link>

            <button
              type="button"
              className="header-icon header-count-icon"
              onClick={() => setCartOpen(true)}
              aria-label="Shopping bag"
            >
              <ShoppingBag size={21} />

              {cartCount > 0 && (
                <span>{cartCount}</span>
              )}
            </button>

          </div>
        </div>
      </header>
    </>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home({
  products,
  add,
  wish,
  toggle,
}) {
  const featured = products.slice(0, 4);

  const categories = [
    {
      name: "NEW ARRIVALS",
      filter: "New Arrival",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "STREETWEAR",
      filter: "Streetwear",
      image:
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "ESSENTIALS",
      filter: "Essentials",
      image:
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
    },
  ];

  return (
    <main>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="new-hero">

        <div className="hero-background">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=90"
            alt="THE OFF GRID streetwear"
          />
        </div>

        <div className="hero-overlay" />

        <div className="hero-content">

          <p className="hero-label">
            THE OFF GRID / 2026
          </p>

          <h1>
            WEAR
            <br />
            <span>YOUR</span>
            <br />
            <strong>OWN WAY.</strong>
          </h1>

          <p className="hero-description">
            Contemporary streetwear for people
            who don't dress for the crowd.
          </p>

          <Link
            to="/shop"
            className="hero-button"
          >
            SHOP COLLECTION
            <ArrowRight size={18} />
          </Link>

        </div>

        <div className="hero-scroll">
          SCROLL TO EXPLORE
          <ChevronRight size={15} />
        </div>

      </section>

      {/* =====================================================
          MARQUEE
      ===================================================== */}

      <section className="brand-marquee">
        <div>
          THE OFF GRID
          <span>•</span>
          NO RULES
          <span>•</span>
          NO UNIFORM
          <span>•</span>
          OWN YOUR STYLE
          <span>•</span>
          THE OFF GRID
          <span>•</span>
          NO RULES
          <span>•</span>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="home-intro">

        <div className="intro-small">
          THE BRAND
        </div>

        <div className="intro-main">
          <h2>
            NOT MADE
            <br />
            TO <em>BLEND IN.</em>
          </h2>

          <p>
            THE OFF GRID is a modern clothing brand
            built around individuality. Clean silhouettes,
            everyday comfort and street-led design —
            without following every trend.
          </p>

          <Link
            to="/our-story"
            className="text-link"
          >
            DISCOVER OUR STORY
            <ArrowRight size={17} />
          </Link>
        </div>

      </section>

      {/* =====================================================
          CATEGORY GRID
      ===================================================== */}

      <section className="home-categories">

        <div className="section-title-row">

          <div>
            <p className="section-kicker">
              EXPLORE
            </p>

            <h2>
              SHOP YOUR STYLE
            </h2>
          </div>

          <Link to="/shop" className="view-all">
            VIEW ALL
            <ArrowRight size={16} />
          </Link>

        </div>

        <div className="category-grid">

          {categories.map((category, index) => (

            <Link
              key={category.name}
              to="/shop"
              className="category-card"
            >

              <img
                src={category.image}
                alt={category.name}
              />

              <div className="category-dark" />

              <div className="category-content">

                <span>
                  0{index + 1}
                </span>

                <h3>
                  {category.name}
                </h3>

                <div>
                  EXPLORE
                  <ArrowRight size={15} />
                </div>

              </div>

            </Link>

          ))}

        </div>

      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section className="home-products">

        <div className="section-title-row">

          <div>
            <p className="section-kicker">
              JUST DROPPED
            </p>

            <h2>
              NEW IN
            </h2>
          </div>

          <Link to="/shop" className="view-all">
            SHOP ALL
            <ArrowRight size={16} />
          </Link>

        </div>

        {featured.length > 0 ? (

          <div className="modern-product-grid">

            {featured.map((product) => (
              <Card
                key={product.id}
                p={product}
                add={add}
                wish={wish}
                toggle={toggle}
              />
            ))}

          </div>

        ) : (

          <div className="empty-products">
            <p>Products will appear here once added.</p>
            <Link to="/shop">
              GO TO SHOP
            </Link>
          </div>

        )}

      </section>

      {/* =====================================================
          BRAND STATEMENT
      ===================================================== */}

      <section className="statement-section">

        <div className="statement-image">
          <img
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=85"
            alt="THE OFF GRID"
          />
        </div>

        <div className="statement-content">

          <p className="section-kicker">
            THE OFF GRID
          </p>

          <h2>
            STYLE
            <br />
            WITHOUT
            <br />
            <em>LIMITS.</em>
          </h2>

          <p>
            We believe clothing should feel like
            an extension of who you are — not a
            uniform dictated by everyone else.
          </p>

          <Link
            to="/shop"
            className="dark-button"
          >
            EXPLORE THE COLLECTION
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

      {/* =====================================================
          SERVICE STRIP
      ===================================================== */}

      <section className="service-strip">

        <div>
          <Truck />
          <strong>FAST DELIVERY</strong>
          <span>Across India</span>
        </div>

        <div>
          <ShieldCheck />
          <strong>SECURE CHECKOUT</strong>
          <span>Safe & reliable payments</span>
        </div>

        <div>
          <RotateCcw />
          <strong>EASY RETURNS</strong>
          <span>Simple return process</span>
        </div>

      </section>

      {/* =====================================================
          NEWSLETTER
      ===================================================== */}

      <section
        className="newsletter-section"
        id="contact"
      >

        <div className="newsletter-inner">

          <p className="section-kicker">
            STAY IN THE LOOP
          </p>

          <h2>
            GET OFF GRID.
          </h2>

          <p>
            New drops, exclusive releases and
            everything happening at THE OFF GRID.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              const email =
                e.target.email.value.trim();

              if (!email) return;

              alert(
                `You're in. ${email} has been added to THE OFF GRID.`
              );

              e.target.reset();
            }}
          >

            <input
              name="email"
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              required
            />

            <button type="submit">
              JOIN
              <ArrowRight size={17} />
            </button>

          </form>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   OUR STORY
========================================================= */

function OurStory({ products = [] }) {

  const liveCount = products.filter(
    (p) => Number(p.stock) > 0
  ).length;

  return (
    <main className="new-story-page">

      {/* HERO */}

      <section className="story-hero">

        <div>
          <p className="section-kicker">
            OUR STORY
          </p>

          <h1>
            BUILT FOR
            <br />
            <em>THE DIFFERENT.</em>
          </h1>
        </div>

        <p className="story-hero-text">
          THE OFF GRID is for people who
          choose their own direction. We
          create and curate clothing with
          a focus on individuality, comfort
          and modern streetwear.
        </p>

      </section>

      {/* IMAGE */}

      <section className="story-large-image">

        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90"
          alt="THE OFF GRID collection"
        />

        <div>
          THE OFF GRID
        </div>

      </section>

      {/* STORY */}

      <section className="story-copy-section">

        <div className="story-copy-label">
          01 / THE IDEA
        </div>

        <div className="story-copy">

          <h2>
            CLOTHES FOR
            <br />
            <em>YOUR PATH.</em>
          </h2>

          <p>
            Fashion moves quickly. Trends appear,
            disappear and return again.
          </p>

          <p>
            We wanted to create something different.
            A brand where you can choose pieces
            because they feel right to you — not
            because everyone else is wearing them.
          </p>

          <p>
            That's where THE OFF GRID began.
          </p>

        </div>

      </section>

      {/* VALUES */}

      <section className="story-values">

        <div className="section-title-row">

          <div>
            <p className="section-kicker">
              WHAT WE BELIEVE
            </p>

            <h2>
              OUR VALUES
            </h2>
          </div>

        </div>

        <div className="values-grid">

          <div>
            <span>01</span>
            <h3>INDIVIDUALITY</h3>
            <p>
              Your style belongs to you.
              We make clothing that gives
              you room to make it your own.
            </p>
          </div>

          <div>
            <span>02</span>
            <h3>QUALITY</h3>
            <p>
              Every product should earn
              its place in your wardrobe.
            </p>
          </div>

          <div>
            <span>03</span>
            <h3>SIMPLICITY</h3>
            <p>
              Strong design doesn't need
              unnecessary noise.
            </p>
          </div>

          <div>
            <span>04</span>
            <h3>FREEDOM</h3>
            <p>
              No fixed uniform. No rules.
              Wear what feels like you.
            </p>
          </div>

        </div>

      </section>

      {/* COLLECTION COUNT */}

      <section className="story-count">

        <strong>
          {liveCount}
        </strong>

        <span>
          PIECES CURRENTLY AVAILABLE
        </span>

      </section>

      {/* CTA */}

      <section className="story-final">

        <p className="section-kicker">
          YOUR STYLE. YOUR RULES.
        </p>

        <h2>
          FIND YOUR
          <br />
          <em>OWN WAY.</em>
        </h2>

        <Link
          to="/shop"
          className="dark-button"
        >
          SHOP COLLECTION
          <ArrowRight size={17} />
        </Link>

      </section>

    </main>
  );
}

/* =========================================================
   SHOP
========================================================= */

function Shop({
  products,
  add,
  wish,
  toggle,
}) {
  const location = useLocation();

  const [cat, setCat] = useState("All");
  const [gender, setGender] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [fit, setFit] = useState("All");
  const [price, setPrice] = useState("All");
  const [availability, setAvailability] =
    useState("All");

  const [q, setQ] = useState("");
  const [sort, setSort] =
    useState("featured");

  const [filterOpen, setFilterOpen] =
    useState(false);

  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    setQ(params.get("search") || "");
  }, [location.search]);

  const categories = [
    "All",
    ...new Set(
      products
        .map((p) => p.category)
        .filter(Boolean)
    ),
  ];

  const genders = [
    "All",
    ...new Set(
      products
        .map((p) => p.gender)
        .filter(Boolean)
    ),
  ];

  const sizes = [
    "All",
    ...new Set(
      products
        .map((p) => p.size)
        .filter(Boolean)
    ),
  ];

  const colors = [
    "All",
    ...new Set(
      products
        .map((p) => p.color)
        .filter(Boolean)
    ),
  ];

  const fits = [
    "All",
    ...new Set(
      products
        .map((p) => p.fit)
        .filter(Boolean)
    ),
  ];

  const filtered = products.filter((p) => {

    const matchesCategory =
      cat === "All" ||
      p.category === cat;

    const matchesGender =
      gender === "All" ||
      p.gender === gender;

    const matchesSize =
      size === "All" ||
      p.size === size;

    const matchesColor =
      color === "All" ||
      p.color === color;

    const matchesFit =
      fit === "All" ||
      p.fit === fit;

    const stock =
      Number(p.stock) || 0;

    const matchesAvailability =
      availability === "All" ||
      (availability === "in-stock" && stock > 0) ||
      (availability === "sold-out" && stock < 1);

    let matchesPrice = true;

    if (price === "under-500") {
      matchesPrice =
        Number(p.price) < 500;
    }

    if (price === "500-1000") {
      matchesPrice =
        Number(p.price) >= 500 &&
        Number(p.price) <= 1000;
    }

    if (price === "1000-1500") {
      matchesPrice =
        Number(p.price) > 1000 &&
        Number(p.price) <= 1500;
    }

    if (price === "above-1500") {
      matchesPrice =
        Number(p.price) > 1500;
    }

    const searchText = `
      ${p.name || ""}
      ${p.category || ""}
      ${p.gender || ""}
      ${p.size || ""}
      ${p.color || ""}
      ${p.fit || ""}
      ${p.condition || ""}
      ${p.description || ""}
    `.toLowerCase();

    const matchesSearch =
      searchText.includes(
        q.toLowerCase().trim()
      );

    return (
      matchesCategory &&
      matchesGender &&
      matchesSize &&
      matchesColor &&
      matchesFit &&
      matchesAvailability &&
      matchesPrice &&
      matchesSearch
    );
  });

  const list = [...filtered].sort(
    (a, b) => {

      if (sort === "price-low") {
        return (
          Number(a.price) -
          Number(b.price)
        );
      }

      if (sort === "price-high") {
        return (
          Number(b.price) -
          Number(a.price)
        );
      }

      if (sort === "newest") {
        return (
          Number(b.id) -
          Number(a.id)
        );
      }

      if (sort === "discount") {

        const discountA =
          Number(a.old_price) >
          Number(a.price)
            ? (
                (
                  Number(a.old_price) -
                  Number(a.price)
                ) /
                Number(a.old_price)
              ) * 100
            : 0;

        const discountB =
          Number(b.old_price) >
          Number(b.price)
            ? (
                (
                  Number(b.old_price) -
                  Number(b.price)
                ) /
                Number(b.old_price)
              ) * 100
            : 0;

        return discountB - discountA;
      }

      return 0;
    }
  );

  const clearFilters = () => {
    setCat("All");
    setGender("All");
    setSize("All");
    setColor("All");
    setFit("All");
    setPrice("All");
    setAvailability("All");
    setQ("");
    setSort("featured");

    window.history.replaceState(
      {},
      "",
      "/shop"
    );
  };

  const hasFilters =
    cat !== "All" ||
    gender !== "All" ||
    size !== "All" ||
    color !== "All" ||
    fit !== "All" ||
    price !== "All" ||
    availability !== "All" ||
    q !== "" ||
    sort !== "featured";

  const filterGroup = (
    label,
    values,
    value,
    setter
  ) => (
    <div className="modern-filter-group">

      <span>
        {label}
      </span>

      <div>
        {values.map((item) => (
          <button
            type="button"
            key={item}
            className={
              value === item
                ? "active"
                : ""
            }
            onClick={() =>
              setter(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

    </div>
  );

  return (
    <main className="new-shop-page">

      {/* SHOP HEADER */}

      <section className="shop-hero">

        <div>
          <p className="section-kicker">
            THE COLLECTION
          </p>

          <h1>
            SHOP
            <br />
            <em>OFF GRID.</em>
          </h1>
        </div>

        <p>
          Clothing for people who
          choose their own direction.
        </p>

      </section>

      {/* MOBILE FILTER BUTTON */}

      <button
        type="button"
        className="mobile-filter-button"
        onClick={() =>
          setFilterOpen((v) => !v)
        }
      >
        {filterOpen
          ? "CLOSE FILTERS"
          : "FILTER & SORT"}
      </button>

      {/* FILTERS */}

      <section
        className={
          filterOpen
            ? "modern-shop-tools open"
            : "modern-shop-tools"
        }
      >

        {filterGroup(
          "CATEGORY",
          categories,
          cat,
          setCat
        )}

        {filterGroup(
          "SHOP FOR",
          genders,
          gender,
          setGender
        )}

        {filterGroup(
          "SIZE",
          sizes,
          size,
          setSize
        )}

        {colors.length > 1 &&
          filterGroup(
            "COLOR",
            colors,
            color,
            setColor
          )}

        {fits.length > 1 &&
          filterGroup(
            "FIT",
            fits,
            fit,
            setFit
          )}

        {filterGroup(
          "PRICE",
          [
            "All",
            "UNDER ₹500",
            "₹500 – ₹1,000",
            "₹1,000 – ₹1,500",
            "ABOVE ₹1,500",
          ],
          price === "under-500"
            ? "UNDER ₹500"
            : price === "500-1000"
            ? "₹500 – ₹1,000"
            : price === "1000-1500"
            ? "₹1,000 – ₹1,500"
            : price === "above-1500"
            ? "ABOVE ₹1,500"
            : "All",
          (value) => {
            const map = {
              "UNDER ₹500":
                "under-500",
              "₹500 – ₹1,000":
                "500-1000",
              "₹1,000 – ₹1,500":
                "1000-1500",
              "ABOVE ₹1,500":
                "above-1500",
            };

            setPrice(
              map[value] || "All"
            );
          }
        )}

        {filterGroup(
          "AVAILABILITY",
          [
            "All",
            "IN STOCK",
            "SOLD OUT",
          ],
          availability === "in-stock"
            ? "IN STOCK"
            : availability === "sold-out"
            ? "SOLD OUT"
            : "All",
          (value) => {
            if (value === "IN STOCK") {
              setAvailability("in-stock");
            } else if (
              value === "SOLD OUT"
            ) {
              setAvailability("sold-out");
            } else {
              setAvailability("All");
            }
          }
        )}

        <div className="shop-search-sort">

          <label>
            <Search size={17} />

            <input
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="SEARCH PRODUCTS"
            />
          </label>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >
            <option value="featured">
              FEATURED
            </option>

            <option value="newest">
              NEWEST
            </option>

            <option value="price-low">
              PRICE: LOW TO HIGH
            </option>

            <option value="price-high">
              PRICE: HIGH TO LOW
            </option>

            <option value="discount">
              BIGGEST DISCOUNT
            </option>
          </select>

        </div>

      </section>

      {/* RESULTS BAR */}

      <div className="shop-results-bar">

        <span>
          {list.length}{" "}
          {list.length === 1
            ? "PRODUCT"
            : "PRODUCTS"}
        </span>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
          >
            CLEAR FILTERS
          </button>
        )}

      </div>

      {/* PRODUCTS */}

      {list.length > 0 ? (

        <div className="modern-product-grid shop-products">

          {list.map((product) => (
            <Card
              key={product.id}
              p={product}
              add={add}
              wish={wish}
              toggle={toggle}
            />
          ))}

        </div>

      ) : (

        <section className="shop-empty-modern">

          <p className="section-kicker">
            NO RESULTS
          </p>

          <h2>
            NOTHING
            <br />
            <em>FOUND.</em>
          </h2>

          <p>
            Try changing your filters
            or searching for another product.
          </p>

          <button
            type="button"
            className="dark-button"
            onClick={clearFilters}
          >
            VIEW ALL PRODUCTS
            <ArrowRight size={17} />
          </button>

        </section>

      )}

    </main>
  );
}

/* =========================================================
   CART
========================================================= */

function Cart({
  cart,
  setCart,
  close,
}) {
  const nav = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.qty || 0),
    0
  );

  const freeShipping = 1499;

  const remaining = Math.max(
    freeShipping - total,
    0
  );

  const progress = Math.min(
    (total / freeShipping) * 100,
    100
  );

  return (
    <div
      className="cart-overlay"
      onClick={close}
    >

      <aside
        className="new-cart"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="new-cart-header">

          <div>
            <span>
              YOUR BAG
            </span>

            <h2>
              Shopping Bag
            </h2>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
          >
            <X size={22} />
          </button>

        </div>

        {/* EMPTY */}

        {!cart.length ? (

          <div className="new-cart-empty">

            <ShoppingBag size={42} />

            <p>
              YOUR BAG IS EMPTY
            </p>

            <h3>
              NOTHING HERE
              <br />
              <em>YET.</em>
            </h3>

            <Link
              to="/shop"
              onClick={close}
              className="dark-button"
            >
              START SHOPPING
              <ArrowRight size={17} />
            </Link>

          </div>

        ) : (

          <>

            {/* SHIPPING */}

            <div className="cart-shipping">

              <p>
                {remaining > 0
                  ? `Add ${money(
                      remaining
                    )} for free shipping`
                  : "You've unlocked free shipping"}
              </p>

              <div>
                <span
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

            </div>

            {/* ITEMS */}

            <div className="new-cart-items">

              {cart.map((item) => {

                const stock =
                  Number(item.stock) || 0;

                const qty =
                  Number(item.qty) || 1;

                return (
                  <div
                    className="new-cart-item"
                    key={item.id}
                  >

                    <Link
                      to={`/product/${item.id}`}
                      onClick={close}
                      className="new-cart-image"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    </Link>

                    <div className="new-cart-info">

                      <small>
                        {item.category}
                      </small>

                      <strong>
                        {item.name}
                      </strong>

                      <b>
                        {money(item.price)}
                      </b>

                      <div className="cart-item-actions">

                        <div className="new-qty">

                          <button
                            type="button"
                            onClick={() =>
                              setCart((current) =>
                                current.map(
                                  (x) =>
                                    x.id === item.id
                                      ? {
                                          ...x,
                                          qty: Math.max(
                                            1,
                                            Number(
                                              x.qty
                                            ) - 1
                                          ),
                                        }
                                      : x
                                )
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {qty}
                          </span>

                          <button
                            type="button"
                            disabled={
                              qty >= stock
                            }
                            onClick={() =>
                              setCart((current) =>
                                current.map(
                                  (x) =>
                                    x.id === item.id
                                      ? {
                                          ...x,
                                          qty: Math.min(
                                            Number(
                                              x.stock
                                            ) || 1,
                                            Number(
                                              x.qty
                                            ) + 1
                                          ),
                                        }
                                      : x
                                )
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                        <button
                          type="button"
                          className="remove-cart-item"
                          onClick={() =>
                            setCart((current) =>
                              current.filter(
                                (x) =>
                                  x.id !==
                                  item.id
                              )
                            )
                          }
                        >
                          REMOVE
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* FOOTER */}

            <div className="new-cart-footer">

              <div className="new-cart-total">
                <span>
                  SUBTOTAL
                </span>

                <strong>
                  {money(total)}
                </strong>
              </div>

              <p>
                Shipping calculated at checkout.
              </p>

              <button
                type="button"
                className="dark-button full-button"
                onClick={() => {
                  close();
                  nav("/checkout");
                }}
              >
                CHECKOUT
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="continue-button"
                onClick={close}
              >
                CONTINUE SHOPPING
              </button>

            </div>

          </>

        )}

      </aside>
    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {

  return (
    <footer className="new-footer">

      <div className="footer-top">

        {/* BRAND */}

        <div className="footer-brand-block">

          <Link
            to="/"
            className="footer-brand-logo"
          >
            THE OFF
            <span>GRID</span>
          </Link>

          <p>
            Modern clothing for people
            who choose their own direction.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="footer-social"
          >
            <Instagram size={18} />
            INSTAGRAM
          </a>

        </div>

        {/* SHOP */}

        <div className="footer-links">

          <h4>
            SHOP
          </h4>

          <Link to="/shop">
            All Products
          </Link>

          <Link to="/shop">
            New Arrivals
          </Link>

          <Link to="/shop">
            Streetwear
          </Link>

          <Link to="/shop">
            Essentials
          </Link>

        </div>

        {/* COMPANY */}

        <div className="footer-links">

          <h4>
            COMPANY
          </h4>

          <Link to="/our-story">
            Our Story
          </Link>

          <Link to="/our-story">
            Our Values
          </Link>

          <a href="/#contact">
            Contact
          </a>

          <Link to="/account">
            My Account
          </Link>

        </div>

        {/* HELP */}

        <div className="footer-links">

          <h4>
            HELP
          </h4>

          <a href="/#contact">
            Shipping
          </a>

          <a href="/#contact">
            Returns
          </a>

          <a href="/#contact">
            FAQ
          </a>

          <Link to="/account">
            Track Order
          </Link>

        </div>

      </div>

      <div className="footer-big-text">
        OFF GRID.
      </div>

      <div className="footer-bottom">

        <span>
          © 2026 THE OFF GRID
        </span>

        <span>
          BUILT DIFFERENT.
        </span>

      </div>

    </footer>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {

  const [products, setProducts] =
    useState([]);

  const [cart, setCart] =
    useState(() =>
      getStored(
        "thrift_cart",
        []
      )
    );

  const [wish, setWish] =
    useState(() =>
      getStored(
        "thrift_wish",
        []
      )
    );

  const [user, setUser] =
    useState(() =>
      getStored(
        "thrift_user",
        null
      )
    );

  const [cartOpen, setCartOpen] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(false);

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  useEffect(() => {

    api("/products")
      .then((latestProducts) => {

        const safeProducts =
          Array.isArray(
            latestProducts
          )
            ? latestProducts
            : [];

        setProducts(
          safeProducts
        );

        setCart((currentCart) => {

          return currentCart
            .map((item) => {

              const latest =
                safeProducts.find(
                  (p) =>
                    String(p.id) ===
                    String(item.id)
                );

              if (!latest) {
                return null;
              }

              const stock =
                Number(
                  latest.stock
                ) || 0;

              if (stock < 1) {
                return null;
              }

              return {
                ...item,
                ...latest,
                qty: Math.min(
                  Number(item.qty) || 1,
                  stock
                ),
              };
            })
            .filter(Boolean);
        });
      })
      .catch((error) => {
        console.error(
          "Unable to load products:",
          error
        );
      });

  }, []);

  /* =====================================================
     SAVE CART
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      "thrift_cart",
      JSON.stringify(cart)
    );

  }, [cart]);

  /* =====================================================
     SAVE WISHLIST
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      "thrift_wish",
      JSON.stringify(wish)
    );

  }, [wish]);

  /* =====================================================
     SAVE USER
  ===================================================== */

  useEffect(() => {

    if (user) {

      localStorage.setItem(
        "thrift_user",
        JSON.stringify(user)
      );

    } else {

      localStorage.removeItem(
        "thrift_user"
      );

    }

  }, [user]);

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const add = (product) => {

    const stock =
      Number(product.stock) || 0;

    if (stock < 1) {
      return;
    }

    setCart((currentCart) => {

      const existing =
        currentCart.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );

      if (existing) {

        const currentQty =
          Number(
            existing.qty
          ) || 0;

        if (currentQty >= stock) {
          return currentCart;
        }

        return currentCart.map(
          (item) =>
            String(item.id) ===
            String(product.id)
              ? {
                  ...item,
                  ...product,
                  qty: Math.min(
                    stock,
                    currentQty + 1
                  ),
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          qty: 1,
        },
      ];
    });
  };

  /* =====================================================
     WISHLIST
  ===================================================== */

  const toggle = (id) => {

    setWish((currentWish) => {

      const exists =
        currentWish.includes(id);

      if (exists) {
        return currentWish.filter(
          (item) => item !== id
        );
      }

      return [
        ...currentWish,
        id,
      ];
    });
  };

  return (
    <div className="site">

      {/* HEADER */}

      <Header
        cart={cart}
        wish={wish}
        user={user}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        setCartOpen={setCartOpen}
      />

      {/* ROUTES */}

      <Routes>

        <Route
          path="/"
          element={
            <Home
              products={products}
              add={add}
              wish={wish}
              toggle={toggle}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <Shop
              products={products}
              add={add}
              wish={wish}
              toggle={toggle}
            />
          }
        />

        <Route
          path="/our-story"
          element={
            <OurStory
              products={products}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              add={add}
              wishlist={wish}
              toggle={toggle}
              setCart={setCart}
              user={user}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              user={user}
              clearCart={() =>
                setCart([])
              }
            />
          }
        />

        <Route
          path="/success"
          element={<Success />}
        />

        <Route
          path="/wishlist"
          element={
            <Wishlist
              products={products}
              wishlist={wish}
              toggle={toggle}
              add={add}
            />
          }
        />

        <Route
          path="/account"
          element={
            <Account
              user={user}
              setUser={setUser}
            />
          }
        />

        <Route
          path="/track-order/:id"
          element={
            <TrackOrder
              user={user}
            />
          }
        />

        <Route
          path="/admin"
          element={
            <Admin
              user={user}
            />
          }
        />

      </Routes>

      {/* FOOTER */}

      <Footer />

      {/* CART */}

      {cartOpen && (
        <Cart
          cart={cart}
          setCart={setCart}
          close={() =>
            setCartOpen(false)
          }
        />
      )}

    </div>
  );
}
