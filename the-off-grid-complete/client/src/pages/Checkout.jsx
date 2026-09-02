import React,{useMemo,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ArrowLeft,Minus,Plus,Trash2,ShieldCheck,Tag} from "lucide-react";
import {api} from "../api";
const money=n=>`₹${Number(n||0).toLocaleString("en-IN")}`;
export default function Checkout({cart,setCart,user,onOrder}) {
 const nav=useNavigate(),[form,setForm]=useState({name:user?.name||"",phone:"",email:user?.email||"",address:"",city:"",state:"Karnataka",pincode:""}),[method,setMethod]=useState("COD"),[loading,setLoading]=useState(false);
 const [couponCode,setCouponCode]=useState(""),[coupon,setCoupon]=useState(null),[couponStatus,setCouponStatus]=useState("idle"),[couponMsg,setCouponMsg]=useState("");
 const total=useMemo(()=>cart.reduce((s,x)=>s+Number(x.price)*Number(x.qty||1),0),[cart]),shipping=total>=1499?0:99;
 const discount=coupon?.discount||0;
 const grand=Math.max(0,total+shipping-discount);
 const change=(i,d)=>setCart(c=>c.map((x,k)=>k===i?{...x,qty:Math.max(1,Math.min(Number(x.stock||99),Number(x.qty||1)+d))}:x));

 const applyCoupon=async(e)=>{
  e.preventDefault();
  if(!couponCode.trim())return;
  setCouponStatus("loading");
  setCouponMsg("");
  try{
   const res=await api("/coupons/validate",{method:"POST",body:JSON.stringify({code:couponCode.trim(),subtotal:total})});
   setCoupon(res);
   setCouponStatus("success");
  }catch(err){
   setCoupon(null);
   setCouponStatus("error");
   setCouponMsg(err.message||"Invalid coupon code");
  }
 };

 const removeCoupon=()=>{setCoupon(null);setCouponCode("");setCouponStatus("idle");setCouponMsg("")};

 const submit=async e=>{
  e.preventDefault();
  if(!cart.length)return;
  setLoading(true);
  await new Promise(r=>setTimeout(r,500));
  const order={
   id:"OG"+Date.now().toString().slice(-8),
   date:new Date().toISOString(),
   items:cart,
   subtotal:total,
   shipping,
   discount,
   coupon:coupon?coupon.code:null,
   total:grand,
   status:"pending",
   payment:method,
   customer:form
  };
  onOrder(order);
  setCart([]);
  setLoading(false);
  nav("/success",{state:{order}});
 };

 return <div className="checkout-page"><header className="simple-header"><Link to="/"><ArrowLeft/> THE OFF GRID</Link><span>SECURE CHECKOUT</span></header><main className="checkout-grid"><section><div className="checkout-title"><span>THE OFF GRID / CHECKOUT</span><h1>YOUR <em>BAG.</em></h1></div>{!cart.length?<div className="empty-box"><h2>YOUR BAG IS EMPTY.</h2><Link className="orange-btn" to="/">SHOP NOW</Link></div>:cart.map((x,i)=><article className="checkout-item" key={`${x.id}-${x.selectedSize||""}`}><img src={x.image}/><div><small>{x.category}</small><h3>{x.name}</h3><p>{x.selectedSize&&`SIZE: ${x.selectedSize}`}</p><strong>{money(x.price)}</strong><div className="quantity-line"><button onClick={()=>change(i,-1)}><Minus/></button><span>{x.qty||1}</span><button onClick={()=>change(i,1)}><Plus/></button><button onClick={()=>setCart(c=>c.filter((_,k)=>k!==i))}><Trash2/></button></div></div></article>)}</section><form className="checkout-form" onSubmit={submit}><h2>DELIVERY</h2>{["name","phone","email","address","city","state","pincode"].map(k=><input key={k} required value={form[k]} placeholder={k.toUpperCase()} type={k==="email"?"email":"text"} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<h2>PAYMENT</h2><div className="payment-options"><button type="button" className={method==="COD"?"active":""} onClick={()=>setMethod("COD")}>CASH ON DELIVERY</button><button type="button" className={method==="ONLINE"?"active":""} onClick={()=>setMethod("ONLINE")}>ONLINE PAYMENT</button></div><p className="payment-note"><ShieldCheck/> Online payment is wired as a safe checkout placeholder; connect Razorpay keys in production.</p>

 <h2>COUPON</h2>
 {coupon?<div className="coupon-applied"><span><Tag size={13}/> {coupon.code} applied</span><button type="button" onClick={removeCoupon}>REMOVE</button></div>:
 <div className="coupon-row"><input value={couponCode} placeholder="ENTER COUPON CODE" onChange={e=>{setCouponCode(e.target.value.toUpperCase());if(couponStatus==="error"){setCouponStatus("idle");setCouponMsg("")}}}/><button type="button" onClick={applyCoupon} disabled={couponStatus==="loading"}>{couponStatus==="loading"?"...":"APPLY"}</button></div>}
 {couponStatus==="error"&&<p className="notify-me-error">{couponMsg}</p>}

 <div className="order-total"><span>SUBTOTAL <b>{money(total)}</b></span><span>SHIPPING <b>{shipping?money(shipping):"FREE"}</b></span>{discount>0&&<span>DISCOUNT <b>-{money(discount)}</b></span>}<strong>TOTAL <b>{money(grand)}</b></strong></div><button className="product-detail-add" disabled={loading||!cart.length}>{loading?"PLACING ORDER...":"PLACE ORDER"}</button></form></main></div>
}
