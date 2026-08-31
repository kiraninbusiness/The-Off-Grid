import React, { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";

import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  Heart,
  ArrowRight,
  Instagram
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

const getStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;


/* =========================================================
   HEADER
========================================================= */

function Header({
  cart,
  wish,
  user,
  openMenu,
  setOpenMenu,
  setCartOpen
}) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );

  const submitSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/shop");
      return;
    }

    setOpenMenu(false);

    navigate(
      `/shop?search=${encodeURIComponent(value)}`
    );
  };

  return (
    <>

      {/* TOP BAR */}

      <div className="topbar">
        <span>THE OFF GRID</span>
        <span>CONSCIOUSLY SELECTED · INDIA</span>
      </div>


      {/* NAV */}

      <header className="nav">

        {/* MOBILE */}

        <button
          className="icon mobile"
          type="button"
          onClick={() => setOpenMenu(v => !v)}
          aria-label="Menu"
        >
          {openMenu ? <X /> : <Menu />}
        </button>


        {/* LOGO */}

        <Link
          to="/"
          className="logo"
          onClick={() => setOpenMenu(false)}
        >
          THE OFF GRID
        </Link>


        {/* LINKS */}

        <nav className={openMenu ? "links open" : "links"}>

          <Link
            to="/"
            onClick={() => setOpenMenu(false)}
          >
            Home
          </Link>

          <Link
            to="/shop"
            onClick={() => setOpenMenu(false)}
          >
            Shop
          </Link>

          <Link
            to="/our-story"
            onClick={() => setOpenMenu(false)}
          >
            About
          </Link>

          <a
            href="/#contact"
            onClick={() => setOpenMenu(false)}
          >
            Contact
          </a>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setOpenMenu(false)}
            >
              Admin
            </Link>
          )}

        </nav>


        {/* ACTIONS */}

        <div className="actions">

          <form
            className="search"
            onSubmit={submitSearch}
          >
            <Search size={17} />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              aria-label="Search"
            />
          </form>


          <Link
            className="icon"
            to="/wishlist"
            aria-label="Wishlist"
          >
            <Heart />

            {wish.length > 0 && (
              <b>{wish.length}</b>
            )}
          </Link>


          <Link
            className="icon"
            to="/account"
            aria-label="Account"
          >
            <User />
          </Link>


          <button
            className="icon"
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping bag"
          >
            <ShoppingBag />

            {cartCount > 0 && (
              <b>{cartCount}</b>
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
  toggle
}) {

  const featured = products.slice(0, 4);

  return (
    <main>


      {/* HERO */}

      <section className="home-hero">

        <div className="home-hero-content">

          <p className="hero-label">
            THE OFF GRID / 2026
          </p>

          <h1>
            WEAR
            <br />
            <em>DIFFERENT.</em>
          </h1>

          <p className="hero-description">
            Clothing for people who don't
            dress for the crowd.
          </p>

          <Link
            to="/shop"
            className="button dark"
          >
            EXPLORE COLLECTION
            <ArrowRight size={17} />
          </Link>

        </div>


        <div className="home-hero-visual">

          <div className="hero-image-placeholder">
            <span>THE OFF GRID</span>
          </div>

          <div className="hero-index">
            01 / 01
          </div>

        </div>

      </section>


      {/* INTRO */}

      <section className="intro-section">

        <p className="section-kicker">
          THE OFF GRID
        </p>

        <h2>
          For those who
          <br />
          <em>choose their own way.</em>
        </h2>

        <p>
          We believe clothing should feel personal.
          Not dictated by trends. Not designed to
          make everyone look the same.
        </p>

      </section>


      {/* CATEGORIES */}

      <section className="category-section">

        <div className="section-title-row">

          <div>
            <p className="section-kicker">
              EXPLORE
            </p>

            <h2>
              Shop by category
            </h2>
          </div>

          <Link to="/shop">
            VIEW ALL
            <ArrowRight size={16} />
          </Link>

        </div>


        <div className="category-grid">

          <Link
            to="/shop"
            className="category-card category-one"
          >
            <div>
              <small>01</small>
              <h3>STREETWEAR</h3>
              <span>EXPLORE</span>
            </div>
          </Link>


          <Link
            to="/shop"
            className="category-card category-two"
          >
            <div>
              <small>02</small>
              <h3>ESSENTIALS</h3>
              <span>EXPLORE</span>
            </div>
          </Link>


          <Link
            to="/shop"
            className="category-card category-three"
          >
            <div>
              <small>03</small>
              <h3>OUTERWEAR</h3>
              <span>EXPLORE</span>
            </div>
          </Link>


          <Link
            to="/shop"
            className="category-card category-four"
          >
            <div>
              <small>04</small>
              <h3>CASUAL</h3>
              <span>EXPLORE</span>
            </div>
          </Link>

        </div>

      </section>


      {/* PRODUCTS */}

      <section className="products-section">

        <div className="section-title-row">

          <div>

            <p className="section-kicker">
              THE COLLECTION
            </p>

            <h2>
              New pieces
            </h2>

          </div>

          <Link to="/shop">
            SHOP ALL
            <ArrowRight size={16} />
          </Link>

        </div>


        {featured.length > 0 ? (

          <div className="grid">

            {featured.map(product => (

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
              Collection coming soon.
            </p>
          </div>

        )}

      </section>


      {/* STATEMENT */}

      <section className="statement-section">

        <div>

          <p className="section-kicker">
            OUR APPROACH
          </p>

          <h2>
            LESS NOISE.
            <br />
            <em>MORE CHARACTER.</em>
          </h2>

        </div>

        <p>
          We select pieces that have their own
          identity. Strong silhouettes, everyday
          comfort and details that don't need
          to shout.
        </p>

      </section>


      {/* STORY */}

      <section className="home-story">

        <div className="story-visual">
          <span>02 / STORY</span>
        </div>


        <div className="story-content">

          <p className="section-kicker">
            OUR STORY
          </p>

          <h2>
            Built outside
            <br />
            <em>the ordinary.</em>
          </h2>

          <p>
            THE OFF GRID is a clothing brand
            built around individuality. We
            believe your clothes should reflect
            where you are going, not where
            everyone else is going.
          </p>

          <p>
            Every piece is selected with
            attention to fit, quality and
            character.
          </p>

          <Link
            to="/our-story"
            className="text-link"
          >
            READ OUR STORY
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>


      {/* NEWSLETTER */}

      <section
        className="newsletter"
        id="contact"
      >

        <div>

          <p className="section-kicker">
            STAY CONNECTED
          </p>

          <h2>
            Be the first
            <br />
            <em>to know.</em>
          </h2>

          <p>
            New drops, selected pieces and
            updates from THE OFF GRID.
          </p>

        </div>


        <form
          onSubmit={e => {
            e.preventDefault();

            const email =
              e.target.email.value.trim();

            if (!email) return;

            alert(
              `You're on the list. ${email}`
            );

            e.target.reset();
          }}
        >

          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
          />

          <button type="submit">
            JOIN
            <ArrowRight size={16} />
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
    p => Number(p.stock) > 0
  ).length;

  return (
    <main className="story-page">


      {/* HERO */}

      <section className="story-hero">

        <p className="section-kicker">
          THE OFF GRID
        </p>

        <h1>
          NOT MADE
          <br />
          <em>TO BLEND IN.</em>
        </h1>

        <p>
          THE OFF GRID exists for people who
          want their clothing to feel like their
          own.
        </p>

      </section>


      {/* NUMBERS */}

      <section className="story-numbers">

        <div>
          <strong>
            {available}
          </strong>

          <span>
            pieces currently available
          </span>
        </div>


        <div>
          <strong>
            100%
          </strong>

          <span>
            quality checked
          </span>
        </div>


        <div>
          <strong>
            01
          </strong>

          <span>
            independent direction
          </span>
        </div>

      </section>


      {/* PHILOSOPHY */}

      <section className="philosophy">

        <p className="section-kicker">
          OUR PHILOSOPHY
        </p>

        <h2>
          Clothing should
          <br />
          <em>have character.</em>
        </h2>


        <div className="philosophy-grid">

          <div>
            <span>01</span>
            <h3>INDIVIDUALITY</h3>
            <p>
              We choose pieces that feel
              different without trying too hard.
            </p>
          </div>


          <div>
            <span>02</span>
            <h3>QUALITY</h3>
            <p>
              Good construction and thoughtful
              materials come before noise.
            </p>
          </div>


          <div>
            <span>03</span>
            <h3>SIMPLICITY</h3>
            <p>
              A strong piece does not need
              unnecessary decoration.
            </p>
          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="story-bottom">

        <h2>
          Find something
          <br />
          <em>that feels like you.</em>
        </h2>

        <Link
          to="/shop"
          className="button dark"
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
  toggle
}) {

  const [category, setCategory] =
    useState("All");

  const [gender, setGender] =
    useState("All");

  const [sort, setSort] =
    useState("featured");

  const [search, setSearch] =
    useState("");


  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    setSearch(
      params.get("search") || ""
    );

  }, []);


  const categories = [
    "All",
    ...new Set(
      products
        .map(p => p.category)
        .filter(Boolean)
    )
  ];


  const genders = [
    "All",
    ...new Set(
      products
        .map(p => p.gender)
        .filter(Boolean)
    )
  ];


  const filtered = products.filter(product => {

    const matchesCategory =
      category === "All" ||
      product.category === category;

    const matchesGender =
      gender === "All" ||
      product.gender === gender;

    const text = `
      ${product.name || ""}
      ${product.category || ""}
      ${product.gender || ""}
      ${product.size || ""}
      ${product.color || ""}
      ${product.fit || ""}
      ${product.description || ""}
    `.toLowerCase();

    const matchesSearch =
      text.includes(
        search.toLowerCase().trim()
      );

    return (
      matchesCategory &&
      matchesGender &&
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

      return 0;
    }
  );


  return (
    <main className="shop-page">


      {/* HEADER */}

      <section className="shop-intro">

        <p className="section-kicker">
          COLLECTION
        </p>

        <h1>
          Shop
          <br />
          <em>the collection.</em>
        </h1>

        <p>
          {list.length}{" "}
          {list.length === 1
            ? "piece"
            : "pieces"}
        </p>

      </section>


      {/* CONTROLS */}

      <section className="shop-controls">

        <div className="filter-block">

          <span>CATEGORY</span>

          <div>

            {categories.map(item => (

              <button
                key={item}
                type="button"
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

            {genders.map(item => (

              <button
                key={item}
                type="button"
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


        <div className="shop-sort">

          <input
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
            placeholder="Search"
          />

          <select
            value={sort}
            onChange={e =>
              setSort(e.target.value)
            }
          >
            <option value="featured">
              Featured
            </option>

            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>
          </select>

        </div>

      </section>


      {/* PRODUCTS */}

      {list.length > 0 ? (

        <div className="grid">

          {list.map(product => (

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

        <div className="shop-empty">

          <p className="section-kicker">
            NOTHING FOUND
          </p>

          <h2>
            Try another
            <br />
            <em>search.</em>
          </h2>

          <button
            className="button dark"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setGender("All");
            }}
          >
            VIEW ALL
            <ArrowRight size={16} />
          </button>

        </div>

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
  close
}) {

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.qty || 0),
    0
  );


  return (
    <div
      className="overlay"
      onClick={close}
    >

      <aside
        className="cart"
        onClick={e =>
          e.stopPropagation()
        }
      >

        <div className="cart-head">

          <div>
            <span>YOUR BAG</span>

            <h2>
              Shopping bag
            </h2>
          </div>

          <button
            className="icon"
            onClick={close}
            type="button"
          >
            <X />
          </button>

        </div>


        {!cart.length ? (

          <div className="cart-empty">

            <ShoppingBag size={38} />

            <h3>
              Your bag is empty.
            </h3>

            <Link
              to="/shop"
              className="button dark"
              onClick={close}
            >
              SHOP COLLECTION
              <ArrowRight size={16} />
            </Link>

          </div>

        ) : (

          <>

            <div className="cart-items">

              {cart.map(item => {

                const qty =
                  Number(item.qty) || 1;

                const stock =
                  Number(item.stock) || 0;

                return (

                  <div
                    className="cart-item"
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


                      <div className="cart-item-bottom">

                        <div className="qty">

                          <button
                            type="button"
                            onClick={() =>
                              setCart(current =>
                                current.map(x =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty: Math.max(
                                          1,
                                          Number(x.qty) - 1
                                        )
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
                            type="button"
                            disabled={
                              qty >= stock
                            }
                            onClick={() =>
                              setCart(current =>
                                current.map(x =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty: Math.min(
                                          stock,
                                          Number(x.qty) + 1
                                        )
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
                          className="remove-item"
                          type="button"
                          onClick={() =>
                            setCart(current =>
                              current.filter(
                                x =>
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


            <div className="cart-bottom">

              <div className="cart-total">

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
                className="button dark"
                type="button"
                onClick={() => {
                  close();
                  navigate("/checkout");
                }}
              >
                CHECKOUT
                <ArrowRight size={17} />
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
    <footer
      className="footer"
      id="footer"
    >

      <div className="footer-main">


        <div className="footer-brand">

          <Link
            to="/"
            className="footer-logo"
          >
            THE OFF GRID
          </Link>

          <p>
            Clothing outside
            <br />
            the ordinary.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={17} />
            INSTAGRAM
          </a>

        </div>


        <div className="footer-column">

          <h4>SHOP</h4>

          <Link to="/shop">
            Collection
          </Link>

          <Link to="/shop">
            New Arrivals
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

        </div>


        <div className="footer-column">

          <h4>ABOUT</h4>

          <Link to="/our-story">
            Our Story
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

          <Link to="/checkout">
            Checkout
          </Link>

        </div>

      </div>


      <div className="footer-bottom">

        <span>
          © 2026 THE OFF GRID
        </span>

        <span>
          MADE OUTSIDE THE ORDINARY
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
      getStored("thrift_cart", [])
    );

  const [wish, setWish] =
    useState(() =>
      getStored("thrift_wish", [])
    );

  const [user, setUser] =
    useState(() =>
      getStored("thrift_user", null)
    );

  const [cartOpen, setCartOpen] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(false);


  /* LOAD PRODUCTS */

  useEffect(() => {

    api("/products")
      .then(data => {

        const latest =
          Array.isArray(data)
            ? data
            : [];

        setProducts(latest);


        setCart(currentCart => {

          return currentCart
            .map(item => {

              const latestProduct =
                latest.find(
                  p =>
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
                )
              };

            })
            .filter(Boolean);

        });

      })
      .catch(error => {
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

  const add = product => {

    const stock =
      Number(product.stock) || 0;

    if (stock < 1) {
      return;
    }


    setCart(currentCart => {

      const existing =
        currentCart.find(
          item =>
            String(item.id) ===
            String(product.id)
        );


      if (existing) {

        const qty =
          Number(existing.qty) || 0;

        if (qty >= stock) {
          return currentCart;
        }

        return currentCart.map(item =>
          String(item.id) ===
          String(product.id)
            ? {
                ...item,
                ...product,
                qty: Math.min(
                  stock,
                  qty + 1
                )
              }
            : item
        );
      }


      return [
        ...currentCart,
        {
          ...product,
          qty: 1
        }
      ];

    });

  };


  /* WISHLIST */

  const toggle = id => {

    setWish(current => {

      if (current.includes(id)) {

        return current.filter(
          item => item !== id
        );

      }

      return [
        ...current,
        id
      ];

    });

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
          element={
            <Success />
          }
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
