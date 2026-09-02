import React, { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "./ProductCard";

const SORTS = ["FEATURED", "PRICE LOW", "PRICE HIGH", "NEWEST", "SALE", "BESTSELLERS"];
const PRICES = ["ALL", "UNDER 1500", "1500-2500", "2500-3500", "3500+"];

export default function ProductDiscovery({
  products = [],
  add,
  wishlist = [],
  toggle,
  initialCategory = "ALL",
  searchText = "",
}) {
  const [category, setCategory] = useState(initialCategory || "ALL");
  const [gender, setGender] = useState("ALL");
  const [fit, setFit] = useState("ALL");
  const [color, setColor] = useState("ALL");
  const [sort, setSort] = useState("FEATURED");
  const [price, setPrice] = useState("ALL");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCategory(initialCategory || "ALL");
  }, [initialCategory]);

  const categories = useMemo(
    () => ["ALL", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );
  const genders = useMemo(
    () => ["ALL", ...new Set(products.map((p) => p.gender).filter(Boolean))],
    [products]
  );
  const fits = useMemo(
    () => ["ALL", ...new Set(products.map((p) => p.fit).filter(Boolean))],
    [products]
  );
  const colors = useMemo(
    () => [
      "ALL",
      ...new Set(
        products.flatMap((p) =>
          Array.isArray(p.colors) && p.colors.length ? p.colors : [p.color]
        ).filter(Boolean)
      ),
    ],
    [products]
  );

  const result = useMemo(() => {
    const query = String(searchText || "").trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== "ALL" && String(p.category || "").toUpperCase() !== category.toUpperCase()) return false;
      if (gender !== "ALL" && String(p.gender || "").toUpperCase() !== gender.toUpperCase()) return false;
      if (fit !== "ALL" && String(p.fit || "").toUpperCase() !== fit.toUpperCase()) return false;
      if (color !== "ALL") {
        const productColors = Array.isArray(p.colors) && p.colors.length ? p.colors : [p.color];
        if (!productColors.some((c) => String(c || "").toUpperCase() === color.toUpperCase())) return false;
      }

      const value = Number(p.price || 0);
      if (price === "UNDER 1500" && value >= 1500) return false;
      if (price === "1500-2500" && (value < 1500 || value > 2500)) return false;
      if (price === "2500-3500" && (value < 2500 || value > 3500)) return false;
      if (price === "3500+" && value < 3500) return false;

      if (query) {
        const haystack = [
          p.name,
          p.category,
          p.gender,
          p.color,
          ...(Array.isArray(p.colors) ? p.colors : []),
          p.fit,
          p.description,
          p.material,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    list = [...list];
    if (sort === "PRICE LOW") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === "PRICE HIGH") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sort === "NEWEST") list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    if (sort === "SALE") list.sort((a, b) => {
      const discount = (p) => p.old_price && p.price ? (Number(p.old_price) - Number(p.price)) / Number(p.old_price) : 0;
      return discount(b) - discount(a);
    });
    if (sort === "BESTSELLERS") list.sort((a, b) => Number(b.condition === "BESTSELLER") - Number(a.condition === "BESTSELLER"));
    return list;
  }, [products, category, gender, fit, color, price, sort, searchText]);

  const activeFilters = [category, gender, fit, color, price].filter((v) => v !== "ALL").length;

  const clearFilters = () => {
    setGender("ALL");
    setFit("ALL");
    setColor("ALL");
    setPrice("ALL");
    setSort("FEATURED");
    setCategory(initialCategory || "ALL");
  };

  const selectClass = "discovery-select";

  return (
    <div className="product-discovery">
      <div className="discovery-toolbar">
        <div className="discovery-filter-label">
          <span>FILTER / REFINE</span>
          {activeFilters > 0 && <b>{activeFilters}</b>}
        </div>
        <button className="discovery-mobile-filter" type="button" onClick={() => setMobileOpen(true)}>
          <SlidersHorizontal size={16} /> FILTERS{activeFilters ? ` (${activeFilters})` : ""}
        </button>
        <div className="discovery-sort">
          <span>SORT BY</span>
          <div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              {SORTS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="discovery-filters desktop-filters">
        <Filter label="CATEGORY" value={category} setValue={setCategory} options={categories} />
        <Filter label="GENDER" value={gender} setValue={setGender} options={genders} />
        <Filter label="FIT" value={fit} setValue={setFit} options={fits} />
        <Filter label="COLOUR" value={color} setValue={setColor} options={colors} />
        <Filter label="PRICE" value={price} setValue={setPrice} options={PRICES} />
        {(activeFilters > 0 || sort !== "FEATURED") && (
          <button className="discovery-clear" type="button" onClick={clearFilters}>CLEAR ALL <X size={13} /></button>
        )}
      </div>

      {mobileOpen && (
        <div className="discovery-drawer-backdrop" onClick={(e) => e.target === e.currentTarget && setMobileOpen(false)}>
          <aside className="discovery-drawer">
            <div className="discovery-drawer-head">
              <strong>FILTERS</strong>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters"><X /></button>
            </div>
            <Filter label="CATEGORY" value={category} setValue={setCategory} options={categories} />
            <Filter label="GENDER" value={gender} setValue={setGender} options={genders} />
            <Filter label="FIT" value={fit} setValue={setFit} options={fits} />
            <Filter label="COLOUR" value={color} setValue={setColor} options={colors} />
            <Filter label="PRICE" value={price} setValue={setPrice} options={PRICES} />
            <button className="orange-btn discovery-apply" type="button" onClick={() => setMobileOpen(false)}>SHOW {result.length} PRODUCTS</button>
            <button className="discovery-clear drawer-clear" type="button" onClick={clearFilters}>CLEAR ALL</button>
          </aside>
        </div>
      )}

      <div className="discovery-results-head">
        <span>{searchText ? `SEARCH RESULTS FOR “${searchText}”` : "THE OFF GRID COLLECTION"}</span>
        <strong>{result.length} {result.length === 1 ? "PRODUCT" : "PRODUCTS"}</strong>
      </div>

      {result.length ? (
        <div className="products discovery-grid">
          {result.map((product) => (
            <ProductCard key={product.id} p={product} add={add} wish={wishlist} toggle={toggle} />
          ))}
        </div>
      ) : (
        <div className="discovery-empty">
          <span>NO MATCHES</span>
          <h3>NOTHING HERE.</h3>
          <p>Try clearing a filter or searching for another piece.</p>
          <button type="button" onClick={clearFilters}>VIEW ALL PRODUCTS</button>
        </div>
      )}

      <div className="shop-count">SHOWING <strong>{result.length}</strong> OF <strong>{products.length}</strong> PRODUCTS</div>
    </div>
  );
}

function Filter({ label, value, setValue, options }) {
  return (
    <label className="discovery-filter">
      <span>{label}</span>
      <div>
        <select value={value} onChange={(e) => setValue(e.target.value)} aria-label={label}>
          {options.map((item) => <option key={item}>{item}</option>)}
        </select>
        <ChevronDown size={13} />
      </div>
    </label>
  );
}
