import React, { useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "./ProductCard";

const normalize = (v) => String(v || "").trim().toUpperCase();

export default function ProductDiscovery({ products = [], add, wishlist = [], toggle, initialCategory = "ALL" }) {
  const [category, setCategory] = useState(initialCategory);
  const [gender, setGender] = useState("ALL");
  const [fit, setFit] = useState("ALL");
  const [color, setColor] = useState("ALL");
  const [sort, setSort] = useState("FEATURED");
  const [price, setPrice] = useState("ALL");
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = ["ALL", ...new Set(products.map((p) => normalize(p.category)).filter(Boolean))];
  const genders = ["ALL", ...new Set(products.map((p) => normalize(p.gender)).filter(Boolean))];
  const fits = ["ALL", ...new Set(products.map((p) => normalize(p.fit)).filter(Boolean))];
  const colors = ["ALL", ...new Set(products.flatMap((p) => Array.isArray(p.colors) ? p.colors : [p.color]).map(normalize).filter(Boolean))];

  const result = useMemo(() => {
    let list = products.filter((p) => {
      const pCategory = normalize(p.category);
      const pGender = normalize(p.gender);
      const pFit = normalize(p.fit);
      const pColors = Array.isArray(p.colors) ? p.colors.map(normalize) : [normalize(p.color)];
      const value = Number(p.price || 0);
      return (
        (category === "ALL" || pCategory === category) &&
        (gender === "ALL" || pGender === gender) &&
        (fit === "ALL" || pFit === fit) &&
        (color === "ALL" || pColors.includes(color)) &&
        (price === "ALL" || (price === "UNDER 1500" && value < 1500) || (price === "1500-2500" && value >= 1500 && value <= 2500) || (price === "2500-3500" && value > 2500 && value <= 3500) || (price === "3500+" && value > 3500))
      );
    });

    if (sort === "PRICE LOW") list.sort((a,b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === "PRICE HIGH") list.sort((a,b) => Number(b.price || 0) - Number(a.price || 0));
    if (sort === "NEWEST") list.sort((a,b) => Number(b.id || 0) - Number(a.id || 0));
    if (sort === "SALE") list.sort((a,b) => ((Number(b.old_price || b.price)-Number(b.price||0)) - (Number(a.old_price || a.price)-Number(a.price||0))));
    if (sort === "BESTSELLERS") list.sort((a,b) => (normalize(b.condition) === "BESTSELLER") - (normalize(a.condition) === "BESTSELLER"));
    return list;
  }, [products, category, gender, fit, color, price, sort]);

  const clear = () => {
    setCategory("ALL"); setGender("ALL"); setFit("ALL"); setColor("ALL"); setPrice("ALL"); setSort("FEATURED");
  };

  const activeCount = [category, gender, fit, color, price].filter((x) => x !== "ALL").length;

  const controls = (
    <>
      <div className="discovery-field"><label>CATEGORY</label><select value={category} onChange={(e)=>setCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="discovery-field"><label>GENDER</label><select value={gender} onChange={(e)=>setGender(e.target.value)}>{genders.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="discovery-field"><label>FIT</label><select value={fit} onChange={(e)=>setFit(e.target.value)}>{fits.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="discovery-field"><label>COLOR</label><select value={color} onChange={(e)=>setColor(e.target.value)}>{colors.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="discovery-field"><label>PRICE</label><select value={price} onChange={(e)=>setPrice(e.target.value)}><option>ALL</option><option>UNDER 1500</option><option>1500-2500</option><option>2500-3500</option><option>3500+</option></select></div>
    </>
  );

  return (
    <section className="product-discovery">
      <div className="discovery-toolbar">
        <div className="discovery-summary"><strong>{result.length}</strong> PRODUCTS {activeCount > 0 && <button onClick={clear}>CLEAR ALL <X size={13}/></button>}</div>
        <button className="discovery-mobile-filter" onClick={()=>setMobileOpen(true)}><SlidersHorizontal size={16}/> FILTERS {activeCount > 0 && <b>{activeCount}</b>}</button>
        <div className="discovery-sort"><label>SORT BY</label><select value={sort} onChange={(e)=>setSort(e.target.value)}><option>FEATURED</option><option>NEWEST</option><option>BESTSELLERS</option><option>SALE</option><option>PRICE LOW</option><option>PRICE HIGH</option></select><ChevronDown size={14}/></div>
      </div>

      <div className="discovery-desktop-filters">{controls}</div>

      {mobileOpen && <div className="discovery-drawer-backdrop" onClick={()=>setMobileOpen(false)}><aside className="discovery-drawer" onClick={(e)=>e.stopPropagation()}><header><strong>FILTERS</strong><button onClick={()=>setMobileOpen(false)}><X/></button></header>{controls}<button className="discovery-apply" onClick={()=>setMobileOpen(false)}>SHOW {result.length} PRODUCTS</button></aside></div>}

      <div className="products discovery-grid">
        {result.length ? result.map((p)=><ProductCard key={p.id} p={p} add={add} wish={wishlist} toggle={toggle}/>) : <div className="no-products"><span>NO PRODUCTS FOUND</span><h3>NOTHING HERE.</h3><button onClick={clear}>CLEAR FILTERS</button></div>}
      </div>
    </section>
  );
}
