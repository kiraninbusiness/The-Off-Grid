import React,{useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {ArrowLeft,Heart,ShoppingBag,Truck,ShieldCheck,RotateCcw,Minus,Plus} from "lucide-react";
import SizeGuideModal from "../components/SizeGuideModal";
import ProductReviews from "../components/ProductReviews";
import {PRODUCTS} from "../data/products.js";
const money=n=>`₹${Number(n||0).toLocaleString("en-IN")}`;
export default function ProductDetails({products=PRODUCTS,add,wishlist=[],toggle,user}) {
 const {id}=useParams(),nav=useNavigate(),[qty,setQty]=useState(1),[size,setSize]=useState(""),[guide,setGuide]=useState(false);
 const product=products.find(p=>String(p.id)===String(id));
 if(!product)return <div className="product-not-found-page"><div><span>THE OFF GRID</span><h1>PRODUCT NOT<br/>FOUND</h1><p>We couldn't find the product you're looking for.</p><button className="orange-btn" onClick={()=>nav("/")}>BACK TO SHOP</button></div></div>;
 const sizes=String(product.size||"").split("/").map(x=>x.trim()).filter(Boolean),liked=wishlist.some(x=>String(x)===String(product.id)),discount=product.old_price?Math.round((product.old_price-product.price)/product.old_price*100):0;
 const addNow=()=>{if(!product.stock)return;if(sizes.length&&!size){alert("PLEASE SELECT A SIZE");return}for(let i=0;i<qty;i++)add({...product,selectedSize:size||null});nav("/checkout")};
 return <div className="product-details-page"><header className="product-details-header"><button className="product-back" onClick={()=>nav(-1)}><ArrowLeft size={18}/> BACK TO SHOP</button><Link to="/" className="product-details-logo"><small>THE</small><strong>OFF GRID</strong></Link><span>PRODUCT / {product.id}</span></header>
 <main className="product-details-main"><div className="product-details-image"><img src={product.image} alt={product.name}/><div className="product-details-image-badge">{discount>0&&<span>-{discount}%</span>}<span>{product.condition}</span></div></div>
 <div className="product-details-info"><div className="product-details-number">01 / THE OFF GRID</div><div className="product-details-category">{product.category} · {product.gender}</div><h1>{product.name}</h1><div className="product-details-price"><strong>{money(product.price)}</strong>{product.old_price&&<del>{money(product.old_price)}</del>}{discount>0&&<span>SAVE {discount}%</span>}</div><p className="product-details-description">{product.description}</p>
 <div className="product-details-specs"><div><span>COLOR</span><strong>{product.color}</strong></div><div><span>FIT</span><strong>{product.fit}</strong></div><div><span>CONDITION</span><strong>{product.condition}</strong></div></div>
 {sizes.length>0&&<div className="product-size-section"><div className="product-size-title"><span>SELECT SIZE</span><button className="link-like" onClick={()=>setGuide(true)}>SIZE GUIDE</button></div><div className="product-size-buttons">{sizes.map(s=><button key={s} className={size===s?"active":""} onClick={()=>setSize(s)}>{s}</button>)}</div></div>}
 <div className="product-buy-row"><div className="product-quantity"><button onClick={()=>setQty(q=>Math.max(1,q-1))}><Minus size={15}/></button><span>{qty}</span><button onClick={()=>setQty(q=>Math.min(Number(product.stock||1),q+1))}><Plus size={15}/></button></div><button className={`product-detail-wishlist ${liked?"active":""}`} onClick={()=>toggle(product.id)}><Heart fill={liked?"currentColor":"none"}/></button></div>
 <button className="product-detail-add" disabled={!product.stock} onClick={addNow}>{product.stock?"ADD TO BAG":"SOLD OUT"}<ShoppingBag size={19}/></button><p className="product-stock">{product.stock<=5?`ONLY ${product.stock} LEFT`:`${product.stock} AVAILABLE`}</p>
 <div className="product-benefits"><div><Truck/><b>FAST SHIPPING<small>Across India</small></b></div><div><ShieldCheck/><b>QUALITY FIRST<small>Every piece checked</small></b></div><div><RotateCcw/><b>EASY RETURNS<small>Simple & transparent</small></b></div></div></div></main>
 <section className="product-details-extra"><div><span>THE OFF GRID / DETAILS</span><h2>BUILT FOR<br/><em>REPEAT WEAR.</em></h2></div><div><p>{product.description}</p><p>Designed with a focus on clean silhouettes, everyday comfort and effortless styling.</p></div></section><ProductReviews productId={product.id} user={user}/><div className="product-details-bottom"><button onClick={()=>nav("/")}>← CONTINUE SHOPPING</button></div>{guide&&<SizeGuideModal onClose={()=>setGuide(false)}/>}</div>
}
