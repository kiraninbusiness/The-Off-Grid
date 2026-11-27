import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight, ArrowUpRight, Instagram, Youtube, User, Settings, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductDetails from "./pages/ProductDetails";
import ProductDiscovery from "./components/ProductDiscovery";
import { dedupeCart } from "./utils/dedupeCart";
import Checkout from "./pages/Checkout";
import Order from "./pages/Orders";
import Success from "./pages/Success";
import Account from "./pages/Account";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist";
import TrackOrder from "./pages/TrackOrder";
import Admin from "./pages/Admin";
import GiftCards from "./pages/GiftCards";
import Lookbook from "./pages/Lookbook";
import Journal from "./pages/Journal";
import JournalPost from "./pages/JournalPost";
import InfoPage from "./pages/InfoPage";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";
import Invoice from "./pages/Invoice";
import CartDrawer from "./components/CartDrawer";
import { api } from "./api";
import PRODUCTS from "./data/products.js";
import "./styles.css";
import "./search-autocomplete.css";
import { productUrl } from "./utils/productUrl";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // React Router does NOT reset scroll position on navigation by
  // default — this is the root cause behind two separate-looking
  // reports: the admin page appearing "blank" (you land on it still
  // scrolled to wherever you were on the previous, often longer,
  // page — if Admin's content doesn't reach that far down, you're
  // just looking at empty space past the end of it) and product pages
  // opening "scrolled to the bottom" (identical mechanism). Every
  // route change now starts at the top, matching normal site
  // behavior.
  //
  // Three layers, because a single scrollTo() call is not actually
  // reliable against two separate browser behaviors:
  //  1. The browser's OWN scroll restoration (history.scrollRestoration,
  //     default "auto") tries to restore the old scroll position on
  //     its own — set to "manual" once, so it stops fighting React.
  //  2. Chrome's scroll anchoring feature re-adjusts scroll position
  //     to "compensate" as images load in and shift layout height —
  //     disabled globally via CSS (see styles.css) rather than only
  //     scrolling once before those images have even loaded.
  //  3. useLayoutEffect (not useEffect) so the reset happens before
  //     the browser paints the new route at all, instead of after —
  //     useEffect can let one frame render at the old scroll position
  //     first, which is visible as a flash/jump on a slow connection.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);
  useLayoutEffect(() => {
    // Explicit "instant" — html has scroll-behavior:smooth set
    // globally (styles.css), which would otherwise turn this into an
    // animated scroll that a layout shift (images loading in) can
    // interrupt partway, landing short of the top.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [cart, setCart] = useState(() => { try { return dedupeCart(JSON.parse(localStorage.getItem("offgrid_cart")) || []); } catch { return []; } });
  const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem("offgrid_wishlist")) || []; } catch { return []; } });
  const [products, setProducts] = useState(PRODUCTS);
  const [recentlyViewed, setRecentlyViewed] = useState(() => { try { return JSON.parse(localStorage.getItem("offgrid_recently_viewed_home")) || []; } catch { return []; } });
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("offgrid_user")) || null; } catch { return null; } });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle");
  useEffect(() => {
    const targets = document.querySelectorAll(".manifesto,.category-editorial,.shop,.type-break,.journal,.newsletter,.offgrid-campaign,.offgrid-edit");
    if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("vexo-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("vexo-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach((el) => { el.classList.add("vexo-reveal"); observer.observe(el); });
    return () => observer.disconnect();
  }, [location.pathname]);


  useEffect(() => { let cancelled = false; if (!user) { setOrders([]); return () => { cancelled = true; }; } setOrdersLoading(true); api("/orders/mine").then((data) => { if (!cancelled && Array.isArray(data)) setOrders(data); }).catch((error) => { console.error("Unable to load orders", error); if (!cancelled) setOrders([]); }).finally(() => { if (!cancelled) setOrdersLoading(false); }); return () => { cancelled = true; }; }, [user]);
  useEffect(() => { try { localStorage.setItem("offgrid_cart", JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem("offgrid_wishlist", JSON.stringify(wishlist)); } catch {} }, [wishlist]);
  useEffect(() => { let cancelled = false; api("/products").then((data) => { if (!cancelled && Array.isArray(data) && data.length) setProducts(data); }).catch(() => {}); return () => { cancelled = true; }; }, []);

  // Keep a small, private on-device browsing history for faster return visits.
  useEffect(() => {
    try { localStorage.setItem("offgrid_recently_viewed_home", JSON.stringify(recentlyViewed.slice(0, 8))); } catch {}
  }, [recentlyViewed]);
  useEffect(() => {
    const match = location.pathname.match(/^\/product\/([^/]+)/);
    if (!match) return;
    const viewed = products.find((item) => String(item.id) === String(match[1])) || PRODUCTS.find((item) => String(item.id) === String(match[1]));
    if (!viewed) return;
    setRecentlyViewed((current) => [viewed, ...current.filter((item) => String(item.id) !== String(viewed.id))].slice(0, 8));
  }, [location.pathname, products]);


  /*
    CART/WISHLIST — LOAD vs MERGE, KEPT STRICTLY SEPARATE

    This used to be one effect that ran the *additive* merge endpoint
    every time `user?.id` was truthy — which includes a completely
    normal page reload with an already-persisted session, not just a
    fresh login. Since the merge endpoint adds the incoming quantities
    onto whatever the server already has, every single page reload
    was silently doubling the cart. That's how a cart reaches 1000+
    items with no user action at all: reopen the site ~10 times while
    logged in and 1 × 2^10 gets you right around there.

    Fixed by splitting these into two genuinely different operations:
      - loadCart(): plain GET, replaces local state. Safe to call any
        number of times — reloading twice in a row can't inflate
        anything, because it never adds, only replaces.
      - mergeGuestCartIntoAccount(): the additive merge. Only ever
        called explicitly, once, from Account.jsx right after an
        actual login/register/Google sign-in completes — never from
        an effect watching general auth state.
  */
  const skipNextCartLoadRef = useRef(false);
  useEffect(() => {
    if (!user?.id) return;
    if (skipNextCartLoadRef.current) { skipNextCartLoadRef.current = false; return; }
    let cancelled = false;
    (async () => {
      try {
        const [cartRows, wishlistIds] = await Promise.all([
          api("/cart"),
          api("/cart/wishlist"),
        ]);
        if (cancelled) return;
        if (Array.isArray(cartRows)) {
          setCart(dedupeCart(cartRows.map((row) => ({
            id: row.product_id, cartItemId: row.id, name: row.name, price: row.price, image: row.image,
            category: row.category, stock: row.stock, qty: row.quantity,
            selectedSize: row.selected_size, selectedColor: row.selected_color,
          }))));
        }
        if (Array.isArray(wishlistIds)) setWishlist(wishlistIds);
      } catch (e) { console.error("Cart/wishlist load failed", e); }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Called exactly once, explicitly, right after a real login/
  // register/Google sign-in — merges whatever was in the guest
  // (localStorage) cart into the account. Never wired to a generic
  // "user is logged in" effect — see note above for why that broke.
  // Sets skipNextCartLoadRef first so the plain-load effect above
  // (which also fires the moment `user` becomes truthy) doesn't race
  // this and overwrite the merged result with a pre-merge snapshot.
  const mergeGuestCartIntoAccount = async () => {
    skipNextCartLoadRef.current = true;
    try {
      const guestCart = dedupeCart(cart);
      const mergedCart = await api("/cart/merge", { method: "POST", body: JSON.stringify({ items: guestCart }) });
      const mergedWishlist = await api("/cart/wishlist/merge", { method: "POST", body: JSON.stringify({ ids: wishlist }) });
      if (Array.isArray(mergedCart)) {
        setCart(dedupeCart(mergedCart.map((row) => ({
          id: row.product_id, cartItemId: row.id, name: row.name, price: row.price, image: row.image,
          category: row.category, stock: row.stock, qty: row.quantity,
          selectedSize: row.selected_size, selectedColor: row.selected_color,
        }))));
      }
      if (Array.isArray(mergedWishlist)) setWishlist(mergedWishlist);
    } catch (e) { console.error("Cart/wishlist merge failed", e); }
  };

  const addOrder = (order) => setOrders((current) => [order, ...current]);
  const refreshOrders = () => { if (!user) return; api("/orders/mine").then((data) => Array.isArray(data) && setOrders(data)).catch(() => {}); };

  // Notification bell — poll unread count while logged in; fetch the
  // full list only when the panel is actually opened.
  useEffect(() => {
    if (!user?.id) { setUnreadCount(0); setNotifications([]); return; }
    let cancelled = false;
    const poll = () => api("/notifications/unread-count").then((r) => { if (!cancelled) setUnreadCount(r.count || 0); }).catch(() => {});
    poll();
    const interval = setInterval(poll, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user?.id]);

  const openNotifications = () => {
    setNotifOpen((o) => !o);
    if (!notifOpen) {
      api("/notifications").then((rows) => Array.isArray(rows) && setNotifications(rows)).catch(() => {});
    }
  };
  const readNotification = (n) => {
    if (!n.read_at) {
      api(`/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => {});
      setNotifications((cur) => cur.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };
  const markAllRead = () => {
    api("/notifications/read-all", { method: "PATCH" }).catch(() => {});
    setNotifications((cur) => cur.map((x) => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
    setUnreadCount(0);
  };
  const cancelOrder = async (id) => { try { const response = await api(`/orders/${id}/cancel`, { method: "PATCH" }); setOrders((current) => current.map((order) => String(order.id) === String(id) ? { ...order, ...response.order, status: "cancelled" } : order)); } catch (error) { window.alert(error.message || "This order cannot be cancelled."); } };
  useEffect(() => { const handler = (event) => { if (event?.detail != null) cancelOrder(event.detail); }; window.addEventListener("offgrid-cancel-order", handler); return () => window.removeEventListener("offgrid-cancel-order", handler); }, []);
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const addCart = (product) => {
    const same = (item) => String(item.id) === String(product.id) && String(item.selectedSize || "") === String(product.selectedSize || "") && String(item.selectedColor || "") === String(product.selectedColor || "");
    const current = cartRef.current;
    const existing = current.find(same);
    const maxStock = Math.max(0, Number(product.stock ?? existing?.stock ?? 99));
    const nextQty = Number(existing?.qty || 0) + 1;
    if (maxStock <= 0 || nextQty > maxStock) {
      window.alert(maxStock <= 0 ? "THIS ITEM IS OUT OF STOCK." : "YOU HAVE REACHED THE AVAILABLE STOCK LIMIT.");
      setCartOpen(true);
      return;
    }
    const nextCart = existing
      ? current.map((item) => same(item) ? { ...item, qty: nextQty, stock: maxStock } : item)
      : [...current, { ...product, stock: maxStock, qty: 1 }];
    cartRef.current = nextCart;
    setCart(nextCart);
    if (user?.id) {
      api("/cart/item", { method: "PUT", body: JSON.stringify({ product_id: product.id, quantity: nextQty, selected_size: product.selectedSize || null, selected_color: product.selectedColor || null }) })
        .then((row) => {
          if (!row?.id) return;
          const updated = cartRef.current.map((item) => same(item) ? { ...item, cartItemId: row.id } : item);
          cartRef.current = updated;
          setCart(updated);
        })
        .catch((error) => {
          console.error("Unable to sync cart item", error);
          window.dispatchEvent(new CustomEvent("offgrid-cart-sync-error"));
        });
    }
    setCartOpen(true);
  };
  const toggleWishlist = (id) => { const liked = wishlist.some((item) => String(item) === String(id)); setWishlist((current) => liked ? current.filter((item) => String(item) !== String(id)) : [...current, id]); if (user?.id) { api(`/cart/wishlist/${id}`, { method: liked ? "DELETE" : "PUT" }).catch(() => {}); } };
  const handleNewsletterSubmit = async (e) => { e.preventDefault(); const email = newsletterEmail.trim(); if (!email) return; setNewsletterStatus("loading"); try { await api("/newsletter", { method: "POST", body: JSON.stringify({ email }) }); setNewsletterStatus("success"); setNewsletterEmail(""); } catch { setNewsletterStatus("error"); } };
  const scroll = (id) => { setMenu(false); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };

  const searchSuggestions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    const alias = { tee: "t-shirts", tees: "t-shirts", tshirt: "t-shirts", tshirts: "t-shirts", shirt: "shirts", shirts: "shirts", hoodie: "hoodies", hoodies: "hoodies", cargo: "bottoms", pant: "bottoms", pants: "bottoms", jacket: "jackets", jackets: "jackets", tank: "tank tops" };
    const targetCategory = alias[q] || "";
    const tokens = q.split(/\s+/).filter(Boolean);
    return products.map((p) => { const name = String(p.name || "").toLowerCase(); const category = String(p.category || "").toLowerCase(); const color = String(p.color || "").toLowerCase(); const haystack = [name, category, String(p.gender || ""), color, ...(Array.isArray(p.colors) ? p.colors : []), String(p.fit || ""), String(p.material || "")].join(" ").toLowerCase(); let score = 0; if (haystack.includes(q)) score += 1; if (name.startsWith(q)) score += 5; else if (name.includes(q)) score += 3; if (targetCategory && category === targetCategory) score += 6; if (category.startsWith(q)) score += 3; if (tokens.length > 1 && tokens.every((token) => haystack.includes(token))) score += 3; return score ? { product: p, score } : null; }).filter(Boolean).sort((a, b) => b.score - a.score || Number(b.product.id || 0) - Number(a.product.id || 0)).slice(0, 5).map((item) => item.product);
  }, [products, searchText]);

  const submitSearch = (value = searchText) => { const q = String(value || "").trim(); if (!q) return; setSearchText(q); setSearchOpen(false); setTimeout(() => scroll("shop"), 50); };

  if (location.pathname === "/checkout") return <Checkout cart={cart} setCart={setCart} user={user} onOrder={addOrder} />;
  if (location.pathname === "/order" || location.pathname === "/orders") return <Order orders={orders} onCancel={cancelOrder} loading={ordersLoading} onRefresh={refreshOrders} />;
  if (location.pathname === "/order-success" || location.pathname === "/success") return <Success />;
  if (location.pathname === "/account") return <Account user={user} setUser={setUser} orders={orders} onAuthenticated={mergeGuestCartIntoAccount} />;
  if (location.pathname === "/reset-password") return <ResetPassword />;
  if (location.pathname === "/wishlist") return <><Wishlist products={products} wishlist={wishlist} toggle={toggleWishlist} add={addCart} /><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} user={user} /></>;
  if (location.pathname.startsWith("/track-order/")) return <TrackOrder orders={orders} />;
  if (location.pathname === "/admin") return <Admin user={user} />;
  if (location.pathname === "/gift-cards") return <GiftCards user={user} />;
  if (location.pathname === "/lookbook") return <Lookbook products={products} />;
  if (location.pathname === "/journal") return <Journal />;
  if (location.pathname.startsWith("/journal/")) return <JournalPost />;
  if (location.pathname === "/faq") return <Faq />;
  if (location.pathname.startsWith("/invoice/")) return <Invoice />;
  if (location.pathname === "/contact") return <Contact user={user} />;
  if (["/shipping-policy", "/returns-policy", "/cancellation-policy", "/privacy-policy", "/delete-account", "/cookie-policy", "/terms-of-service"].includes(location.pathname)) {
    return <InfoPage slug={location.pathname.slice(1)} />;
  }
  if (location.pathname.startsWith("/product/")) { const rawId = location.pathname.split("/product/")[1]?.split("/")[0]; const product = products.find((item) => String(item.id) === String(rawId)); const localProduct = PRODUCTS.find((item) => String(item.id) === String(rawId)); const finalProduct = product || localProduct; if (!finalProduct) return <div className="product-not-found-page"><div className="product-not-found-inner"><span>THE OFF GRID</span><h1>PRODUCT NOT<br />FOUND</h1><p>We couldn't find the product you're looking for.</p><button type="button" onClick={() => navigate("/")}>BACK TO SHOP</button></div></div>; return <><ProductDetails product={finalProduct} products={products} add={addCart} wishlist={wishlist} toggle={toggleWishlist} user={user} openCart={() => setCartOpen(true)} /><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} user={user} /></>; }

  return <div className="app">
    <div className="topbar"><span>FREE SHIPPING ON ORDERS ABOVE ₹1,499</span><span>NEW DROPS WEEKLY</span><span>SHIPPING ACROSS INDIA</span></div><header className="navbar"><button className="mobile-menu-btn" type="button" onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={23} /></button><nav className="nav-left"><button type="button" onClick={() => scroll("shop")}>SHOP</button><button type="button" onClick={() => scroll("categories")}>CATEGORIES</button><button type="button" onClick={() => scroll("story")}>STORY</button></nav><button type="button" className="logo" onClick={() => location.pathname !== "/" ? navigate("/") : scroll("home")}><small>THE</small><strong>OFF<em>GRID</em></strong></button><div className="nav-right"><button type="button" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={19} /><span>SEARCH</span></button><button type="button" onClick={() => navigate("/account")} aria-label="Account"><User size={19} /></button>{user && <div className="notif-bell-wrap"><button type="button" onClick={openNotifications} aria-label="Notifications"><Bell size={19} />{unreadCount > 0 && <b>{unreadCount}</b>}</button>{notifOpen && <div className="notif-panel"><div className="notif-panel-head"><span>NOTIFICATIONS</span>{notifications.some((n) => !n.read_at) && <button type="button" onClick={markAllRead}>MARK ALL READ</button>}</div>{notifications.length ? notifications.map((n) => <button type="button" key={n.id} className={`notif-item ${n.read_at ? "" : "unread"}`} onClick={() => readNotification(n)}><span>{n.title}</span><small>{new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</small></button>) : <p className="notif-empty">No notifications yet.</p>}</div>}</div>}{user?.role === "admin" && <button type="button" className="admin-nav-icon" onClick={() => navigate("/admin")} aria-label="Admin panel"><Settings size={19} /></button>}<button type="button" onClick={() => navigate("/wishlist")} aria-label="Wishlist"><Heart size={19} />{wishlist.length > 0 && <b>{wishlist.length}</b>}</button><button type="button" onClick={() => cart.length ? setCartOpen(true) : scroll("shop")} aria-label="Shopping bag"><ShoppingBag size={19} />{cart.length > 0 && <b>{cart.reduce((t, i) => t + Number(i.qty || 1), 0)}</b>}</button></div></header>
    {menu && <div className="mobile-menu"><button type="button" className="mobile-close" onClick={() => setMenu(false)} aria-label="Close menu"><X size={28} /></button><div className="mobile-logo"><small>THE</small><strong>OFF<em>GRID</em></strong></div><div className="mobile-links"><button type="button" onClick={() => { setMenu(false); scroll("shop"); }}>SHOP</button><button type="button" onClick={() => { setMenu(false); scroll("categories"); }}>CATEGORIES</button><button type="button" onClick={() => { setMenu(false); scroll("story"); }}>OUR STORY</button><button type="button" onClick={() => { setMenu(false); navigate("/journal"); }}>JOURNAL</button>{user?.role === "admin" && <button type="button" onClick={() => { setMenu(false); navigate("/admin"); }}>ADMIN</button>}</div><p>NO RULES.<br />JUST STYLE.</p></div>}
    {searchOpen && <div className="search-overlay"><button type="button" className="search-close" onClick={() => { setSearchOpen(false); setSearchText(""); }} aria-label="Close search"><X size={28} /></button><div className="search-inner"><span>SEARCH THE OFF GRID</span><form className="big-search" onSubmit={(e) => { e.preventDefault(); submitSearch(); }}><Search size={25} /><input autoFocus type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search products..." aria-label="Search products" /><button type="submit" aria-label="Submit search"><ArrowRight size={20} /></button></form>{searchText.trim() ? <div className="search-suggestions">{searchSuggestions.length ? <><div className="search-suggestions-label">PRODUCTS</div>{searchSuggestions.map((p) => <button key={p.id} type="button" className="search-suggestion" onClick={() => { setSearchOpen(false); setSearchText(""); navigate(productUrl(p)); }}><img src={p.image} alt="" /><span><strong>{p.name}</strong><small>{p.category} · ₹{Number(p.price || 0).toLocaleString("en-IN")}</small></span><ArrowRight size={15} /></button>)}</> : <div className="search-no-results">NO PRODUCTS FOUND. TRY A DIFFERENT SEARCH.</div>}<button type="button" className="search-view-all" onClick={() => submitSearch()}>VIEW ALL SEARCH RESULTS<ArrowRight size={15} /></button></div> : <div className="search-trending"><span>TRY</span><button type="button" onClick={() => setSearchText("tee")}>TEE</button><button type="button" onClick={() => setSearchText("hoodie")}>HOODIE</button><button type="button" onClick={() => setSearchText("cargo")}>CARGO</button><button type="button" onClick={() => setSearchText("jacket")}>JACKET</button></div>}<p>TYPE TO SEE LIVE PRODUCT SUGGESTIONS</p></div></div>}
    <section className="vexo-hero" id="home">
      <div className="vexo-hero-top"><span>THE OFF GRID® — INDEPENDENT STREETWEAR</span><span>NEW SEASON / 2026</span></div>
      <div className="vexo-hero-title"><span className="vexo-side-label">BUILT FOR YOUR EVERYDAY ROTATION</span><h1>GEAR UP.<br/><em>STAND OUT.</em></h1><p>Streetwear for every version of you.</p><div className="vexo-hero-actions"><button type="button" onClick={() => scroll("shop")}>SHOP THE DROP <ArrowUpRight size={16}/></button><button type="button" className="vexo-quiet-action" onClick={() => scroll("categories")}>EXPLORE COLLECTION <ArrowRight size={15}/></button></div></div>
      <div className="vexo-model-stage">
        <div className="vexo-orbit vexo-orbit-one"></div><div className="vexo-orbit vexo-orbit-two"></div>
        <div className="vexo-model-image"><img src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1100&q=90" alt="The Off Grid streetwear collection"/></div>
        <div className="vexo-floating-card vexo-card-left"><span>01 / THE DAILY EDIT</span><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=480&q=85" alt="Streetwear look"/><strong>FIND YOUR<br/>OWN UNIFORM.</strong></div>
        <div className="vexo-floating-card vexo-card-right"><span>JUST DROPPED ↗</span><img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=480&q=85" alt="New season apparel"/><strong>MADE TO<br/>MOVE DIFFERENT.</strong></div>
        <div className="vexo-round-badge">OFF<br/>THE<br/>GRID<span>®</span></div>
      </div>
      <div className="vexo-hero-bottom"><span>01 — 04 / NEW COLLECTION</span><span>DESIGNED INDEPENDENTLY · WORN YOUR WAY</span><button type="button" onClick={() => scroll("categories")}>SCROLL TO DISCOVER ↓</button></div>
    </section>
    <div className="marquee"><div>NOT MADE FOR EVERYONE <span>✦</span> MADE FOR YOU <span>✦</span> OFF THE GRID <span>✦</span> NEW DROP <span>✦</span> NOT MADE FOR EVERYONE <span>✦</span></div></div>
    <section className="manifesto section" id="story"><div className="manifesto-top"><span>01 / OUR POINT OF VIEW</span><span>EST. FOR THE UNCONVENTIONAL</span></div><div className="manifesto-main"><h2>STYLE IS<br/>A <em>CHOICE.</em><br/>NOT A <em>RULE.</em></h2><div className="manifesto-aside"><span className="manifesto-mark">OG—01</span><p>The Off Grid is an independent clothing label for people who trust their own instinct. Less noise. Better essentials. A little rebellion in the details.</p><button type="button" className="manifesto-link" onClick={() => navigate("/lookbook")}>VIEW THE LOOKBOOK <ArrowUpRight size={16}/></button></div></div><div className="manifesto-footer"><span>01 / INDIVIDUALITY</span><span>02 / EVERYDAY QUALITY</span><span>03 / NO UNNECESSARY RULES</span></div></section>
    <section className="category-editorial section" id="categories"><div className="editorial-heading"><div><span>02 / FIND YOUR FORM</span><h2>BUILT AROUND<br/><em>YOUR ROTATION.</em></h2></div><p>Pieces that work together.<br/>Made to move with you.</p></div><div className="editorial-categories"><Category title="TEES" number="01" image={products[0]?.image || PRODUCTS[0]?.image} click={() => { setActiveCategory("T-SHIRTS"); scroll("shop"); }} /><Category title="SHIRTS" number="02" image={products[1]?.image || PRODUCTS[1]?.image} click={() => { setActiveCategory("SHIRTS"); scroll("shop"); }} /><Category title="BOTTOMS" number="03" image={products[2]?.image || PRODUCTS[2]?.image} click={() => { setActiveCategory("BOTTOMS"); scroll("shop"); }} /><Category title="HOODIES" number="04" image={products[3]?.image || PRODUCTS[3]?.image} click={() => { setActiveCategory("HOODIES"); scroll("shop"); }} /></div><div className="category-note"><span>FOUR STARTING POINTS.</span><span>INFINITE WAYS TO MAKE IT YOURS ↗</span></div></section>
    <section className="offgrid-campaign" aria-label="The Off Grid campaign">
      <div className="offgrid-campaign-copy"><span className="og-eyebrow">03 / THE EVERYDAY EXPERIMENT</span><h2>NOT HERE<br/>TO <i>BLEND IN.</i></h2><p>Distinct pieces. Uncomplicated fits. A wardrobe that moves on your terms.</p><button type="button" onClick={() => scroll("shop")}>EXPLORE THE COLLECTION <ArrowUpRight size={17}/></button><small>THE OFF GRID® — INDEPENDENT BY DESIGN</small></div>
      <div className="offgrid-campaign-art"><div className="og-art-backdrop"></div><img className="og-art-main" src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=90" alt="Independent streetwear campaign"/><img className="og-art-detail" src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=600&q=85" alt="Streetwear details"/><span className="og-art-index">OG / 026</span><span className="og-art-caption">OWN YOUR<br/>OWN PACE.</span></div>
      <div className="og-campaign-foot"><span>DESIGNED FOR THE UNCONVENTIONAL</span><span>01 — 04 / COLLECTION NOTES</span></div>
    </section>
    <section className="shop section" id="shop"><ProductDiscovery products={products} add={addCart} wishlist={wishlist} toggle={toggleWishlist} initialCategory={activeCategory} searchText={searchText} setSearchText={setSearchText} /></section>
    {recentlyViewed.length > 0 && <section className="recently-viewed section"><div className="recently-viewed-head"><div><span>YOUR BROWSING HISTORY</span><h2>BACK IN YOUR <em>ROTATION.</em></h2></div><button type="button" onClick={() => setRecentlyViewed([])}>CLEAR HISTORY <X size={14}/></button></div><div className="recently-viewed-grid">{recentlyViewed.slice(0,4).map((p) => <div key={p.id} className="recently-viewed-card"><button type="button" className="recently-viewed-image" onClick={() => navigate(productUrl(p))}><img src={p.image} alt={p.name} loading="lazy"/><span>VIEW AGAIN <ArrowUpRight size={14}/></span></button><div><span>{p.category || "THE OFF GRID"}</span><strong>{p.name}</strong><b>₹{Number(p.price || 0).toLocaleString("en-IN")}</b></div></div>)}</div></section>}
    <section className="offgrid-edit">
      <div className="offgrid-edit-head"><div><span className="og-eyebrow">04 / THE ROTATION, REWORKED</span><h2>GOOD PIECES.<br/><i>NO RULES.</i></h2></div><p>Build a wardrobe that feels like<br/>you — one considered piece at a time.</p></div>
      <div className="offgrid-edit-grid">
        <button type="button" className="og-edit-card og-edit-large" onClick={() => { setActiveCategory("T-SHIRTS"); scroll("shop"); }}><img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=85" alt="Everyday essentials"/><span>01 / EVERYDAY ESSENTIALS</span><strong>THE<br/>FOUNDATION <ArrowUpRight/></strong></button>
        <button type="button" className="og-edit-card" onClick={() => { setActiveCategory("BOTTOMS"); scroll("shop"); }}><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85" alt="Streetwear styling" loading="lazy" decoding="async"/><span>02 / MAKE IT YOURS</span><strong>OWN<br/>THE LOOK <ArrowUpRight/></strong></button>
        <div className="og-edit-note"><span>THE OFF GRID CODE</span><p>Less noise.<br/>More <i>you.</i></p><small>WEAR WHAT MOVES YOU.</small></div>
      </div>
    </section>
    <section className="type-break"><div className="type-break-top"><span>05 / THE OFF GRID CODE</span><span>NO UNIFORM RULEBOOK</span></div><h2>OWN YOUR<br/><em>ORDINARY.</em></h2><div className="type-break-bottom"><p>Good style isn't loud.<br/>It just knows what it is.</p><button type="button" onClick={() => scroll("shop")}>FIND YOUR NEXT EVERYDAY PIECE <ArrowUpRight size={17}/></button></div></section>
    <section className="journal section" id="journal"><div className="journal-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90" alt="The Off Grid journal" /></div><div className="journal-content"><span>06 / JOURNAL</span><h2>THE OFF GRID<br /><em>STATE OF MIND.</em></h2><p>Style is not about following a formula. It's about building a uniform that feels like you.</p><button type="button" className="under-btn" onClick={() => navigate("/journal")}>READ THE JOURNAL <ArrowUpRight size={15} /></button></div></section>
    <section className="newsletter"><div><span>07 / STAY IN THE LOOP</span><h2>DON'T MISS<br /><em>THE DROP.</em></h2></div><form onSubmit={handleNewsletterSubmit}><label>EMAIL ADDRESS</label><div><input type="email" required placeholder="YOUR EMAIL" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} /><button type="submit" disabled={newsletterStatus === "loading"}><ArrowRight /></button></div>{newsletterStatus === "success" && <small>YOU'RE ON THE LIST.</small>}{newsletterStatus === "error" && <small>COULD NOT SUBSCRIBE. TRY AGAIN.</small>}</form></section>
    <footer><div className="footer-grid"><div className="footer-brand"><small>THE</small><strong>OFF<em>GRID</em></strong><p>Independent clothing for independent minds.</p></div><div><h4>SHOP</h4><button onClick={() => { setActiveCategory("ALL"); scroll("shop"); }}>ALL PRODUCTS</button>{[...new Set(products.map((p) => p.category).filter(Boolean))].map((cat) => <button key={cat} onClick={() => { setActiveCategory(cat); scroll("shop"); }}>{cat}</button>)}</div><div><h4>ACCOUNT</h4><button onClick={() => navigate("/account")}>MY ACCOUNT</button><button onClick={() => navigate("/orders")}>ORDERS</button><button onClick={() => navigate("/wishlist")}>WISHLIST</button><button onClick={() => navigate("/gift-cards")}>GIFT CARDS</button></div><div><h4>SUPPORT</h4><button onClick={() => navigate("/contact")}>CONTACT US</button><button onClick={() => navigate("/faq")}>FAQ</button><button onClick={() => navigate("/shipping-policy")}>SHIPPING POLICY</button><button onClick={() => navigate("/returns-policy")}>RETURN & REFUND POLICY</button><button onClick={() => navigate("/cancellation-policy")}>CANCELLATION POLICY</button></div><div><h4>LEGAL</h4><button onClick={() => navigate("/privacy-policy")}>PRIVACY POLICY</button><button onClick={() => navigate("/delete-account")}>DELETE ACCOUNT</button><button onClick={() => navigate("/cookie-policy")}>COOKIE POLICY</button><button onClick={() => navigate("/terms-of-service")}>TERMS & CONDITIONS</button><button onClick={() => navigate("/lookbook")}>LOOKBOOK</button><button onClick={() => navigate("/journal")}>JOURNAL</button><a href="https://instagram.com/theoffgrid.in" target="_blank" rel="noreferrer"><Instagram size={16}/> INSTAGRAM</a><a href="https://youtube.com" target="_blank" rel="noreferrer"><Youtube size={16}/> YOUTUBE</a></div></div><div className="footer-bottom"><span>© 2026 THE OFF GRID</span><span>MADE FOR YOU.</span></div></footer>
    {cart.length > 0 && <button className="floating-bag" type="button" onClick={() => setCartOpen(true)}><ShoppingBag size={17}/> BAG · {cart.reduce((t, i) => t + Number(i.qty || 1), 0)}</button>}
    <a className="floating-whatsapp" href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "911234567890").replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I have a question about my order")}`} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M17.6 6.3A8.86 8.86 0 0 0 12.05 3.8a8.94 8.94 0 0 0-7.7 13.4L3 21l3.9-1.3a8.9 8.9 0 0 0 5.14 1.6h.01a8.94 8.94 0 0 0 8.94-8.94A8.86 8.86 0 0 0 17.6 6.3ZM12.05 19.5a7.4 7.4 0 0 1-3.78-1.03l-.27-.16-2.32.77.78-2.27-.17-.29a7.44 7.44 0 1 1 13.83-3.85 7.45 7.45 0 0 1-7.44 6.83Zm4.08-5.57c-.22-.11-1.32-.65-1.53-.73-.2-.08-.35-.11-.5.11-.15.22-.58.73-.71.87-.13.15-.26.16-.48.05-.22-.11-.94-.35-1.79-1.11-.66-.59-1.11-1.32-1.24-1.54-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.21-.69-1.65-.18-.44-.37-.38-.5-.38-.13 0-.28-.02-.43-.02-.15 0-.39.06-.6.28-.2.22-.79.77-.79 1.87 0 1.1.81 2.17.92 2.32.11.15 1.6 2.44 3.88 3.42.54.23.97.37 1.3.48.55.17 1.04.15 1.44.09.44-.07 1.32-.54 1.5-1.06.19-.52.19-.96.13-1.06-.06-.09-.2-.15-.42-.26Z"/></svg></a>
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} user={user} />
  </div>;
}

function Category({ title, number, image, click }) { return <button type="button" className="category" onClick={click}><img src={image} alt={title} loading="lazy" decoding="async" /><div className="category-overlay"></div><div className="category-info"><span>{number} / CATEGORY <ArrowRight size={13}/></span><h3>{title}</h3></div></button>; }
