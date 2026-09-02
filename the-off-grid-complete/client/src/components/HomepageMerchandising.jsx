import React, { useMemo } from "react";
import { ArrowRight, Flame, Sparkles, Tag } from "lucide-react";
import ProductCard from "./ProductCard";

const salePercent = (p) => {
  const oldPrice = Number(p.old_price || 0);
  const price = Number(p.price || 0);
  return oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
};

const inStock = (p) => Number(p.stock) > 0;

export default function HomepageMerchandising({ products = [], add, wishlist, toggle, scroll, setActiveCategory }) {
  const newDrop = useMemo(() => products.filter((p) => ["NEW", "NEW DROP"].includes(String(p.condition || "").toUpperCase())).slice(0, 4), [products]);
  const bestsellers = useMemo(() => products.filter((p) => String(p.condition || "").toUpperCase() === "BESTSELLER").slice(0, 4), [products]);
  const sale = useMemo(() => products.filter((p) => salePercent(p) > 0).sort((a, b) => salePercent(b) - salePercent(a)).slice(0, 4), [products]);
  const fallback = products.slice(0, 4);

  const CardRow = ({ items }) => (
    <div className="merch-grid">
      {(items.length ? items : fallback).map((p) => <ProductCard key={p.id} p={p} add={add} wish={wishlist} toggle={toggle} />)}
    </div>
  );

  const goShop = () => scroll("shop");

  return (
    <section className="homepage-merchandising">
      <div className="drop-alert">
        <div><Sparkles size={17} /><strong>THE GRID / 002</strong><span>NEW SEASON. NEW ATTITUDE.</span></div>
        <button type="button" onClick={goShop}>SHOP THE DROP <ArrowRight size={15} /></button>
      </div>

      <section className="merch-section" aria-labelledby="new-drop-heading">
        <div className="merch-heading">
          <div><span>02 / JUST IN</span><h2 id="new-drop-heading">NEW <em>DROP.</em></h2><p>Fresh silhouettes. Limited energy. First access starts here.</p></div>
          <button type="button" onClick={goShop}>VIEW ALL <ArrowRight size={15} /></button>
        </div>
        <CardRow items={newDrop} />
      </section>

      <section className="merch-feature">
        <div className="merch-feature-copy"><span>03 / THE EVERYDAY EDIT</span><h2>BUILT TO<br /><em>MOVE.</em></h2><p>Pieces designed to work hard with the rest of your wardrobe. Wear them your way.</p><button type="button" className="orange-btn" onClick={goShop}>SHOP THE COLLECTION <ArrowRight size={16} /></button></div>
        <div className="merch-feature-stats"><div><strong>24H</strong><span>FAST DISPATCH</span></div><div><strong>₹1,499</strong><span>FREE SHIPPING</span></div><div><strong>01</strong><span>INDEPENDENT LABEL</span></div></div>
      </section>

      <section className="merch-section merch-dark" aria-labelledby="bestsellers-heading">
        <div className="merch-heading"><div><span>04 / MOST WANTED</span><h2 id="bestsellers-heading">BEST <em>SELLERS.</em></h2><p>The pieces customers keep coming back for.</p></div><button type="button" onClick={goShop}>SHOP BESTSELLERS <ArrowRight size={15} /></button></div><CardRow items={bestsellers} />
      </section>

      <section className="merch-section sale-edit" aria-labelledby="sale-heading">
        <div className="merch-heading"><div><span><Tag size={13} /> 05 / SALE EDIT</span><h2 id="sale-heading">LESS <em>PRICE.</em><br />SAME <em>ATTITUDE.</em></h2><p>Selected pieces, reduced without reducing the identity.</p></div><button type="button" onClick={goShop}>SHOP SALE <ArrowRight size={15} /></button></div><CardRow items={sale} />
      </section>

      <section className="urgency-banner">
        <div><Flame size={20} /><span>LOW STOCK MOVES FAST</span><strong>DON'T WAIT FOR YOUR SIZE TO DISAPPEAR.</strong></div>
        <button type="button" onClick={goShop}>SHOP NOW <ArrowRight size={15} /></button>
      </section>
    </section>
  );
}
