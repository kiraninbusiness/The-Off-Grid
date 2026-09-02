import React from "react";
import {useParams} from "react-router-dom";
export default function TrackOrder({orders}) {
 const {id}=useParams(),o=orders.find(x=>x.id===id);
 const steps=["pending","processing","shipped","delivered"],cur=o?steps.indexOf(o.status):-1;
 return <div className="page track-page"><div className="page-head"><span>THE OFF GRID / TRACKING</span><h1>TRACK <em>YOUR ORDER.</em></h1></div>{o?<div className="track-card"><h2>{o.id}</h2><div className="tracking-steps">{steps.map((s,i)=><div className={i<=cur?"done":""} key={s}><b>{i+1}</b><span>{s}</span></div>)}</div><p>Shipping to {o.customer.city}, {o.customer.state} · {o.customer.pincode}</p></div>:<div className="empty-box"><h2>ORDER NOT FOUND.</h2></div>}</div>
}
