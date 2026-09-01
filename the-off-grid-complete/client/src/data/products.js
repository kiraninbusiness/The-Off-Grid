const PRODUCTS = [
  {
    id: 1,
    name: "ZENITH OVERSIZED TEE",
    price: 1599,
    old_price: 1999,
    category: "T-SHIRTS",
    gender: "UNISEX",
    color: "CHARCOAL",
    size: "S / M / L / XL",
    fit: "OVERSIZED",
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90",
    description:
      "Heavyweight oversized cotton tee designed for everyday wear.",
    condition: "NEW",
  },

  {
    id: 2,
    name: "LUNA LINEN SHIRT",
    price: 2499,
    old_price: 2999,
    category: "SHIRTS",
    gender: "UNISEX",
    color: "OFF WHITE",
    size: "S / M / L / XL",
    fit: "RELAXED",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=90",
    description:
      "Relaxed linen shirt with a clean silhouette and lightweight feel.",
    condition: "NEW",
  },

  {
    id: 3,
    name: "TERRA CARGO PANTS",
    price: 2799,
    old_price: 3299,
    category: "BOTTOMS",
    gender: "UNISEX",
    color: "OLIVE",
    size: "28 / 30 / 32 / 34 / 36",
    fit: "RELAXED",
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=90",
    description:
      "Utility-inspired cargo pants with a relaxed streetwear fit.",
    condition: "NEW",
  },

  {
    id: 4,
    name: "SIGNATURE HOODIE",
    price: 3299,
    old_price: 3999,
    category: "HOODIES",
    gender: "UNISEX",
    color: "BONE",
    size: "S / M / L / XL",
    fit: "OVERSIZED",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90",
    description:
      "Premium heavyweight hoodie with an oversized silhouette.",
    condition: "BESTSELLER",
  },

  {
    id: 5,
    name: "RAYON BOMBER JACKET",
    price: 3999,
    old_price: 4999,
    category: "JACKETS",
    gender: "UNISEX",
    color: "BLACK",
    size: "S / M / L / XL",
    fit: "REGULAR",
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=90",
    description:
      "Minimal bomber jacket with a structured modern silhouette.",
    condition: "NEW",
  },

  {
    id: 6,
    name: "CLASSIC OFF GRID CAP",
    price: 999,
    old_price: 1299,
    category: "ACCESSORIES",
    gender: "UNISEX",
    color: "BLACK",
    size: "ONE SIZE",
    fit: "ADJUSTABLE",
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=90",
    description:
      "Minimal six-panel cap finished with The Off Grid branding.",
    condition: "NEW",
  },

  {
    id: 7,
    name: "CORE RIBBED TANK",
    price: 1299,
    old_price: 1599,
    category: "TANK TOPS",
    gender: "UNISEX",
    color: "BLACK",
    size: "S / M / L / XL",
    fit: "SLIM",
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3c990?auto=format&fit=crop&w=1200&q=90",
    description:
      "Clean ribbed tank designed for layering or standalone wear.",
    condition: "NEW",
  },

  {
    id: 8,
    name: "GRID RUNNER SNEAKERS",
    price: 4499,
    old_price: 5499,
    category: "FOOTWEAR",
    gender: "UNISEX",
    color: "WHITE / GREY",
    size: "6 / 7 / 8 / 9 / 10 / 11",
    fit: "REGULAR",
    stock: 9,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90",
    description:
      "Everyday sneakers built around a clean technical streetwear aesthetic.",
    condition: "NEW",
  },

  {
    id: 9,
    name: "SHADOW UTILITY VEST",
    price: 2899,
    old_price: 3499,
    category: "JACKETS",
    gender: "UNISEX",
    color: "GRAPHITE",
    size: "S / M / L / XL",
    fit: "RELAXED",
    stock: 7,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=90",
    description:
      "Utility vest with multiple pockets and a contemporary streetwear cut.",
    condition: "NEW",
  },

  {
    id: 10,
    name: "MONOCHROME OVERSHIRT",
    price: 2699,
    old_price: 3199,
    category: "SHIRTS",
    gender: "UNISEX",
    color: "GREY",
    size: "S / M / L / XL",
    fit: "RELAXED",
    stock: 11,
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90",
    description:
      "Structured overshirt designed to work as a light outer layer.",
    condition: "NEW",
  },

  {
    id: 11,
    name: "VOID WIDE LEG DENIM",
    price: 2999,
    old_price: 3699,
    category: "BOTTOMS",
    gender: "UNISEX",
    color: "WASHED BLACK",
    size: "28 / 30 / 32 / 34 / 36",
    fit: "WIDE LEG",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=90",
    description:
      "Wide-leg denim with a relaxed profile and washed finish.",
    condition: "NEW",
  },

  {
    id: 12,
    name: "NIGHT SHIFT TEE",
    price: 1499,
    old_price: 1899,
    category: "T-SHIRTS",
    gender: "UNISEX",
    color: "WASHED BLACK",
    size: "S / M / L / XL",
    fit: "OVERSIZED",
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=90",
    description:
      "Relaxed everyday tee with a vintage-inspired washed finish.",
    condition: "BESTSELLER",
  },
];

export default PRODUCTS;
