import React,{useState,useEffect} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {ArrowLeft,Heart,ShoppingBag,Truck,ShieldCheck,RotateCcw,Minus,Plus,Bell} from "lucide-react";
import SizeGuideModal from "../components/SizeGuideModal";
import ProductReviews from "../components/ProductReviews";
import RelatedProducts from "../components/RelatedProducts";
import RecentlyViewed, {trackRecentlyViewed} from "../components/RecentlyViewed";
import DeliveryCheck from "../components/DeliveryCheck";
import {api} from "../api";
import {PRODUCTS} from "../data/products.js";
const money=n=>`₹${Number(n||0).toLocaleString("en-IN")}`;
export default function ProductDetails({products=PRODUCTS,add,wishlist=[],toggle,user}) {
 const {id}=useParams(),nav=useNavigate(),[qty,setQty]=useState(1),[size,setSize]=useState(""),[guide,setGuide]=useState(false);
 const [notifyEmail,setNotifyEmail]=useState(""),[notifyStatus,setNotifyStatus]=useState("idle");
 const product=products.find(p=>String(p.id)===String(id));

 useEffect(()=>{ if(product) trackRecentlyViewed(product.id); },[product?.id]);

 if(!product)return <div className="product-not-found-page"><div><span>THE OFF GRID</span><h1>PRODUCT NOT<br/>FOUND</h1><p>We couldn't find the product you're looking for.</p><button className="orange-btn" onClick={()=>nav("/")}>BACK TO SHOP</button></div></div>;
 const sizes=String(product.size||"").split("/").map(x=>x.trim()).filter(Boolean),liked=wishlist.some(x=>String(x)===String(product.id)),discount=product.old_price?Math.round((product.old_price-product.price)/product.old_price*100):0;
 const addNow=()=>{if(!product.stock)return;if(sizes.length&&!size){alert("PLEASE SELECT A SIZE");return}for(let i=0;i<qty;i++)add({...product,selectedSize:size||null});nav("/checkout")};

 const notifyMe=async(e)=>{
  e.preventDefault();
  if(!/^\S+@\S+\.\S+$/.test(notifyEmail.trim())){setNotifyStatus("error");return}
  setNotifyStatus("loading");
  try{
   await api(`/products/${product.id}/notify`,{method:"POST",body:JSON.stringify({email:notifyEmail.trim()})});
   setNotifyStatus("success");
  }catch{
   setNotifyStatus("error");
  }
 };

 return <div className="product-details-page"><header className="product-details-header"><button className="product-back" onClick={()=>nav(-1)}><ArrowLeft size={18}/> BACK TO SHOP</button><Link to="/" className="product-details-logo"><small>THE</small><strong>OFF GRID</strong></Link><span>PRODUCT / {product.id}</span></header>
 <main className="product-details-main"><div className="product-details-image"><img src={product.image} alt={product.name}/><div className="product-details-image-badge">{discount>0&&<span>-{discount}%</span>}<span>{product.condition}</span></div></div>
 <div className="product-details-info"><div className="product-details-number">01 / THE OFF GRID</div><div className="product-details-category">{product.category} · {product.gender}</div><h1>{product.name}</h1><div className="product-details-price"><strong>{money(product.price)}</strong>{product.old_price&&<del>{money(product.old_price)}</del>}{discount>0&&<span>SAVE {discount}%</span>}</div><p className="product-details-description">{product.description}</p>
 <div className="product-details-specs"><div><span>COLOR</span><strong>{product.color}</strong></div><div><span>FIT</span><strong>{product.fit}</strong></div><div><span>CONDITION</span><strong>{product.condition}</strong></div></div>
 {sizes.length>0&&<div className="product-size-section"><div className="product-size-title"><span>SELECT SIZE</span><button className="link-like" onClick={()=>setGuide(true)}>SIZE GUIDE</button></div><div className="product-size-buttons">{sizes.map(s=><button key={s} className={size===s?"active":""} onClick={()=>setSize(s)}>{s}</button>)}</div></div>}
 <div className="product-buy-row"><div className="product-quantity"><button onClick={()=>setQty(q=>Math.max(1,q-1))}><Minus size={15}/></button><span>{qty}</span><button onClick={()=>setQty(q=>Math.min(Number(product.stock||1),q+1))}><Plus size={15}/></button></div><button className={`product-detail-wishlist ${liked?"active":""}`} onClick={()=>toggle(product.id)}><Heart fill={liked?"currentColor":"none"}/></button></div>
 <button className="product-detail-add" disabled={!product.stock} onClick={addNow}>{product.stock?"ADD TO BAG":"SOLD OUT"}<ShoppingBag size={19}/></button><p className="product-stock">{product.stock<=5&&product.stock>0?`ONLY ${product.stock} LEFT`:product.stock?`${product.stock} AVAILABLE`:"CURRENTLY OUT OF STOCK"}</p>

 {!product.stock&&<form className="notify-me" onSubmit={notifyMe}>
  <div className="notify-me-title"><Bell size={15}/><span>NOTIFY ME WHEN BACK IN STOCK</span></div>
  {notifyStatus==="success"?<p className="notify-me-success">You're on the list — we'll email you the moment it's back.</p>:
  <><div className="notify-me-row"><input type="email" placeholder="YOUR EMAIL" value={notifyEmail} onChange={e=>{setNotifyEmail(e.target.value);if(notifyStatus==="error")setNotifyStatus("idle")}}/><button type="submit" disabled={notifyStatus==="loading"}>{notifyStatus==="loading"?"...":"NOTIFY ME"}</button></div>
  {notifyStatus==="error"&&<p className="notify-me-error">Enter a valid email address.</p>}</>}
 </form>}

 <DeliveryCheck/>

 <div className="product-benefits"><div><Truck/><b>FAST SHIPPING<small>Across India</small></b></div><div><ShieldCheck/><b>QUALITY FIRST<small>Every piece checked</small></b></div><div><RotateCcw/><b>EASY RETURNS<small>Simple & transparent</small></b></div></div></div></main>
 <section className="product-details-extra"><div><span>THE OFF GRID / DETAILS</span><h2>BUILT FOR<br/><em>REPEAT WEAR.</em></h2></div><div><p>{product.description}</p><p>Designed with a focus on clean silhouettes, everyday comfort and effortless styling.</p></div></section>
 <ProductReviews productId={product.id} user={user}/>
 <RelatedProducts current={product} products={products}/>
 <RecentlyViewed current={product} products={products}/>
 <div className="product-details-bottom"><button onClick={()=>nav("/")}>← CONTINUE SHOPPING</button></div>{guide&&<SizeGuideModal onClose={()=>setGuide(false)}/>}</div>
}
