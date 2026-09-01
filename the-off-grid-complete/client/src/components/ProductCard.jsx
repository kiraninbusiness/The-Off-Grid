import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {Heart,ShoppingBag,Eye,X,Check,ArrowRight} from "lucide-react";
const money=n=>`₹${Number(n||0).toLocaleString("en-IN")}`;
export default function ProductCard({p,add,wish=[],toggle}) {
  const [added,setAdded]=useState(false),[quick,setQuick]=useState(false);
  const liked=wish.some(x=>String(x)===String(p.id));
  const discount=p.old_price?Math.round((p.old_price-p.price)/p.old_price*100):0;
  const handleAdd=e=>{e.preventDefault();if(!p.stock)return;add({...p,selectedSize:null});setAdded(true);setTimeout(()=>setAdded(false),1200)};
  return <><article className="product-card">
    <div className="product-image-wrap">
      <Link to={`/product/${p.id}`} className="product-image"><img src={p.image} alt={p.name}/></Link>
      <div className="product-badges">{discount>0&&<span className="badge sale">-{discount}%</span>}{!p.stock&&<span className="badge sold">SOLD OUT</span>}</div>
      <button className={`wishlist-button ${liked?"active":""}`} onClick={()=>toggle(p.id)}><Heart size={17} fill={liked?"currentColor":"none"}/></button>
      <button className="quick-view-button" onClick={()=>setQuick(true)}><Eye size={14}/> QUICK VIEW</button>
    </div>
    <div className="product-content">
      <div className="product-info"><div><div className="product-category">{p.category} · {p.gender}</div><h3><Link to={`/product/${p.id}`}>{p.name}</Link></h3></div>
      <div className="product-price"><strong>{money(p.price)}</strong>{p.old_price&&<del>{money(p.old_price)}</del>}</div></div>
      <div className="product-meta">{p.color&&<span>{p.color}</span>}{p.fit&&<span>{p.fit}</span>}</div>
      <button className={`product-add-button ${added?"added":""}`} disabled={!p.stock} onClick={handleAdd}>{added?<><Check size={15}/> ADDED</>:<><ShoppingBag size={15}/>{p.stock?"ADD TO BAG":"SOLD OUT"}</>}</button>
    </div>
  </article>
  {quick&&<QuickView p={p} liked={liked} close={()=>setQuick(false)} add={add} toggle={toggle}/>}</>
}
function QuickView({p,liked,close,add,toggle}) {
 const nav=useNavigate(),[added,setAdded]=useState(false),discount=p.old_price?Math.round((p.old_price-p.price)/p.old_price*100):0;
 return <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&close()}><div className="quick-modal"><button className="modal-x" onClick={close}><X/></button><img src={p.image} alt={p.name}/><div><div className="product-category">{p.category} · {p.gender}</div><h2>{p.name}</h2><div className="quick-price"><strong>{money(p.price)}</strong>{p.old_price&&<del>{money(p.old_price)}</del>}<span>{discount?`SAVE ${discount}%`:""}</span></div><p>{p.description}</p><div className="quick-meta"><b>COLOR <span>{p.color}</span></b><b>FIT <span>{p.fit}</span></b><b>SIZE <span>{p.size}</span></b></div><div className="quick-actions"><button className="product-add-button" disabled={!p.stock} onClick={()=>{add(p);setAdded(true);setTimeout(()=>setAdded(false),1200)}}>{added?"ADDED":"ADD TO BAG"}</button><button className={`product-detail-wishlist ${liked?"active":""}`} onClick={()=>toggle(p.id)}><Heart fill={liked?"currentColor":"none"}/></button></div><button className="text-button" onClick={()=>nav(`/product/${p.id}`)}>VIEW FULL DETAILS <ArrowRight size={15}/></button></div></div></div>
}
const money=n=>`₹${Number(n||0).toLocaleString("en-IN")}`;
