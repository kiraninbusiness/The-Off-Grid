import React, { useRef, useState } from "react";
import { Truck, RotateCcw } from "lucide-react";
import { api } from "../api";

export default function DeliveryCheck() {
 const [pin,setPin]=useState("");
 const [result,setResult]=useState(null);
 const [status,setStatus]=useState("idle");
 const [err,setErr]=useState("");
 const requestId=useRef(0);

 const check=async(e)=>{
  e.preventDefault();
  const request=++requestId.current;
  const value=pin.trim();
  if(!/^[1-9]\d{5}$/.test(value)){setErr("ENTER A VALID 6-DIGIT PINCODE");setResult(null);setStatus("idle");return;}
  setErr("");setResult(null);setStatus("loading");
  try{
   const estimate=await api(`/orders/delivery-estimate?pincode=${encodeURIComponent(value)}`);
   if(request!==requestId.current)return;
   setResult(estimate);setStatus("success");
  }catch(error){
   if(request!==requestId.current)return;
   setErr(error.message||"WE COULDN'T CHECK THIS PINCODE. TRY AGAIN.");
   setStatus("error");
  }
 };

 return <div className="delivery-check">
  <div className="delivery-check-title"><Truck size={16}/><span>CHECK DELIVERY ESTIMATE</span></div>
  <form onSubmit={check}>
   <input value={pin} maxLength={6} inputMode="numeric" autoComplete="postal-code" placeholder="ENTER 6-DIGIT PINCODE" aria-label="Delivery pincode" onChange={e=>{requestId.current++;setPin(e.target.value.replace(/\D/g,""));setResult(null);setStatus("idle");if(err)setErr("");}}/>
   <button type="submit" disabled={status==="loading"}>{status==="loading"?"CHECKING...":"CHECK"}</button>
  </form>
  {err&&<p className="delivery-check-error" role="alert">{err}</p>}
  {result&&<div className="delivery-check-result" role="status">
   <p><strong>Estimated delivery: {result.label}</strong></p>
   <p>{result.estimated_days} · {result.zone==="metro"?"Metro zone":result.zone==="remote"?"Remote zone":"Standard zone"}</p>
   <p className="delivery-check-cod"><RotateCcw size={13}/> {result.note}</p>
  </div>}
 </div>;
}
