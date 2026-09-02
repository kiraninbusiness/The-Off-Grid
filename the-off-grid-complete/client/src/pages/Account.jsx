import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../api";

/*
  IMPORTANT FIX / NEW FUNCTIONALITY:
  The old version "logged in" by writing straight to localStorage
  with no password check and no server round-trip at all — it never
  called the (fully built) /api/auth endpoints, so accounts were
  fake, could never sync across devices, and could never satisfy the
  admin check in Admin.jsx (which requires a real role from a real
  JWT). This now performs a real register/login against the backend
  and stores the returned token the same way api.js expects it
  ("offgrid_token"), plus the user object under the same key App.jsx
  reads on load ("offgrid_user") — that key mismatch used to log
  people out on every refresh.
*/
export default function Account({user,setUser,orders=[]}) {
 const nav=useNavigate();
 const [mode,setMode]=useState(user?"profile":"login");
 const [f,setF]=useState({name:"",email:"",password:"",referral_code:""});
 const [busy,setBusy]=useState(false);
 const [err,setErr]=useState("");

 const persist=(u,token)=>{
  localStorage.setItem("offgrid_user",JSON.stringify(u));
  if(token)localStorage.setItem("offgrid_token",token);
  setUser(u);
 };

 const login=async e=>{
  e.preventDefault();
  setBusy(true);setErr("");
  try{
   const res=await api("/auth/login",{method:"POST",body:JSON.stringify({email:f.email,password:f.password})});
   persist(res.user,res.token);
   setMode("profile");
  }catch(error){
   setErr(error.message||"Login failed");
  }finally{setBusy(false)}
 };

 const register=async e=>{
  e.preventDefault();
  setBusy(true);setErr("");
  try{
   const res=await api("/auth/register",{method:"POST",body:JSON.stringify({name:f.name,email:f.email,password:f.password,referral_code:f.referral_code||undefined})});
   persist(res.user,res.token);
   setMode("profile");
  }catch(error){
   setErr(error.message||"Registration failed");
  }finally{setBusy(false)}
 };

 const signOut=()=>{
  localStorage.removeItem("offgrid_user");
  localStorage.removeItem("offgrid_token");
  setUser(null);
  setMode("login");
 };

 if(mode==="profile"&&user){
  return <div className="page account-page">
   <div className="page-head"><span>THE OFF GRID / ACCOUNT</span><h1>WELCOME, <em>{user?.name||"YOU"}.</em></h1></div>
   <div className="account-grid">
    <div>
     <h2>ACCOUNT DETAILS</h2>
     <p>{user?.email}</p>
     {user?.role==="admin"&&<p className="admin-tag">ADMINISTRATOR</p>}
     <button className="text-button" onClick={signOut}>SIGN OUT</button>
    </div>
    <div>
     <h2>ORDER HISTORY</h2>
     <p>{orders.length} order{orders.length===1?"":"s"}</p>
     <button className="orange-btn" onClick={()=>nav("/orders")}>VIEW ORDERS</button>
     {user?.role==="admin"&&<button className="outline-btn" style={{marginTop:12}} onClick={()=>nav("/admin")}>ADMIN PANEL</button>}
    </div>
   </div>
  </div>;
 }

 return <div className="page account-page">
  <div className="page-head"><span>THE OFF GRID / ACCOUNT</span><h1>GET <em>IN.</em></h1></div>

  {mode==="login"?
   <form className="login-form" onSubmit={login}>
    <input required type="email" placeholder="EMAIL" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
    <input required type="password" placeholder="PASSWORD" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>
    {err&&<p className="notify-me-error">{err}</p>}
    <button className="orange-btn" disabled={busy}>{busy?"SIGNING IN...":"SIGN IN"}</button>
    <button type="button" className="text-button auth-toggle" onClick={()=>{setMode("register");setErr("")}}>NEW HERE? CREATE AN ACCOUNT</button>
   </form>
   :
   <form className="login-form" onSubmit={register}>
    <input required placeholder="NAME" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
    <input required type="email" placeholder="EMAIL" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
    <input required type="password" placeholder="PASSWORD (6+ CHARACTERS)" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>
    <input placeholder="REFERRAL CODE (OPTIONAL)" value={f.referral_code} onChange={e=>setF({...f,referral_code:e.target.value})}/>
    {err&&<p className="notify-me-error">{err}</p>}
    <button className="orange-btn" disabled={busy}>{busy?"CREATING ACCOUNT...":"CREATE ACCOUNT"}</button>
    <button type="button" className="text-button auth-toggle" onClick={()=>{setMode("login");setErr("")}}>ALREADY HAVE AN ACCOUNT? SIGN IN</button>
   </form>
  }
 </div>;
}
