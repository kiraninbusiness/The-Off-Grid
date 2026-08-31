import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
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
  const [search, setSearch] = useState("");

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  const submitSearch = (e) => {
    if (e.key !== "Enter") return;

    const value = search.trim();

    if (!value) {
      navigate("/shop");
    } else {
      navigate(`/shop?search=${encodeURIComponent(value)}`);
    }

    setOpenMenu(false);
  };

  return (
    <>
      <div className="topbar">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹1,499</span>
        <span>THE OFF GRID / EST. 2026</span>
      </div>

      <header className="site-header">
        <button
          className="mobile-menu-button"
          onClick={() => setOpenMenu((v) => !v)}
          aria-label="Menu"
        >
          {openMenu ? <X /> : <Menu />}
        </button>

        <Link
          to="/"
          className="brand-logo"
          onClick={() => setOpenMenu(false)}
        >
          THE OFF GRID
        </Link>

        <nav className={`main-nav ${openMenu ? "open" : ""}`}>
          <Link to="/" onClick={() => setOpenMenu(false)}>
            HOME
          </Link>

          <Link to="/shop" onClick={() => setOpenMenu(false)}>
            SHOP
          </Link>

          <Link to="/our-story" onClick={() => setOpenMenu(false)}>
            STORY
          </Link>

          <a href="/#contact" onClick={() => setOpenMenu(false)}>
            CONTACT
          </a>

          {user?.role === "admin" && (
            <Link to="/admin" onClick={() => setOpenMenu(false)}>
              ADMIN
            </Link>
          )}
        </nav>

        <div className="header-actions">
          <label className="header-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={submitSearch}
              placeholder="Search"
            />
          </label>

          <Link
            to="/wishlist"
            className="header-icon"
            aria-label="Wishlist"
          >
            <Heart />

            {wish.length > 0 && (
              <span className="icon-count">{wish.length}</span>
            )}
          </Link>

          <Link
            to="/account"
            className="header-icon desktop-account"
            aria-label="Account"
          >
            <User />
          </Link>

          <button
            className="header-icon"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping bag"
          >
            <ShoppingBag />

            {cartCount > 0 && (
              <span className="icon-count">{cartCount}</span>
            )}
          </button>
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

  return (
    <main>

      {/* HERO */}

      <section className="new-hero">

        <div className="hero-content">

          <p className="hero-label">
            THE OFF GRID / 2026
          </p>

          <h1>
            WEAR
            <br />
            <span>YOUR</span>
            <br />
            WAY.
          </h1>

          <p className="hero-description">
            Independent clothing for independent minds.
            Discover pieces designed to move differently,
            look different and feel completely yours.
          </p>

          <div className="hero-actions">
            <Link to="/shop" className="primary-button">
              SHOP COLLECTION
              <ArrowRight size={18} />
            </Link>

            <Link to="/our-story" className="text-button">
              OUR STORY
            </Link>
          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-image-placeholder">
            <span>01</span>

            <div>
              <strong>OFF</strong>
              <strong>GRID</strong>
            </div>

            <small>
              NEW COLLECTION
            </small>
          </div>

        </div>

      </section>


      {/* INTRO */}

      <section className="intro-section">

        <p className="section-kicker">
          THE OFF GRID
        </p>

        <h2>
          NOT MADE FOR
          <br />
          EVERYONE.
        </h2>

        <p>
          A modern clothing label built around individuality,
          clean silhouettes and pieces that don't need
          permission to stand out.
        </p>

      </section>


      {/* FEATURE STRIP */}

      <section className="feature-strip">

        <div>
          <Truck />
          <strong>FAST SHIPPING</strong>
          <span>Across India</span>
        </div>

        <div>
          <ShieldCheck />
          <strong>QUALITY FIRST</strong>
          <span>Every piece checked</span>
        </div>

        <div>
          <RotateCcw />
          <strong>EASY RETURNS</strong>
          <span>Simple & transparent</span>
        </div>

      </section>


      {/* CATEGORIES */}

      <section className="home-section">

        <div className="section-title-row">

          <div>
            <p className="section-kicker">
              EXPLORE
            </p>

            <h2>
              FIND YOUR
              <br />
              CATEGORY.
            </h2>
          </div>

          <Link to="/shop" className="section-link">
            VIEW ALL <ArrowRight size={16} />
          </Link>

        </div>


        <div className="category-grid">

          <Link to="/shop" className="category-card category-one">
            <span>01</span>
            <div>
              <small>EVERYDAY</small>
              <h3>ESSENTIALS</h3>
            </div>
          </Link>

          <Link to="/shop" className="category-card category-two">
            <span>02</span>
            <div>
              <small>URBAN</small>
              <h3>STREETWEAR</h3>
            </div>
          </Link>

          <Link to="/shop" className="category-card category-three">
            <span>03</span>
            <div>
              <small>OUTER</small>
              <h3>JACKETS</h3>
            </div>
          </Link>

          <Link to="/shop" className="category-card category-four">
            <span>04</span>
            <div>
              <small>RELAXED</small>
              <h3>CASUAL</h3>
            </div>
          </Link>

        </div>

      </section>


      {/* PRODUCTS */}

      <section className="home-section product-section">

        <div className="section-title-row">

          <div>
            <p className="section-kicker">
              LATEST DROP
            </p>

            <h2>
              NEW
              <br />
              ARRIVALS.
            </h2>
          </div>

          <Link to="/shop" className="section-link">
            SHOP ALL <ArrowRight size={16} />
          </Link>

        </div>


        {featured.length > 0 ? (

          <div className="product-grid">

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
            <p>
              New pieces are arriving soon.
            </p>
          </div>

        )}

      </section>


      {/* STATEMENT */}

      <section className="statement-section">

        <div className="statement-number">
          02
        </div>

        <div>

          <p className="section-kicker">
            THE PHILOSOPHY
          </p>

          <h2>
            STAY
            <br />
            <em>DIFFERENT.</em>
          </h2>

          <p>
            Trends change.
            Your identity shouldn't have to.
          </p>

          <Link
            to="/our-story"
            className="primary-button"
          >
            READ OUR STORY
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>


      {/* NEWSLETTER */}

      <section
        className="newsletter-section"
        id="contact"
      >

        <div>

          <p className="section-kicker">
            JOIN THE OFF GRID
          </p>

          <h2>
            BE FIRST
            <br />
            <em>TO KNOW.</em>
          </h2>

          <p>
            New drops, exclusive releases and
            everything happening off the grid.
          </p>

        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const email =
              e.target.email.value.trim();

            if (!email) return;

            alert(
              `You're on the list. Welcome to THE OFF GRID.`
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

      </section>

    </main>
  );
}


/* =========================================================
   OUR STORY
========================================================= */

function OurStory({ products = [] }) {

  const available = products.filter(
    (p) => Number(p.stock) > 0
  ).length;

  return (
    <main className="story-page">

      <section className="story-hero">

        <p className="section-kicker">
          OUR STORY
        </p>

        <h1>
          BUILT
          <br />
          <em>OUTSIDE</em>
          <br />
          THE LINES.
        </h1>

        <p>
          THE OFF GRID exists for people who don't
          believe clothing should tell them who to be.
          We create modern pieces for people who
          create their own direction.
        </p>

      </section>


      <section className="story-introduction">

        <div>
          <span>01</span>
          <h2>
            WHY
            <br />
            OFF GRID?
          </h2>
        </div>

        <div>
          <p>
            Fashion moves quickly. We don't think
            your personal style needs to.
          </p>

          <p>
            THE OFF GRID is about finding pieces
            that feel natural to you rather than
            simply following what's popular.
          </p>

          <p>
            Clean design. Strong silhouettes.
            Carefully selected clothing.
            No unnecessary noise.
          </p>
        </div>

      </section>


      <section className="story-values">

        <div>
          <span>01</span>
          <h3>INDIVIDUALITY</h3>
          <p>
            Your style is yours. We simply give
            you more ways to express it.
          </p>
        </div>

        <div>
          <span>02</span>
          <h3>QUALITY</h3>
          <p>
            Every piece is selected with attention
            to construction, feel and everyday wear.
          </p>
        </div>

        <div>
          <span>03</span>
          <h3>SIMPLICITY</h3>
          <p>
            Less noise. Better pieces.
            Clothing that speaks without shouting.
          </p>
        </div>

      </section>


      {available > 0 && (
        <section className="story-collection-count">

          <strong>
            {available}
          </strong>

          <span>
            pieces currently available
            in the collection
          </span>

        </section>
      )}


      <section className="story-final">

        <p className="section-kicker">
          YOUR STYLE. YOUR RULES.
        </p>

        <h2>
          FIND YOUR
          <br />
          <em>OWN PATH.</em>
        </h2>

        <Link
          to="/shop"
          className="primary-button"
        >
          EXPLORE COLLECTION
          <ArrowRight size={18} />
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

  const [category, setCategory] = useState("All");
  const [gender, setGender] = useState("All");
  const [size, setSize] = useState("All");
  const [price, setPrice] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);


  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    setSearch(
      params.get("search") || ""
    );

  }, []);


  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((p) => p.category)
          .filter(Boolean)
      ),
    ],
    [products]
  );


  const genders = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((p) => p.gender)
          .filter(Boolean)
      ),
    ],
    [products]
  );


  const sizes = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((p) => p.size)
          .filter(Boolean)
      ),
    ],
    [products]
  );


  const filtered = products.filter((p) => {

    const text = `
      ${p.name || ""}
      ${p.description || ""}
      ${p.category || ""}
      ${p.gender || ""}
      ${p.size || ""}
      ${p.color || ""}
      ${p.fit || ""}
    `.toLowerCase();

    const matchesSearch =
      text.includes(
        search.trim().toLowerCase()
      );

    const matchesCategory =
      category === "All" ||
      p.category === category;

    const matchesGender =
      gender === "All" ||
      p.gender === gender;

    const matchesSize =
      size === "All" ||
      p.size === size;

    let matchesPrice = true;

    if (price === "under") {
      matchesPrice =
        Number(p.price) < 1000;
    }

    if (price === "mid") {
      matchesPrice =
        Number(p.price) >= 1000 &&
        Number(p.price) <= 1500;
    }

    if (price === "premium") {
      matchesPrice =
        Number(p.price) > 1500;
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesGender &&
      matchesSize &&
      matchesPrice
    );
  });


  const list = [...filtered].sort((a, b) => {

    if (sort === "low") {
      return Number(a.price) - Number(b.price);
    }

    if (sort === "high") {
      return Number(b.price) - Number(a.price);
    }

    if (sort === "new") {
      return Number(b.id) - Number(a.id);
    }

    return 0;
  });


  const clear = () => {
    setCategory("All");
    setGender("All");
    setSize("All");
    setPrice("All");
    setSearch("");
    setSort("featured");

    window.history.replaceState(
      {},
      "",
      "/shop"
    );
  };


  return (
    <main className="shop-page">

      <section className="shop-intro">

        <p className="section-kicker">
          THE COLLECTION
        </p>

        <h1>
          SHOP
          <br />
          <em>OFF GRID.</em>
        </h1>

        <p>
          Find pieces that fit your style,
          not the other way around.
        </p>

      </section>


      <button
        className="mobile-filter-toggle"
        onClick={() =>
          setFilterOpen((v) => !v)
        }
      >
        {filterOpen
          ? "CLOSE FILTERS"
          : "FILTER & SORT"}
      </button>


      <section
        className={
          `shop-toolbar ${
            filterOpen ? "open" : ""
          }`
        }
      >

        <div className="filter-block">

          <span>CATEGORY</span>

          <div>
            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

        </div>


        <div className="filter-block">

          <span>SHOP FOR</span>

          <div>
            {genders.map((item) => (
              <button
                key={item}
                className={
                  gender === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setGender(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

        </div>


        <div className="filter-block">

          <span>SIZE</span>

          <div>
            {sizes.map((item) => (
              <button
                key={item}
                className={
                  size === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSize(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

        </div>


        <div className="filter-block">

          <span>PRICE</span>

          <div>

            <button
              className={
                price === "All"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPrice("All")
              }
            >
              ALL
            </button>

            <button
              className={
                price === "under"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPrice("under")
              }
            >
              UNDER ₹1,000
            </button>

            <button
              className={
                price === "mid"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPrice("mid")
              }
            >
              ₹1,000–₹1,500
            </button>

            <button
              className={
                price === "premium"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPrice("premium")
              }
            >
              ABOVE ₹1,500
            </button>

          </div>

        </div>


        <div className="shop-search-row">

          <label>
            <Search size={16} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
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

            <option value="new">
              NEWEST
            </option>

            <option value="low">
              PRICE LOW → HIGH
            </option>

            <option value="high">
              PRICE HIGH → LOW
            </option>
          </select>

        </div>

      </section>


      <div className="shop-result-bar">

        <span>
          {list.length}{" "}
          {list.length === 1
            ? "PIECE"
            : "PIECES"}
        </span>

        {(category !== "All" ||
          gender !== "All" ||
          size !== "All" ||
          price !== "All" ||
          search) && (
          <button onClick={clear}>
            CLEAR FILTERS
          </button>
        )}

      </div>


      {list.length > 0 ? (

        <div className="product-grid shop-products">

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

        <section className="shop-empty">

          <p className="section-kicker">
            NOTHING FOUND
          </p>

          <h2>
            TRY A
            <br />
            <em>DIFFERENT PATH.</em>
          </h2>

          <button
            className="primary-button"
            onClick={clear}
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

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.qty || 0),
    0
  );

  const shippingLimit = 1499;

  const remaining =
    Math.max(
      shippingLimit - total,
      0
    );

  const progress =
    Math.min(
      (total / shippingLimit) * 100,
      100
    );


  return (
    <div
      className="cart-overlay"
      onClick={close}
    >

      <aside
        className="cart-drawer"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="cart-header">

          <div>
            <span>THE OFF GRID</span>
            <h2>YOUR BAG</h2>
          </div>

          <button
            onClick={close}
            className="cart-close"
          >
            <X />
          </button>

        </div>


        {!cart.length ? (

          <div className="cart-empty">

            <ShoppingBag size={40} />

            <p>
              YOUR BAG IS EMPTY
            </p>

            <h3>
              Nothing here
              <br />
              <em>yet.</em>
            </h3>

            <Link
              to="/shop"
              className="primary-button"
              onClick={close}
            >
              SHOP COLLECTION
              <ArrowRight size={17} />
            </Link>

          </div>

        ) : (

          <>

            <div className="shipping-message">

              {remaining > 0 ? (
                <>
                  ADD{" "}
                  <strong>
                    {money(remaining)}
                  </strong>{" "}
                  FOR FREE SHIPPING
                </>
              ) : (
                <strong>
                  FREE SHIPPING UNLOCKED
                </strong>
              )}

              <div className="shipping-track">
                <div
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

            </div>


            <div className="cart-products">

              {cart.map((item) => {

                const qty =
                  Number(item.qty) || 1;

                const stock =
                  Number(item.stock) || 0;

                return (
                  <div
                    className="cart-product"
                    key={item.id}
                  >

                    <Link
                      to={`/product/${item.id}`}
                      onClick={close}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    </Link>

                    <div>

                      <small>
                        {item.category}
                      </small>

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {money(item.price)}
                      </span>

                      <div className="cart-product-actions">

                        <div className="quantity">

                          <button
                            onClick={() =>
                              setCart((current) =>
                                current.map((x) =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty:
                                          Math.max(
                                            1,
                                            Number(x.qty) -
                                              1
                                          ),
                                      }
                                    : x
                                )
                              )
                            }
                          >
                            −
                          </button>

                          <span>{qty}</span>

                          <button
                            disabled={
                              qty >= stock
                            }
                            onClick={() =>
                              setCart((current) =>
                                current.map((x) =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty:
                                          Math.min(
                                            stock,
                                            Number(x.qty) +
                                              1
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
                          className="remove-button"
                          onClick={() =>
                            setCart((current) =>
                              current.filter(
                                (x) =>
                                  x.id !== item.id
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


            <div className="cart-footer">

              <div className="cart-total">

                <span>SUBTOTAL</span>

                <strong>
                  {money(total)}
                </strong>

              </div>

              <small>
                Shipping calculated at checkout.
              </small>

              <button
                className="primary-button full-button"
                onClick={() => {
                  close();
                  navigate("/checkout");
                }}
              >
                CHECKOUT
                <ArrowRight size={18} />
              </button>

              <button
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
    <footer className="site-footer">

      <div className="footer-top">

        <div className="footer-brand">

          <Link to="/">
            THE OFF GRID
          </Link>

          <p>
            Clothing for people
            who choose their own direction.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={18} />
            INSTAGRAM
          </a>

        </div>


        <div className="footer-column">

          <h4>SHOP</h4>

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


        <div className="footer-column">

          <h4>ABOUT</h4>

          <Link to="/our-story">
            Our Story
          </Link>

          <Link to="/our-story">
            Philosophy
          </Link>

          <a href="/#contact">
            Contact
          </a>

        </div>


        <div className="footer-column">

          <h4>ACCOUNT</h4>

          <Link to="/account">
            My Account
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

          <a href="/#contact">
            Shipping
          </a>

          <a href="/#contact">
            Returns
          </a>

        </div>

      </div>


      <div className="footer-bottom">

        <span>
          © 2026 THE OFF GRID
        </span>

        <span>
          MADE OUTSIDE THE LINES.
        </span>

      </div>

    </footer>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() =>
    getStored("thrift_cart", [])
  );

  const [wish, setWish] = useState(() =>
    getStored("thrift_wish", [])
  );

  const [user, setUser] = useState(() =>
    getStored("thrift_user", null)
  );

  const [cartOpen, setCartOpen] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(false);


  /* LOAD PRODUCTS */

  useEffect(() => {

    api("/products")
      .then((data) => {

        const latest =
          Array.isArray(data)
            ? data
            : [];

        setProducts(latest);

        setCart((current) =>
          current
            .map((item) => {

              const latestProduct =
                latest.find(
                  (p) =>
                    String(p.id) ===
                    String(item.id)
                );

              if (!latestProduct) {
                return null;
              }

              const stock =
                Number(
                  latestProduct.stock
                ) || 0;

              if (stock < 1) {
                return null;
              }

              return {
                ...item,
                ...latestProduct,
                qty: Math.min(
                  Number(item.qty) || 1,
                  stock
                ),
              };
            })
            .filter(Boolean)
        );

      })
      .catch((error) => {
        console.error(
          "Unable to load products:",
          error
        );
      });

  }, []);


  /* SAVE CART */

  useEffect(() => {

    localStorage.setItem(
      "thrift_cart",
      JSON.stringify(cart)
    );

  }, [cart]);


  /* SAVE WISHLIST */

  useEffect(() => {

    localStorage.setItem(
      "thrift_wish",
      JSON.stringify(wish)
    );

  }, [wish]);


  /* SAVE USER */

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


  /* ADD TO CART */

  const add = (product) => {

    const stock =
      Number(product.stock) || 0;

    if (stock < 1) return;

    setCart((current) => {

      const existing =
        current.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );

      if (existing) {

        const qty =
          Number(existing.qty) || 0;

        if (qty >= stock) {
          return current;
        }

        return current.map((item) =>
          String(item.id) ===
          String(product.id)
            ? {
                ...item,
                ...product,
                qty: qty + 1,
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


  /* WISHLIST */

  const toggle = (id) => {

    setWish((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );

  };


  return (
    <div className="site">

      <Header
        cart={cart}
        wish={wish}
        user={user}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        setCartOpen={setCartOpen}
      />


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


      <Footer />


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
