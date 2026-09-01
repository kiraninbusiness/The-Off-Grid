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
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import ProductCard from "./components/ProductCard";
import ProductDetails from "./pages/ProductDetails";

import Checkout from "./pages/Checkout";
import Order from "./pages/Orders";
import Success from "./pages/Success";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import TrackOrder from "./pages/TrackOrder";

import { api } from "./api";
import PRODUCTS from "./data/products.js";

import "./styles.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  /* =========================================================
     UI STATE
  ========================================================= */

  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  /* =========================================================
     CART
  ========================================================= */

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("offgrid_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* =========================================================
     WISHLIST
  ========================================================= */

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("offgrid_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* =========================================================
     PRODUCTS
     
     IMPORTANT:
     Product data comes from data/products.js.
     We do NOT define product details inside App.jsx.
  ========================================================= */

  const [products, setProducts] = useState(PRODUCTS);

  /* =========================================================
     USER
  ========================================================= */

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("thrift_user")) || null;
    } catch {
      return null;
    }
  });

  /* =========================================================
     SHOP FILTERS
  ========================================================= */

  const [activeCategory, setActiveCategory] = useState("ALL");

  const [sortBy, setSortBy] = useState("FEATURED");

  /* =========================================================
     NEWSLETTER
  ========================================================= */

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const [newsletterStatus, setNewsletterStatus] =
    useState("idle");

  /* =========================================================
     SAVE CART
  ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "offgrid_cart",
        JSON.stringify(cart)
      );
    } catch {}
  }, [cart]);

  /* =========================================================
     SAVE WISHLIST
  ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "offgrid_wishlist",
        JSON.stringify(wishlist)
      );
    } catch {}
  }, [wishlist]);

  /* =========================================================
     LOAD LIVE PRODUCTS
     
     If backend works, use backend products.
     If backend fails, PRODUCTS remains available.
     
     This prevents the product page from disappearing
     while waiting for the API.
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    api("/products")
      .then((data) => {
        if (
          !cancelled &&
          Array.isArray(data) &&
          data.length > 0
        ) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Keep local products if API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     CART FUNCTIONS
  ========================================================= */

  const addCart = (product) => {
    setCart((current) => {
      const existing = current.find(
        (item) =>
          String(item.id) === String(product.id)
      );

      if (existing) {
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                qty: Number(item.qty || 1) + 1,
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

  const clearCart = () => {
    setCart([]);
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

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

  /* =========================================================
     NEWSLETTER
  ========================================================= */

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    const email = newsletterEmail.trim();

    if (!email) return;

    setNewsletterStatus("loading");

    try {
      await api("/newsletter", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("error");
    }
  };

  /* =========================================================
     SCROLL
  ========================================================= */

  const scroll = (id) => {
    setMenu(false);

    setTimeout(() => {
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  /* =========================================================
     FILTER / SEARCH / SORT
  ========================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "ALL") {
      result = result.filter(
        (product) =>
          String(product.category || "").toUpperCase() ===
          String(activeCategory).toUpperCase()
      );
    }

    if (searchText.trim()) {
      const query = searchText
        .toLowerCase()
        .trim();

      result = result.filter((product) =>
        [
          product.name,
          product.category,
          product.gender,
          product.color,
          product.fit,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (sortBy === "PRICE LOW") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "PRICE HIGH") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "NAME") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    return result;
  }, [
    products,
    activeCategory,
    searchText,
    sortBy,
  ]);

  /* =========================================================
     CATEGORIES
  ========================================================= */

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

  /* =========================================================
     SPECIAL ROUTES
  ========================================================= */

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

  if (
    location.pathname.startsWith(
      "/track-order/"
    )
  ) {
    return <TrackOrder user={user} />;
  }

  /* =========================================================
     PRODUCT DETAILS ROUTE
     
     IMPORTANT:
     App.jsx does NOT contain product details.
     ProductDetails.jsx handles the entire product page.
  ========================================================= */

  if (
    location.pathname.startsWith("/product/")
  ) {
    const rawId = location.pathname
      .split("/product/")[1]
      ?.split("/")[0];

    const product = products.find(
      (item) =>
        String(item.id) === String(rawId)
    );

    /*
      If the live API hasn't returned yet and the product
      exists in our local PRODUCTS file, use the local product.
    */

    const localProduct = PRODUCTS.find(
      (item) =>
        String(item.id) === String(rawId)
    );

    const finalProduct =
      product || localProduct;

    if (!finalProduct) {
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
              BACK TO SHOP
            </button>
          </div>
        </div>
      );
    }

    return (
      <ProductDetails
        product={finalProduct}
        add={addCart}
        wishlist={wishlist}
        toggle={toggleWishlist}
      />
    );
  }

  /* =========================================================
     HOME PAGE
  ========================================================= */

  return (
    <div className="app">

      {/* =====================================================
          TOPBAR
      ===================================================== */}

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

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">

        <button
          className="mobile-menu-btn"
          type="button"
          onClick={() => setMenu(true)}
          aria-label="Open menu"
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
          onClick={() => {
            if (location.pathname !== "/") {
              navigate("/");
            } else {
              scroll("home");
            }
          }}
        >
          <small>THE</small>
          <strong>OFF GRID</strong>
        </button>

        <div className="nav-right">

          <button
            type="button"
            onClick={() =>
              setSearchOpen(true)
            }
            aria-label="Search"
          >
            <Search size={19} />
            <span>SEARCH</span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/account")
            }
            aria-label="Account"
          >
            <User size={19} />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/wishlist")
            }
            aria-label="Wishlist"
          >
            <Heart size={19} />

            {wishlist.length > 0 && (
              <b>{wishlist.length}</b>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              cart.length
                ? navigate("/checkout")
                : scroll("shop")
            }
            aria-label="Shopping bag"
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

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menu && (
        <div className="mobile-menu">

          <button
            type="button"
            className="mobile-close"
            onClick={() => setMenu(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>

          <div className="mobile-logo">
            <small>THE</small>
            <strong>OFF GRID</strong>
          </div>

          <div className="mobile-links">

            <button
              type="button"
              onClick={() =>
                scroll("shop")
              }
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

      {/* =====================================================
          SEARCH
      ===================================================== */}

      {searchOpen && (
        <div className="search-overlay">

          <button
            type="button"
            className="search-close"
            onClick={() => {
              setSearchOpen(false);
              setSearchText("");
            }}
            aria-label="Close search"
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

                    setTimeout(() => {
                      scroll("shop");
                    }, 50);
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

      {/* =====================================================
          HERO
      ===================================================== */}

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
          <span>01</span>
          <span>NOT MADE FOR EVERYONE.</span>
        </div>

      </section>

      {/* =====================================================
          MARQUEE
      ===================================================== */}

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

      {/* =====================================================
          STORY
      ===================================================== */}

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

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section
        className="categories section"
        id="categories"
      >

        <div className="section-title">

          <div>

            <span>EXPLORE</span>

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
            image={
              products[0]?.image ||
              PRODUCTS[0]?.image
            }
            click={() => {
              setActiveCategory("T-SHIRTS");
              scroll("shop");
            }}
          />

          <Category
            title="SHIRTS"
            number="02"
            image={
              products[1]?.image ||
              PRODUCTS[1]?.image
            }
            click={() => {
              setActiveCategory("SHIRTS");
              scroll("shop");
            }}
          />

          <Category
            title="BOTTOMS"
            number="03"
            image={
              products[2]?.image ||
              PRODUCTS[2]?.image
            }
            click={() => {
              setActiveCategory("BOTTOMS");
              scroll("shop");
            }}
          />

          <Category
            title="HOODIES"
            number="04"
            image={
              products[3]?.image ||
              PRODUCTS[3]?.image
            }
            click={() => {
              setActiveCategory("HOODIES");
              scroll("shop");
            }}
          />

        </div>

      </section>

      {/* =====================================================
          SHOP
      ===================================================== */}

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

      {/* =====================================================
          STATEMENT
      ===================================================== */}

      <section className="statement">

        <span>03</span>

        <h2>
          YOUR STYLE
          <br />
          DOESN'T NEED
          <br />
          <em>PERMISSION.</em>
        </h2>

      </section>

      {/* =====================================================
          JOURNAL
      ===================================================== */}

      <section
        className="journal section"
        id="journal"
      >

        <div className="journal-image">

          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90"
            alt="The Off Grid editorial"
            loading="lazy"
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

      {/* =====================================================
          NEWSLETTER
      ===================================================== */}

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

        <form
          onSubmit={handleNewsletterSubmit}
        >

          <label>
            EMAIL ADDRESS
          </label>

          <div>

            <input
              type="email"
              placeholder="you@example.com"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(
                  e.target.value
                );

                if (
                  newsletterStatus !==
                  "idle"
                ) {
                  setNewsletterStatus(
                    "idle"
                  );
                }
              }}
              required
            />

            <button
              type="submit"
              disabled={
                newsletterStatus ===
                "loading"
              }
              aria-label="Subscribe"
            >
              <ArrowRight />
            </button>

          </div>

          <small>
            {newsletterStatus ===
            "success"
              ? "YOU'RE ON THE OFF GRID LIST."
              : newsletterStatus ===
                "error"
              ? "SOMETHING WENT WRONG. TRY AGAIN."
              : "NEW DROPS. LIMITED EDITS. ZERO SPAM."}
          </small>

        </form>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <div className="footer-grid">

          <div className="footer-brand">

            <small>THE</small>

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

            <h4>SHOP</h4>

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

            <h4>INFO</h4>

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

            <h4>FOLLOW</h4>

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

      {/* =====================================================
          FLOATING BAG
      ===================================================== */}

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
   CATEGORY COMPONENT
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

      {image ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
        />
      ) : (
        <div className="category-image-placeholder" />
      )}

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
