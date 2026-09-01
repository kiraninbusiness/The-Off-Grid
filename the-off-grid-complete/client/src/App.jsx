import React,{useEffect,useMemo,useState} from "react";
import {Routes,Route,useNavigate} from "react-router-dom";
import {Search,Heart,ShoppingBag,Menu,X,ArrowRight,ArrowUpRight,ChevronDown,Instagram,User} from "lucide-react";
import {PRODUCTS} from "./data/products";
import ProductCard from "./components/ProductCard";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";
import Success from "./pages/Success";

export default function App(){
 const nav=useNavigate(),[menu,setMenu]=useState(false),[searchOpen,setSearchOpen]=useState(false),[search,setSearch]=useState(""),[category,setCategory]=useState("ALL"),[sort,setSort]=useState("FEATURED");
 const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem("offgrid_cart")||"[]"));
 const [wishlist,setWishlist]=useState(()=>JSON.parse(localStorage.getItem("offgrid_wishlist")||"[]"));
 const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("offgrid_user")||"null"));
 const [orders,setOrders]=useState(()=>JSON.parse(localStorage.getItem("offgrid_orders")||"[]"));
 const [newsletter,setNewsletter]=useState(""),[newsletterMsg,setNewsletterMsg]=useState("");
 useEffect(()=>localStorage.setItem("offgrid_cart",JSON.stringify(cart)),[cart]);
 useEffect(()=>localStorage.setItem("offgrid_wishlist",JSON.stringify(wishlist)),[wishlist]);
 useEffect(()=>localStorage.setItem("offgrid_orders",JSON.stringify(orders)),[orders]);
 const add=p=>setCart(c=>{const i=c.findIndex(x=>String(x.id)===String(p.id)&&String(x.selectedSize||"")===String(p.selectedSize||""));return i<0?[...c,{...p,qty:1}]:c.map((x,k)=>k===i?{...x,qty:Number(x.qty||1)+1}:x)});
 const toggle=id=>setWishlist(w=>w.some(x=>String(x)===String(id))?w.filter(x=>String(x)!==String(id)):[...w,id]);
 const placeOrder=o=>setOrders(x=>[o,...x]);
 const cancelOrder=id=>setOrders(x=>x.map(o=>o.id===id?{...o,status:"cancelled"}:o));
 const submitNews=e=>{e.preventDefault();if(/^\S+@\S+\.\S+$/.test(newsletter)){setNewsletterMsg("YOU'RE ON THE OFF GRID LIST.");setNewsletter("")}else setNewsletterMsg("ENTER A VALID EMAIL.")};
 const scroll=id=>{setMenu(false);setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"}),40)};
 const filtered=useMemo(()=>{let a=[...PRODUCTS];if(category!=="ALL")a=a.filter(p=>p.category===category);if(search.trim()){let q=search.toLowerCase();a=a.filter(p=>`${p.name} ${p.category} ${p.color} ${p.fit}`.toLowerCase().includes(q))}if(sort==="PRICE LOW")a.sort((a,b)=>a.price-b.price);if(sort==="PRICE HIGH")a.sort((a,b)=>b.price-a.price);if(sort==="NAME")a.sort((a,b)=>a.name.localeCompare(b.name));return a},[category,search,sort]);
 return <Routes>
 <Route path="/product/:id" element={<ProductDetails products={PRODUCTS} add={add} wishlist={wishlist} toggle={toggle} user={user}/>}/>
 <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} user={user} onOrder={o=>{placeOrder(o);setCart([])}}/>}/>
 <Route path="/wishlist" element={<Wishlist products={PRODUCTS} wishlist={wishlist} toggle={toggle} add={add}/>}/>
 <Route path="/account" element={<Account user={user} setUser={u=>{setUser(u);if(u)localStorage.setItem("offgrid_user",JSON.stringify(u))}} orders={orders}/>}/>
 <Route path="/orders" element={<Orders orders={orders} onCancel={cancelOrder}/>}/>
 <Route path="/track-order/:id" element={<TrackOrder orders={orders}/>}/>
 <Route path="/success" element={<Success/>}/>
 <Route path="*" element={<Home/>}/>
 </Routes>;

 function Home(){return <div className="app">
 <div className="topbar"><span>FREE SHIPPING ON ORDERS ABOVE ₹1,499</span><span>THE OFF GRID — EST. 2026</span><span>INDIA / WORLDWIDE</span></div>
 <header className="navbar"><button className="mobile-menu-btn" onClick={()=>setMenu(true)}><Menu/></button><nav className="nav-left"><button onClick={()=>scroll("shop")}>SHOP</button><button onClick={()=>scroll("categories")}>CATEGORIES</button><button onClick={()=>scroll("story")}>STORY</button></nav><button className="logo" onClick={()=>scroll("home")}><small>THE</small><strong>OFF GRID</strong></button><div className="nav-right"><button onClick={()=>setSearchOpen(true)}><Search/><span>SEARCH</span></button><button onClick={()=>nav("/account")}><User/></button><button onClick={()=>nav("/wishlist")}><Heart/>{wishlist.length>0&&<b>{wishlist.length}</b>}</button><button onClick={()=>cart.length?nav("/checkout"):scroll("shop")}><ShoppingBag/>{cart.length>0&&<b>{cart.reduce((a,x)=>a+Number(x.qty||1),0)}</b>}</button></div></header>
 {menu&&<div className="mobile-menu"><button className="mobile-close" onClick={()=>setMenu(false)}><X/></button><div className="mobile-logo"><small>THE</small><strong>OFF GRID</strong></div><div className="mobile-links"><button onClick={()=>scroll("shop")}>SHOP</button><button onClick={()=>scroll("categories")}>CATEGORIES</button><button onClick={()=>scroll("story")}>OUR STORY</button><button onClick={()=>scroll("journal")}>JOURNAL</button></div><p>NO RULES.<br/>JUST STYLE.</p></div>}
 {searchOpen&&<div className="search-overlay"><button className="search-close" onClick={()=>{setSearchOpen(false);setSearch("")}}><X/></button><div className="search-inner"><span>SEARCH THE OFF GRID</span><div className="big-search"><Search/><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(setSearchOpen(false),scroll("shop"))} placeholder="Search products..."/></div><p>TRY "TEE", "HOODIE", "CARGO" OR "JACKET"</p></div></div>}
 <section className="hero" id="home"><img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1800&q=90"/><div className="hero-dark"/><div className="hero-content"><span>THE OFF GRID / 001</span><h1>WEAR<br/><i>YOUR</i><br/>WAY<span>.</span></h1><p>Clothing for independent minds.<br/>Clean silhouettes. Strong details.<br/>Zero unnecessary rules.</p><div className="hero-buttons"><button className="orange-btn" onClick={()=>scroll("shop")}>SHOP NEW ARRIVALS <ArrowRight/></button><button className="outline-btn" onClick={()=>scroll("story")}>OUR STORY</button></div></div><div className="hero-bottom"><span>01</span><span>NOT MADE FOR EVERYONE.</span></div></section>
 <div className="marquee"><div>NOT MADE FOR EVERYONE ✦ MADE FOR YOU ✦ OFF THE GRID ✦ NEW DROP ✦ NOT MADE FOR EVERYONE ✦</div></div>
 <section className="story section" id="story"><div className="section-number">01 / THE OFF GRID</div><div className="story-grid"><h2>NOT MADE<br/>FOR <em>EVERYONE.</em></h2><div><p>The Off Grid is an independent clothing label built around individuality. We believe your clothes should reflect your point of view — not somebody else's.</p><button className="under-btn" onClick={()=>scroll("journal")}>DISCOVER OUR STORY <ArrowRight/></button></div></div><div className="benefits"><div><strong>01</strong><h3>FAST SHIPPING</h3><p>Across India</p></div><div><strong>02</strong><h3>QUALITY FIRST</h3><p>Every piece checked</p></div><div><strong>03</strong><h3>EASY RETURNS</h3><p>Simple & transparent</p></div></div></section>
 <section className="categories section" id="categories"><div className="section-title"><div><span>EXPLORE</span><h2>FIND YOUR<br/><em>CATEGORY.</em></h2></div><div className="round-arrow">↓</div></div><div className="category-grid">{[["TEES","01","T-SHIRTS",0],["SHIRTS","02","SHIRTS",1],["BOTTOMS","03","BOTTOMS",2],["HOODIES","04","HOODIES",3]].map(([t,n,c,i])=><button className="category" key={t} onClick={()=>{setCategory(c);scroll("shop")}}><img src={PRODUCTS[i].image}/><div className="category-overlay"/><div className="category-info"><small>{n}</small><h3>{t}</h3><span>SHOP NOW <ArrowRight/></span></div></button>)}</div></section>
 <section className="shop section" id="shop"><div className="section-title shop-title"><div><span>02 / NEW DROP</span><h2>EVERYDAY<br/><em>ESSENTIALS.</em></h2></div><p>BUILT FOR REPEAT WEAR.</p></div><div className="shop-controls"><div className="category-filters">{["ALL","T-SHIRTS","SHIRTS","HOODIES","BOTTOMS","JACKETS","ACCESSORIES","FOOTWEAR"].map(c=><button className={category===c?"active":""} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="sort-wrapper"><span>SORT BY</span><div><select value={sort} onChange={e=>setSort(e.target.value)}><option>FEATURED</option><option>PRICE LOW</option><option>PRICE HIGH</option><option>NAME</option></select><ChevronDown/></div></div></div><div className="products">{filtered.length?filtered.map(p=><ProductCard key={p.id} p={p} add={add} wish={wishlist} toggle={toggle}/>):<div className="empty-box"><h2>NOTHING HERE.</h2><button className="orange-btn" onClick={()=>{setCategory("ALL");setSearch("")}}>VIEW ALL PRODUCTS</button></div>}</div><div className="shop-count">SHOWING <strong>{filtered.length}</strong> OF <strong>{PRODUCTS.length}</strong> PRODUCTS</div></section>
 <section className="statement"><span>03</span><h2>YOUR STYLE<br/>DOESN'T NEED<br/><em>PERMISSION.</em></h2></section>
 <section className="journal section" id="journal"><div className="journal-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90"/></div><div className="journal-content"><span>THE JOURNAL / 001</span><h2>THE ART OF<br/><em>STANDING OUT.</em></h2><p>Trends disappear. Personal style stays. Build a wardrobe that feels like you.</p><button className="orange-btn" onClick={()=>alert("The Off Grid Journal is coming soon.")}>READ JOURNAL <ArrowRight/></button></div></section>
 <section className="newsletter"><div><span>JOIN THE OFF GRID</span><h2>GET IN.<br/><em>STAY DIFFERENT.</em></h2></div><form onSubmit={submitNews}><label>EMAIL ADDRESS</label><div><input type="email" value={newsletter} onChange={e=>setNewsletter(e.target.value)} placeholder="you@example.com" required/><button><ArrowRight/></button></div><small>{newsletterMsg||"NEW DROPS. LIMITED EDITS. ZERO SPAM."}</small></form></section>
 <footer><div className="footer-grid"><div className="footer-brand"><small>THE</small><strong>OFF GRID</strong><p>Independent clothing for independent minds.<br/>Est. 2026 / India.</p></div><div><h4>SHOP</h4><button onClick={()=>{setCategory("ALL");scroll("shop")}}>NEW ARRIVALS</button><button onClick={()=>{setCategory("T-SHIRTS");scroll("shop")}}>TEES</button><button onClick={()=>{setCategory("SHIRTS");scroll("shop")}}>SHIRTS</button><button onClick={()=>{setCategory("BOTTOMS");scroll("shop")}}>BOTTOMS</button></div><div><h4>INFO</h4><button onClick={()=>alert("Shipping across India.")}>SHIPPING</button><button onClick={()=>alert("Easy and transparent returns.")}>RETURNS</button><button onClick={()=>alert("Contact: hello@theoffgrid.in")}>CONTACT</button><button onClick={()=>alert("Privacy policy coming soon.")}>PRIVACY</button></div><div><h4>FOLLOW</h4><a href="https://instagram.com/theoffgrid.in" target="_blank">INSTAGRAM</a><a href="https://youtube.com" target="_blank">YOUTUBE</a></div></div><div className="footer-bottom"><span>© 2026 THE OFF GRID</span><span>MADE WITH INTENT.</span><span>INDIA</span></div></footer>
 {cart.length>0&&<button className="floating-bag" onClick={()=>nav("/checkout")}><ShoppingBag/><span>{cart.reduce((a,x)=>a+Number(x.qty||1),0)} ITEMS</span><ArrowUpRight/></button>}
 </div>}
}
