import React,{useEffect,useState} from "react";
import {Star} from "lucide-react";
const key=id=>`offgrid_reviews_${id}`;
export default function ProductReviews({productId,user}) {
 const [reviews,setReviews]=useState(()=>JSON.parse(localStorage.getItem(key(productId))||"[]"));
 const [rating,setRating]=useState(5),[text,setText]=useState("");
 const save=e=>{e.preventDefault();if(!text.trim())return;const r={id:Date.now(),rating,text:text.trim(),name:user?.name||"OFF GRID CUSTOMER",date:new Date().toLocaleDateString("en-IN")};const next=[r,...reviews];setReviews(next);localStorage.setItem(key(productId),JSON.stringify(next));setText("")};
 const avg=reviews.length?(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1):"0.0";
 return <section className="reviews-section"><div className="section-title"><div><span>PRODUCT / REVIEWS</span><h2>REAL <em>WEAR.</em></h2></div><div className="review-summary"><strong>{avg}</strong><span>{reviews.length} review{reviews.length===1?"":"s"}</span></div></div>
 <form className="review-form" onSubmit={save}><div className="stars-input">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setRating(n)}><Star size={18} fill={n<=rating?"currentColor":"none"}/></button>)}</div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Tell us about the fit, feel and quality..." required/><button className="orange-btn">POST REVIEW</button></form>
 <div className="review-list">{reviews.map(r=><article key={r.id}><div className="stars">{[1,2,3,4,5].map(n=><Star key={n} size={14} fill={n<=r.rating?"currentColor":"none"}/>)}</div><strong>{r.name}</strong><small>{r.date}</small><p>{r.text}</p></article>)}</div></section>
}
