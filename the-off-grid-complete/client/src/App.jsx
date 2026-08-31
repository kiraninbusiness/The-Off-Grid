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
  ArrowRight
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

  const searchProducts = (e) => {
    if (e.key !== "Enter") return;

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

      <div className="top-bar">
        FREE SHIPPING ON ORDERS OVER ₹1,499
      </div>


      {/* HEADER */}

      <header className="main-header">

        {/* MOBILE */}

        <button
          className="header-icon mobile-menu"
          type="button"
          onClick={() => setOpenMenu(v => !v)}
        >
          {openMenu ? <X /> : <Menu />}
        </button>


        {/* LOGO */}

        <Link
          to="/"
          className="brand-logo"
          onClick={() => setOpenMenu(false)}
        >
          THE OFF GRID
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
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={searchProducts}
            />

          </label>


          <Link
            to="/wishlist"
            className="header-icon"
            aria-label="Wishlist"
          >
            <Heart />

            {wish.length > 0 && (
              <span className="header-count">
                {wish.length}
              </span>
            )}
          </Link>


          <Link
            to="/account"
            className="header-icon"
            aria-label="Account"
          >
            <User />
          </Link>


          <button
            type="button"
            className="header-icon"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping bag"
          >
            <ShoppingBag />

            {cartCount > 0 && (
              <span className="header-count">
                {cartCount}
              </span>
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
    <main className="new-home">

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
            Modern clothing for people who
            don't follow the usual path.
          </p>

          <Link
            to="/shop"
            className="primary-button"
          >
            SHOP NOW
            <ArrowRight size={18} />
          </Link>

        </div>


        <div className="hero-visual">

          <div className="hero-image-placeholder">
            <span>THE OFF GRID</span>
          </div>

          <div className="hero-number">
            01 / 01
          </div>

        </div>

      </section>


      {/* INTRO */}

      <section className="brand-intro">

        <p className="small-label">
          THE OFF GRID
        </p>

        <h2>
          NOT MADE
          <br />
          TO BLEND IN.
        </h2>

        <p>
          A contemporary clothing brand built
          around individuality, confidence and
          everyday expression.
        </p>

      </section>


      {/* CATEGORIES */}

      <section className="category-section">

        <div className="section-title-row">

          <div>
            <p className="small-label">
              COLLECTIONS
            </p>

            <h2>
              EXPLORE
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
            className="category-box category-one"
          >
            <div>
              <span>01</span>
              <h3>
                NEW ARRIVALS
              </h3>
            </div>
          </Link>


          <Link
            to="/shop"
            className="category-box category-two"
          >
            <div>
              <span>02</span>
              <h3>
                STREETWEAR
              </h3>
            </div>
          </Link>


          <Link
            to="/shop"
            className="category-box category-three"
          >
            <div>
              <span>03</span>
              <h3>
                ESSENTIALS
              </h3>
            </div>
          </Link>


          <Link
            to="/shop"
            className="category-box category-four"
          >
            <div>
              <span>04</span>
              <h3>
                OUTERWEAR
              </h3>
            </div>
          </Link>

        </div>

      </section>


      {/* FEATURED */}

      <section className="featured-section">

        <div className="section-title-row">

          <div>
            <p className="small-label">
              FEATURED
            </p>

            <h2>
              THE LATEST
            </h2>
          </div>

          <Link to="/shop">
            SHOP ALL
            <ArrowRight size={16} />
          </Link>

        </div>


        {featured.length > 0 ? (

          <div className="product-grid">

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
              New pieces coming soon.
            </p>

          </div>

        )}

      </section>


      {/* STATEMENT */}

      <section className="statement-section">

        <p>
          OFF THE USUAL PATH.
        </p>

        <h2>
          CLOTHES WITH
          <br />
          <em>CHARACTER.</em>
        </h2>

        <Link
          to="/our-story"
          className="text-link"
        >
          DISCOVER OUR STORY
          <ArrowRight size={17} />
        </Link>

      </section>


      {/* BRAND VALUES */}

      <section className="values-section">

        <div className="value">

          <span>01</span>

          <h3>
            QUALITY
          </h3>

          <p>
            Carefully selected materials
            and considered construction.
          </p>

        </div>


        <div className="value">

          <span>02</span>

          <h3>
            INDIVIDUALITY
          </h3>

          <p>
            Designed for people who
            create their own identity.
          </p>

        </div>


        <div className="value">

          <span>03</span>

          <h3>
            SIMPLICITY
          </h3>

          <p>
            Clean design without
            unnecessary noise.
          </p>

        </div>


        <div className="value">

          <span>04</span>

          <h3>
            CONFIDENCE
          </h3>

          <p>
            Pieces made to be worn
            your way.
          </p>

        </div>

      </section>


      {/* NEWSLETTER */}

      <section
        className="newsletter-section"
        id="contact"
      >

        <div>

          <p className="small-label">
            THE OFF GRID JOURNAL
          </p>

          <h2>
            STAY
            <br />
            <em>CONNECTED.</em>
          </h2>

        </div>


        <form
          onSubmit={e => {

            e.preventDefault();

            const email =
              e.target.email.value.trim();

            if (!email) return;

            alert(
              `Thank you! ${email} has been added.`
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

function OurStory() {

  return (

    <main className="story-page-new">

      <section className="story-hero-new">

        <p className="small-label">
          ABOUT THE BRAND
        </p>

        <h1>
          BUILT
          <br />
          <em>DIFFERENT.</em>
        </h1>

        <p>
          THE OFF GRID is an independent clothing
          brand created for people who prefer
          individuality over conformity.
        </p>

      </section>


      <section className="story-content-new">

        <div>

          <p className="small-label">
            OUR PHILOSOPHY
          </p>

          <h2>
            CREATE.
            <br />
            DON'T FOLLOW.
          </h2>

        </div>


        <div>

          <p>
            We believe clothing should feel
            personal. It should represent the
            person wearing it rather than
            whatever happens to be trending.
          </p>

          <p>
            THE OFF GRID focuses on modern
            silhouettes, strong details and
            versatile pieces designed for
            everyday life.
          </p>

          <p>
            No unnecessary noise. No rules.
            Just clothing with character.
          </p>

        </div>

      </section>


      <section className="story-cta-new">

        <h2>
          FIND YOUR
          <br />
          <em>OWN PATH.</em>
        </h2>

        <Link
          to="/shop"
          className="primary-button"
        >
          SHOP COLLECTION
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
  toggle
}) {

  const [category, setCategory] =
    useState("All");

  const [gender, setGender] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState("featured");


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
        return Number(a.price) - Number(b.price);
      }

      if (sort === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sort === "newest") {
        return Number(b.id) - Number(a.id);
      }

      return 0;

    }
  );


  return (

    <main className="shop-new">

      <section className="shop-hero-new">

        <p className="small-label">
          THE COLLECTION
        </p>

        <h1>
          SHOP
          <br />
          <em>THE OFF GRID.</em>
        </h1>

        <p>
          Explore our latest collection.
        </p>

      </section>


      <section className="shop-controls-new">

        <div className="shop-filters-new">

          <span>
            CATEGORY
          </span>

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


        <div className="shop-filters-new">

          <span>
            SHOP FOR
          </span>

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


        <div className="shop-sort-new">

          <input
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
            placeholder="Search..."
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
              Price Low → High
            </option>

            <option value="price-high">
              Price High → Low
            </option>

          </select>

        </div>

      </section>


      <div className="shop-result">

        {list.length}{" "}
        {list.length === 1
          ? "PIECE"
          : "PIECES"}

      </div>


      {list.length > 0 ? (

        <section className="product-grid shop-products">

          {list.map(product => (

            <Card
              key={product.id}
              p={product}
              add={add}
              wish={wish}
              toggle={toggle}
            />

          ))}

        </section>

      ) : (

        <section className="shop-empty-new">

          <p className="small-label">
            NO RESULTS
          </p>

          <h2>
            NOTHING
            <br />
            <em>FOUND.</em>
          </h2>

          <button
            type="button"
            className="primary-button"
            onClick={() => {

              setCategory("All");
              setGender("All");
              setSearch("");

            }}
          >
            VIEW ALL
            <ArrowRight size={18} />
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
  close
}) {

  const navigate = useNavigate();

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.qty || 0),
      0
    );


  return (

    <div
      className="cart-overlay"
      onClick={close}
    >

      <aside
        className="cart-panel"
        onClick={e =>
          e.stopPropagation()
        }
      >

        <div className="cart-header">

          <div>

            <p className="small-label">
              THE OFF GRID
            </p>

            <h2>
              YOUR BAG
            </h2>

          </div>

          <button
            className="header-icon"
            onClick={close}
          >
            <X />
          </button>

        </div>


        {!cart.length ? (

          <div className="cart-empty">

            <ShoppingBag size={42} />

            <h3>
              YOUR BAG IS EMPTY
            </h3>

            <p>
              Discover something new.
            </p>

            <Link
              to="/shop"
              className="primary-button"
              onClick={close}
            >
              SHOP NOW
              <ArrowRight size={17} />
            </Link>

          </div>

        ) : (

          <>

            <div className="cart-items">

              {cart.map(item => {

                const stock =
                  Number(item.stock) || 0;

                const qty =
                  Number(item.qty) || 1;


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


                    <div className="cart-item-info">

                      <small>
                        {item.category}
                      </small>

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        ₹{Number(
                          item.price || 0
                        ).toLocaleString("en-IN")}
                      </span>


                      <div className="cart-item-bottom">

                        <div className="quantity">

                          <button
                            onClick={() =>
                              setCart(current =>
                                current.map(x =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty:
                                          Math.max(
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

                          <span>
                            {qty}
                          </span>

                          <button
                            disabled={
                              qty >= stock
                            }
                            onClick={() =>
                              setCart(current =>
                                current.map(x =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty:
                                          Math.min(
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
                          className="remove-cart"
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


            <div className="cart-footer">

              <div className="cart-total">

                <span>
                  SUBTOTAL
                </span>

                <strong>
                  ₹{total.toLocaleString("en-IN")}
                </strong>

              </div>

              <p>
                Shipping calculated at checkout.
              </p>


              <button
                className="primary-button full"
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

    <footer className="new-footer">

      <div className="footer-top">

        <div className="footer-brand">

          <Link
            to="/"
            className="footer-logo"
          >
            THE OFF GRID
          </Link>

          <p>
            Modern clothing.
            <br />
            Individual expression.
          </p>

        </div>


        <div className="footer-column">

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


        <div className="footer-column">

          <h4>
            ABOUT
          </h4>

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

          <h4>
            ACCOUNT
          </h4>

          <Link to="/account">
            My Account
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

        </div>

      </div>


      <div className="footer-bottom">

        <span>
          © 2026 THE OFF GRID
        </span>

        <span>
          MADE OFF THE USUAL PATH
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
                  product =>
                    String(product.id) ===
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

    if (stock < 1) return;


    setCart(current => {

      const existing =
        current.find(
          item =>
            String(item.id) ===
            String(product.id)
        );


      if (existing) {

        const currentQty =
          Number(existing.qty) || 0;

        if (currentQty >= stock) {
          return current;
        }


        return current.map(item =>
          String(item.id) ===
          String(product.id)
            ? {
                ...item,
                ...product,
                qty: Math.min(
                  stock,
                  currentQty + 1
                )
              }
            : item
        );

      }


      return [
        ...current,
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
            <OurStory />
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
