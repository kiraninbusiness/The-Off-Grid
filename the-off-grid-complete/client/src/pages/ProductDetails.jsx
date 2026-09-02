import React,{useEffect,useMemo,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ArrowLeft,Heart,ShoppingBag,Truck,ShieldCheck,RotateCcw,Minus,Plus,Bell,ZoomIn,Check,ChevronLeft,ChevronRight,Ruler} from "lucide-react";
import SizeGuideModal from "../components/SizeGuideModal";
import ProductReviews from "../components/ProductReviews";
import RelatedProducts from "../components/RelatedProducts";
import RecentlyViewed,{trackRecentlyViewed} from "../components/RecentlyViewed";
import DeliveryCheck from "../components/DeliveryCheck";
import {api} from "../api";
import {PRODUCTS} from "../data/products.js";

const money=n=>`₹${Number(n||0).toLocaleString("en-IN")}`;
const colorClass=(c)=>String(c||"").toLowerCase().replace(/[^a-z0-9]+/g,"-");

export default function ProductDetails({product,products=PRODUCTS,add,wishlist=[],toggle,user}){
 const nav=useNavigate();
 const [qty,setQty]=useState(1),[size,setSize]=useState(""),[color,setColor]=useState(product?.color||""),[guide,setGuide]=useState(false),[zoom,setZoom]=useState(false),[imageIndex,setImageIndex]=useState(0);
 const [notifyEmail,setNotifyEmail]=useState(""),[notifyStatus,setNotifyStatus]=useState("idle");
 useEffect(()=>{if(product)trackRecentlyViewed(product.id)},[product?.id]);
 useEffect(()=>{setSize("");setColor(product?.color||"");setImageIndex(0);setQty(1)},[product?.id]);
 if(!product)return <div className="product-not-found-page"><div><span>THE OFF GRID</span><h1>PRODUCT NOT<br/>FOUND</h1><p>We couldn't find the product you're looking for.</p><button className="orange-btn" onClick={()=>nav("/")}>BACK TO SHOP</button></div></div>;
 const images=useMemo(()=>Array.from(new Set([product.image,...(Array.isArray(product.images)?product.images:[])].filter(Boolean))),[product]);
 const sizes=Array.isArray(product.sizes)&&product.sizes.length?product.sizes:String(product.size||"").split("/").map(x=>x.trim()).filter(Boolean);
 const colors=Array.isArray(product.colors)&&product.colors.length?product.colors:[product.color].filter(Boolean);
 const liked=wishlist.some(x=>String(x)===String(product.id));
 const discount=product.old_price?Math.round((Number(product.old_price)-Number(product.price))/Number(product.old_price)*100):0;
 const related=products.filter(p=>String(p.id)!==String(product.id)).sort((a,b)=>(a.category===product.category?0:1)-(b.category===product.category?0:1)).slice(0,3);
 const addNow=()=>{if(!product.stock)return;if(sizes.length&&!size){alert("PLEASE SELECT A SIZE");return}for(let i=0;i<qty;i++)add({...product,selectedSize:size||null,selectedColor:color||null});nav("/checkout")};
 const notifyMe=async e=>{e.preventDefault();if(!/^\S+@\S+\.\S+$/.test(notifyEmail.trim())){setNotifyStatus("error");return}setNotifyStatus("loading");try{await api(`/products/${product.id}/notify`,{method:"POST",body:JSON.stringify({email:notifyEmail.trim()})});setNotifyStatus("success")}catch{setNotifyStatus("error")}};
 const prev=()=>setImageIndex(i=>(i-1+images.length)%images.length),next=()=>setImageIndex(i=>(i+1)%images.length);
 return <div className="product-details-page">
  <header className="product-details-header"><button className="product-back" onClick={()=>nav(-1)}><ArrowLeft size={18}/> BACK TO SHOP</button><Link to="/" className="product-details-logo"><small>THE</small><strong>OFF GRID</strong></Link><span>PRODUCT / {String(product.id).padStart(2,"0")}</span></header>
  <main className="product-details-main product-details-premium">
   <div className="product-gallery">
    <div className="product-gallery-thumbs">{images.map((src,i)=><button key={src+i} className={i===imageIndex?"active":""} onClick={()=>setImageIndex(i)}><img src={src} alt={`${product.name} view ${i+1}`}/></button>)}</div>
    <div className="product-details-image product-gallery-main"><img src={images[imageIndex]} alt={product.name} onClick={()=>setZoom(true)}/><button className="gallery-zoom" onClick={()=>setZoom(true)}><ZoomIn size={15}/> ZOOM</button><button className="gallery-arrow gallery-prev" onClick={prev} aria-label="Previous image"><ChevronLeft/></button><button className="gallery-arrow gallery-next" onClick={next} aria-label="Next image"><ChevronRight/></button><div className="product-details-image-badge">{discount>0&&<span>-{discount}%</span>}<span>{product.condition}</span></div></div>
   </div>
   <div className="product-details-info"><div className="product-details-number">01 / THE OFF GRID</div><div className="product-details-category">{product.category} · {product.gender}</div><h1>{product.name}</h1><div className="product-details-price"><strong>{money(product.price)}</strong>{product.old_price&&<del>{money(product.old_price)}</del>}{discount>0&&<span>SAVE {discount}%</span>}</div><p className="product-details-description">{product.description}</p>
    <div className="product-details-specs"><div><span>COLOR</span><strong>{color||product.color}</strong></div><div><span>FIT</span><strong>{product.fit}</strong></div><div><span>MATERIAL</span><strong>{product.material||"Premium fabric"}</strong></div></div>
    {colors.length>1&&<div className="product-option-section"><div className="product-size-title"><span>SELECT COLOR</span><strong>{color}</strong></div><div className="product-color-options">{colors.map(c=><button key={c} className={color===c?"active":""} onClick={()=>setColor(c)}><i className={`swatch swatch-${colorClass(c)}`}></i>{c}{color===c&&<Check size={13}/>}</button>)}</div></div>}
    {sizes.length>0&&<div className="product-size-section"><div className="product-size-title"><span>SELECT SIZE</span><button className="link-like" onClick={()=>setGuide(true)}><Ruler size={13}/> SIZE GUIDE</button></div><div className="product-size-buttons">{sizes.map(s=><button key={s} className={size===s?"active":""} onClick={()=>setSize(s)}>{s}</button>)}</div><p className="fit-helper">{product.fit} FIT · {product.model||"Check the size guide for measurements"}</p></div>}
    <div className="product-buy-row"><div className="product-quantity"><button onClick={()=>setQty(q=>Math.max(1,q-1))}><Minus size={15}/></button><span>{qty}</span><button onClick={()=>setQty(q=>Math.min(Number(product.stock||1),q+1))}><Plus size={15}/></button></div><button className={`product-detail-wishlist ${liked?"active":""}`} onClick={()=>toggle(product.id)}><Heart fill={liked?"currentColor":"none"}/></button></div>
    <button className="product-detail-add" disabled={!product.stock} onClick={addNow}>{product.stock?"ADD TO BAG":"SOLD OUT"}<ShoppingBag size={19}/></button><p className="product-stock">{product.stock<=5&&product.stock>0?`ONLY ${product.stock} LEFT`:product.stock?`${product.stock} AVAILABLE`:`CURRENTLY OUT OF STOCK`}</p>
    {!product.stock&&<form className="notify-me" onSubmit={notifyMe}><div className="notify-me-title"><Bell size={15}/><span>NOTIFY ME WHEN BACK IN STOCK</span></div>{notifyStatus==="success"?<p className="notify-me-success">You're on the list — we'll email you the moment it's back.</p>:<><div className="notify-me-row"><input type="email" placeholder="YOUR EMAIL" value={notifyEmail} onChange={e=>{setNotifyEmail(e.target.value);if(notifyStatus==="error")setNotifyStatus("idle")}}/><button type="submit" disabled={notifyStatus==="loading"}>{notifyStatus==="loading"?"...":"NOTIFY ME"}</button></div>{notifyStatus==="error"&&<p className="notify-me-error">Enter a valid email address.</p>}</>}</form>}
    <DeliveryCheck/>
    <div className="product-benefits"><div><Truck/><b>FAST SHIPPING<small>Across India</small></b></div><div><ShieldCheck/><b>QUALITY FIRST<small>Every piece checked</small></b></div><div><RotateCcw/><b>EASY RETURNS<small>Simple & transparent</small></b></div></div>
   </div>
  </main>
  <section className="product-details-extra product-story-grid"><div><span>THE OFF GRID / DETAILS</span><h2>BUILT FOR<br/><em>REPEAT WEAR.</em></h2></div><div><p>{product.description}</p><div className="product-detail-points">{(product.details||[]).map(x=><div key={x}>✓ {x}</div>)}</div><p><strong>MATERIAL</strong><br/>{product.material||"Premium fabric selected for everyday wear."}</p></div></section>
  <ProductReviews productId={product.id} user={user}/><RelatedProducts current={product} products={related}/><RecentlyViewed current={product} products={products}/><div className="product-details-bottom"><button onClick={()=>nav("/")}>← CONTINUE SHOPPING</button></div>
  {guide&&<SizeGuideModal onClose={()=>setGuide(false)} product={product}/>} {zoom&&<div className="product-zoom-overlay" onClick={e=>e.target===e.currentTarget&&setZoom(false)}><button onClick={()=>setZoom(false)}>CLOSE ×</button><img src={images[imageIndex]} alt={product.name}/></div>}
 </div>;
}
