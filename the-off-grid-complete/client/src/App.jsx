import React, { useState } from "react";
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import "./styles.css";

const products = [
  {
    id: 1,
    name: "VOID OVERSIZED TEE",
    price: 1499,
    category: "T-SHIRTS",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "AFTER DARK SHIRT",
    price: 2499,
    category: "SHIRTS",
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "UTILITY CARGO",
    price: 2799,
    category: "BOTTOMS",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "GRID HOODIE",
    price: 2999,
    category: "HOODIES",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
  },
];

export default function App() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const money = (n) => `₹${n.toLocaleString("en-IN")}`;

  const addCart = (product) => {
    setCart([...cart, product]);
  };

  const toggleWishlist = (id) => {
    setWishlist(
      wishlist.includes(id)
        ? wishlist.filter((x) => x !== id)
        : [...wishlist, id]
    );
  };

  const scroll = (id) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="app">

      {/* TOP BAR */}
      <div className="topbar">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹1,499</span>
        <span>THE OFF GRID — EST. 2026</span>
        <span>INDIA / WORLDWIDE</span>
      </div>

      {/* NAVBAR */}
      <header className="navbar">

        <button
          className="mobile-menu-btn"
          onClick={() => setMenu(true)}
        >
          <Menu size={24} />
        </button>

        <nav className="nav-left">
          <button onClick={() => scroll("shop")}>SHOP</button>
          <button onClick={() => scroll("categories")}>CATEGORIES</button>
          <button onClick={() => scroll("story")}>STORY</button>
        </nav>

        <button
          className="logo"
          onClick={() => scroll("home")}
        >
          <small>THE</small>
          <strong>OFF GRID</strong>
        </button>

        <div className="nav-right">
          <button onClick={() => setSearch(true)}>
            <Search size={19} />
            <span>SEARCH</span>
          </button>

          <button>
            <Heart size={19} />
            {wishlist.length > 0 && (
              <b>{wishlist.length}</b>
            )}
          </button>

          <button>
            <ShoppingBag size={19} />
            <b>{cart.length}</b>
          </button>
        </div>

      </header>

      {/* MOBILE MENU */}
      {menu && (
        <div className="mobile-menu">

          <button
            className="mobile-close"
            onClick={() => setMenu(false)}
          >
            <X size={28} />
          </button>

          <div className="mobile-logo">
            THE
            <strong>OFF GRID</strong>
          </div>

          <div className="mobile-links">
            <button onClick={() => scroll("shop")}>SHOP</button>
            <button onClick={() => scroll("categories")}>
              CATEGORIES
            </button>
            <button onClick={() => scroll("story")}>OUR STORY</button>
            <button onClick={() => scroll("journal")}>JOURNAL</button>
          </div>

          <p>NO RULES. JUST STYLE.</p>

        </div>
      )}

      {/* SEARCH */}
      {search && (
        <div className="search-overlay">

          <button
            className="search-close"
            onClick={() => setSearch(false)}
          >
            <X size={28} />
          </button>

          <span>SEARCH THE OFF GRID</span>

          <div className="big-search">
            <Search size={28} />
            <input
              autoFocus
              placeholder="Search products..."
            />
          </div>

        </div>
      )}

      {/* HERO */}
      <section className="hero" id="home">

        <img
          src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1800&q=90"
          alt="The Off Grid"
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
            Clean silhouettes. Strong details.
            Zero unnecessary rules.
          </p>

          <div className="hero-buttons">
            <button
              className="orange-btn"
              onClick={() => scroll("shop")}
            >
              SHOP COLLECTION
              <ArrowRight size={18} />
            </button>

            <button
              className="outline-btn"
              onClick={() => scroll("story")}
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

      {/* MARQUEE */}
      <div className="marquee">
        <div>
          NOT MADE FOR EVERYONE
          <span>✦</span>
          MADE FOR YOU
          <span>✦</span>
          OFF THE GRID
          <span>✦</span>
          NOT MADE FOR EVERYONE
          <span>✦</span>
        </div>
      </div>

      {/* STORY */}
      <section className="story section" id="story">

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
              The Off Grid is an independent clothing label
              built around individuality. We believe your
              clothes should reflect your point of view —
              not somebody else's.
            </p>

            <button className="under-btn">
              DISCOVER OUR STORY →
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
      <section className="categories section" id="categories">

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
            image="https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85"
            click={() => scroll("shop")}
          />

          <Category
            title="SHIRTS"
            number="02"
            image="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85"
            click={() => scroll("shop")}
          />

          <Category
            title="BOTTOMS"
            number="03"
            image="https://images.unsplash.com/photo-1506629905607-d9c297d7a0bd?auto=format&fit=crop&w=1000&q=85"
            click={() => scroll("shop")}
          />

        </div>

      </section>

      {/* SHOP */}
      <section className="shop section" id="shop">

        <div className="section-title shop-title">

          <div>
            <span>02 / NEW DROP</span>
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

        <div className="products">

          {products.map((product) => (

            <article
              className="product"
              key={product.id}
            >

              <div className="product-image">

                <img
                  src={product.image}
                  alt={product.name}
                />

                <span className="product-tag">
                  NEW
                </span>

                <button
                  className="heart"
                  onClick={() =>
                    toggleWishlist(product.id)
                  }
                >
                  <Heart
                    size={19}
                    fill={
                      wishlist.includes(product.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                <button
                  className="quick-add"
                  onClick={() => addCart(product)}
                >
                  ADD TO BAG
                  <ArrowRight size={15} />
                </button>

              </div>

              <div className="product-details">

                <div>
                  <small>{product.category}</small>
                  <h3>{product.name}</h3>
                </div>

                <strong>
                  {money(product.price)}
                </strong>

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* BIG STATEMENT */}
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

      {/* JOURNAL */}
      <section className="journal section" id="journal">

        <div className="journal-image">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90"
            alt="Off Grid editorial"
          />
        </div>

        <div className="journal-content">

          <span>THE JOURNAL / 001</span>

          <h2>
            THE ART OF
            <br />
            <em>STANDING OUT.</em>
          </h2>

          <p>
            Trends disappear. Personal style stays.
            Build a wardrobe that feels like you.
          </p>

          <button className="orange-btn">
            READ JOURNAL
            <ArrowRight size={18} />
          </button>

        </div>

      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">

        <div>
          <span>JOIN THE OFF GRID</span>

          <h2>
            GET IN.
            <br />
            <em>STAY DIFFERENT.</em>
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("You're on the list.");
          }}
        >
          <label>EMAIL ADDRESS</label>

          <div>
            <input
              type="email"
              placeholder="you@example.com"
              required
            />

            <button>
              <ArrowRight />
            </button>
          </div>

          <small>
            NEW DROPS. LIMITED EDITS. ZERO SPAM.
          </small>

        </form>

      </section>

      {/* FOOTER */}
      <footer>

        <div className="footer-grid">

          <div className="footer-brand">
            <small>THE</small>
            <strong>OFF GRID</strong>

            <p>
              Independent clothing for
              independent minds.
              <br />
              Est. 2026 / India.
            </p>
          </div>

          <div>
            <h4>SHOP</h4>
            <button onClick={() => scroll("shop")}>
              NEW ARRIVALS
            </button>
            <button onClick={() => scroll("shop")}>
              TEES
            </button>
            <button onClick={() => scroll("shop")}>
              SHIRTS
            </button>
            <button onClick={() => scroll("shop")}>
              BOTTOMS
            </button>
          </div>

          <div>
            <h4>INFO</h4>
            <button>SHIPPING</button>
            <button>RETURNS</button>
            <button>CONTACT</button>
            <button>PRIVACY</button>
          </div>

          <div>
            <h4>FOLLOW</h4>
            <button>INSTAGRAM</button>
            <button>YOUTUBE</button>
            <button>PINTEREST</button>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 THE OFF GRID</span>
          <span>MADE WITH INTENT.</span>
          <span>INDIA</span>
        </div>

      </footer>

    </div>
  );
}

function Category({ title, number, image, click }) {
  return (
    <button className="category" onClick={click}>

      <img src={image} alt={title} />

      <div className="category-overlay"></div>

      <div className="category-info">
        <small>{number}</small>
        <h3>{title}</h3>
        <span>
          SHOP NOW <ArrowRight size={15} />
        </span>
      </div>

    </button>
  );
}
