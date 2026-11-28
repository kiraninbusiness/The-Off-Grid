import React, { useEffect, useRef, useState } from "react";

/*
  Motion helpers for the home page. Everything here is progressive:
  with JavaScript off, an old browser, or "reduce motion" turned on in
  the OS, content is simply visible — nothing is ever stuck hidden.
*/

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* One shared observer: adds .in to every [data-reveal] element the
   first time it scrolls into view. Re-scans when `deps` change. */
export function useRevealOnScroll(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return undefined;
    if (reduced() || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => {
      if (!el.classList.contains("in")) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* Writes --p (0 → 1) on the element as it moves through the screen.
   sticky=true measures progress through a tall sticky section.
   onChange (optional) receives the same number for React state. */
export function useSectionProgress(ref, { sticky = false, onChange, watch } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = sticky ? rect.height - vh : rect.height + vh;
      const done = sticky ? -rect.top : vh - rect.top;
      const p = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
      if (onChange) onChange(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, sticky, watch]);
}

/* Headline whose words rise out of a mask one after another.
   lines = ["GEAR UP.", "STAND OUT."]; wrap a line in {em:"text"}
   to render it in the lighter secondary style. */
export function SplitHeading({ as: Tag = "h2", lines = [], className = "", delay = 0 }) {
  let n = 0;
  return (
    <Tag className={`vx-split ${className}`} data-reveal aria-label={lines.map((l) => (typeof l === "string" ? l : l.em)).join(" ")}>
      {lines.map((line, li) => {
        const text = typeof line === "string" ? line : line.em;
        const soft = typeof line !== "string";
        return (
          <span className={`vx-split-line${soft ? " soft" : ""}`} key={li} aria-hidden="true">
            {text.split(" ").map((word, wi) => (
              <React.Fragment key={wi}>
                <span className="vx-w">
                  <span className="vx-wi" style={{ transitionDelay: `${delay + n++ * 70}ms` }}>
                    {word}
                  </span>
                </span>
                {" "}
              </React.Fragment>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}

/* Plain wrapper: fades/slides its children in when scrolled to. */
export function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  return (
    <Tag className={`vx-reveal ${className}`} data-reveal style={{ "--d": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/* The tall sticky showcase: a card in the middle swaps product as you
   scroll while giant ghost lettering drifts behind it. */
export function ScrollShowcase({ items = [], onOpen, words = "FRESH FITS FOR YOUR NEXT DROP" }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const count = Math.max(items.length, 1);
  useSectionProgress(ref, {
    sticky: true,
    onChange: (p) => setIndex(Math.min(count - 1, Math.floor(p * count))),
  });
  if (!items.length) return null;
  const item = items[index] || items[0];
  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  return (
    <section className="vx-showcase" ref={ref} style={{ "--n": count }} aria-label="Featured pieces">
      <div className="vx-showcase-stick">
        <div className="vx-ghost-row vx-ghost-a" aria-hidden="true">{words} {words}</div>
        <div className="vx-ghost-row vx-ghost-b" aria-hidden="true">{words} {words}</div>
        <button type="button" className="vx-showcase-card" onClick={() => onOpen?.(item)}>
          {items.map((it, i) => (
            <img
              key={it.id}
              src={it.image}
              alt={i === index ? it.name : ""}
              className={i === index ? "on" : ""}
              loading={i < 2 ? "eager" : "lazy"}
            />
          ))}
          <span className="vx-showcase-meta">
            <small>{item.category}</small>
            <strong>{item.name}</strong>
            <b>{money(item.price)}</b>
          </span>
          <span className="vx-showcase-count">{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
        </button>
      </div>
    </section>
  );
}
