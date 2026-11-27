import React, { useEffect, useState } from "react";
import { Star, CheckCircle2, ImagePlus, X } from "lucide-react";
import { api, apiUpload } from "../api";

export default function ProductReviews({ productId, user }) {
  const [reviews,setReviews]=useState([]);
  const [summary,setSummary]=useState({count:0,average:0});
  const [rating,setRating]=useState(5);
  const [text,setText]=useState("");
  const [files,setFiles]=useState([]);
  const [loading,setLoading]=useState(true);
  const [posting,setPosting]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  const loadReviews=async()=>{
    setLoading(true);
    try{
      const data=await api(`/reviews/${productId}`);
      setReviews(Array.isArray(data.reviews)?data.reviews:[]);
      setSummary(data.summary||{count:0,average:0});
      setError("");
    }catch(err){setError(err.message||"Unable to load reviews");}
    finally{setLoading(false);}
  };
  useEffect(()=>{loadReviews();},[productId]);

  const chooseFiles=(event)=>{
    const selected=Array.from(event.target.files||[]);
    if(selected.length>3){setError("Choose up to 3 photos.");event.target.value="";return;}
    const invalid=selected.find(file=>!file.type.startsWith("image/")||file.size>8*1024*1024);
    if(invalid){setError("Use image files up to 8 MB each.");event.target.value="";return;}
    setFiles(selected);setError("");event.target.value="";
  };
  const save=async(e)=>{
    e.preventDefault();
    if(!user){setError("Please sign in to post a review.");return;}
    if(!text.trim()&&!files.length){setError("Add a comment or a photo before posting.");return;}
    setPosting(true);setMessage("");setError("");
    try{
      const uploaded=[];
      for(const file of files){
        const result=await apiUpload(file,"/upload/review-photo");
        if(result?.url)uploaded.push(result.url);
      }
      const result=await api(`/reviews/${productId}`,{
        method:"POST",
        body:JSON.stringify({rating,comment:text.trim(),photos:uploaded})
      });
      setText("");setFiles([]);
      setMessage(result.photos_pending? "Your review is live. Your photos will appear after moderation.":"Your review has been posted.");
      await loadReviews();
    }catch(err){setError(err.message||"Unable to post review");}
    finally{setPosting(false);}
  };

  return <section className="reviews-section">
    <div className="section-title"><div><span>PRODUCT / REVIEWS</span><h2>REAL <em>WEAR.</em></h2></div><div className="review-summary"><strong>{Number(summary.average||0).toFixed(1)}</strong><span>{summary.count||0} review{summary.count===1?"":"s"}</span></div></div>
    {user?<form className="review-form" onSubmit={save}>
      <div className="stars-input" aria-label="Choose rating">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setRating(n)} aria-label={`${n} stars`}><Star size={18} fill={n<=rating?"currentColor":"none"}/></button>)}</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Tell us about the fit, feel and quality..." maxLength={1000}/>
      <label className="review-photo-picker"><ImagePlus size={16}/><span>ADD PHOTOS</span><small>{files.length}/3 · MAX 8 MB EACH</small><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={chooseFiles}/></label>
      {files.length>0&&<div className="review-photo-previews">{files.map((file,index)=><div key={file.name+index}><img src={URL.createObjectURL(file)} alt={file.name}/><button type="button" onClick={()=>setFiles(current=>current.filter((_,i)=>i!==index))} aria-label="Remove photo"><X size={13}/></button></div>)}</div>}
      {error&&<p className="notify-me-error" role="alert">{error}</p>}{message&&<p className="notify-me-success" role="status">{message}</p>}
      <button className="orange-btn" disabled={posting}>{posting?"UPLOADING & POSTING...":"POST REVIEW"}</button>
    </form>:<div className="review-login-note"><p>Sign in to share your fit, feel and quality experience.</p>{error&&<p className="notify-me-error">{error}</p>}</div>}
    {loading?<div className="review-list"><p>LOADING REVIEWS...</p></div>:reviews.length?<div className="review-list">{reviews.map(review=><article key={review.id}>
      <div className="stars">{[1,2,3,4,5].map(n=><Star key={n} size={14} fill={n<=review.rating?"currentColor":"none"}/>)}</div>
      <strong>{review.user_name||"OFF GRID CUSTOMER"}</strong>{review.verified_purchase&&<small className="verified-review"><CheckCircle2 size={12}/> VERIFIED PURCHASE</small>}
      <small>{review.created_at?new Date(review.created_at).toLocaleDateString("en-IN"):""}</small><p>{review.comment}</p>
      {Array.isArray(review.photos)&&review.photos.length>0&&<div className="review-approved-photos">{review.photos.map((url,i)=><a href={url} target="_blank" rel="noreferrer" key={url}><img src={url} alt={`Customer review photo ${i+1}`} loading="lazy"/></a>)}</div>}
    </article>)}</div>:<div className="empty-review-state"><p>NO REVIEWS YET. BE THE FIRST TO SHARE YOUR EXPERIENCE.</p></div>}
  </section>;
}
