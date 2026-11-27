import React,{useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Share2,Copy,Check,Heart} from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function Wishlist({products=[],wishlist=[],toggle,add}) {
 const [copied,setCopied]=useState(false);
 const sharedIds=useMemo(()=>new URLSearchParams(window.location.search).get("items")?.split(",").filter(Boolean)||[],[]);
 const isShared=sharedIds.length>0;
 const list=isShared
  ? products.filter(p=>sharedIds.some(id=>String(id)===String(p.id)))
  : products.filter(p=>wishlist.some(id=>String(id)===String(p.id)));
 const shareUrl=()=>{
  const ids=list.map(p=>p.id).join(",");
  return `${window.location.origin}/wishlist?items=${encodeURIComponent(ids)}`;
 };
 const share=async()=>{
  if(!list.length)return;
  const url=shareUrl();
  try{
   if(navigator.share){await navigator.share({title:"THE OFF GRID — My Wishlist",text:"Pieces I have saved from THE OFF GRID.",url});return;}
   await navigator.clipboard.writeText(url);
   setCopied(true);setTimeout(()=>setCopied(false),2200);
  }catch(error){
   if(error?.name==="AbortError")return;
   try{const field=document.createElement("textarea");field.value=url;document.body.appendChild(field);field.select();document.execCommand("copy");field.remove();setCopied(true);setTimeout(()=>setCopied(false),2200);}catch{}
  }
 };
 return <div className="page wishlist-page">
  <div className="page-head"><span>THE OFF GRID / {isShared?"SHARED EDIT":"SAVED"}</span><h1>{isShared?"A CURATED":"YOUR"} <em>WISHLIST.</em></h1><p>{isShared?"A selection shared from THE OFF GRID.":"Keep the pieces you love in one place."}</p>
   {!isShared&&list.length>0&&<button type="button" className="wishlist-share-btn" onClick={share}><Share2 size={15}/>{copied?"LINK COPIED": "SHARE WISHLIST"}{copied?<Check size={15}/>:<Copy size={14}/>}</button>}
  </div>
  {list.length?<div className="products">{list.map(p=><ProductCard key={p.id} p={p} add={add} wish={wishlist} toggle={toggle}/>)}</div>:<div className="empty-box"><Heart size={28}/><h2>{isShared?"THIS WISHLIST IS NO LONGER AVAILABLE.":"NOTHING SAVED YET."}</h2><p>{isShared?"Ask the sender for an updated wishlist link.":"Save pieces as you explore and they will appear here."}</p><Link className="orange-btn" to="/">DISCOVER PRODUCTS</Link></div>}
 </div>
}
