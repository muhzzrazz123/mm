/**
 * MOCCA GENTS | BOYS - PRODUCT CATALOG
 * Modern Style for Every Generation • Chattiparamba, Malappuram
 * 
 * Single source of truth for all store inventory.
 * To add, update, or remove stock, modify this array only.
 * No animation or layout scripts need to be touched.
 */

const PRODUCTS = [
  {
    id: "m-sh-01",
    name: "MOCCA Signature Oxford Cutaway Shirt",
    price: 1850,
    currency: "INR",
    material: "100% Superfine Giza Cotton (140s/2 Two-Ply)",
    category: "gents",
    subCategory: "shirts",
    isNewArrival: true,
    images: ["assets/gent_oxford_shirt.jpg", "assets/mocca/mocca_shirts_rack.jpeg"],
    sizes: ["38", "40", "42", "44"],
    colors: ["Chalk White"],
    featured3D: true,
    weave: "Royal Oxford Weave",
    description: "MOCCA's flagship formal cutaway shirt tailored from pure long-staple cotton. Features structured collar interlining, curved French seams, and mother-of-pearl buttons."
  },
  {
    id: "m-sh-02",
    name: "Cuban Resort Collar Textured Shirt",
    price: 1450,
    currency: "INR",
    material: "Textured Cotton Slub & Waffle Weave",
    category: "gents",
    subCategory: "shirts",
    isNewArrival: true,
    images: ["assets/mocca/mocca_shirts_rack.jpeg", "assets/gent_oxford_shirt.jpg"],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Sage Green", "Charcoal", "Bone"],
    featured3D: false,
    weave: "Textured Slub Knit",
    description: "Relaxed open camp-collar styling from the MOCCA Summer Showroom rack. Tailored for effortless everyday sophistication and weekend wear."
  },
  {
    id: "m-et-03",
    name: "Royal Sapphire Raw Silk Festive Kurta",
    price: 2950,
    currency: "INR",
    material: "Handloom Tussar & Mulberry Raw Silk",
    category: "gents",
    subCategory: "ethnic",
    isNewArrival: true,
    images: ["assets/gent_ethnic_kurta.jpg"],
    sizes: ["38", "40", "42", "44", "46"],
    colors: ["Midnight Sapphire"],
    featured3D: true,
    weave: "Tussar Slub Silk",
    description: "Deep royal navy silhouette crafted for Eid, weddings, and celebratory gatherings. Detailed with antique gold-thread micro embroidery on the mandarin collar."
  },
  {
    id: "m-tr-04",
    name: "MOCCA Tailored Pleated Trousers",
    price: 1650,
    currency: "INR",
    material: "Wool-Touch Peach Viscose Blend with Spandex",
    category: "gents",
    subCategory: "trousers",
    isNewArrival: false,
    images: ["assets/gent_wool_trousers.jpg", "assets/mocca/mocca_shelves.jpeg"],
    sizes: ["30", "32", "34", "36", "38"],
    colors: ["Charcoal Melange", "Olive Khaki"],
    featured3D: true,
    weave: "Four-Season Twill",
    description: "Clean forward pleats, tapered ankle drape, and internal stretch waistband for all-day comfort. Pairs seamlessly with MOCCA shirts and knit polos."
  },
  {
    id: "b-et-05",
    name: "Prince Regent Boys' Terracotta Kurta Set",
    price: 1950,
    currency: "INR",
    material: "Chanderi Silk-Cotton Blend with Brocade Accents",
    category: "boys",
    subCategory: "ethnic",
    isNewArrival: true,
    images: ["assets/boys_festive_kurta.jpg"],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"],
    colors: ["Terracotta & Azure"],
    featured3D: true,
    weave: "Brocade & Fine Chanderi",
    description: "Vibrant festive ensemble featuring a terracotta silk-cotton kurta with royal azure thread piping, complemented by tailored silk straight-fit trousers and matching pocket square."
  },
  {
    id: "b-sh-06",
    name: "Junior Riviera Sky Washed Linen Shirt",
    price: 1250,
    currency: "INR",
    material: "100% French Normandy Flax Linen",
    category: "boys",
    subCategory: "boyswear",
    isNewArrival: true,
    images: ["assets/boys_linen_shirt.jpg"],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: ["Sky Cerulean"],
    featured3D: false,
    weave: "Open Airy Linen Weave",
    description: "Breezy washed flax linen for young boys. Tailored with roll-tab sleeves, natural coconut shell buttons, and anchor crest embroidery on the chest pocket."
  },
  {
    id: "m-cs-07",
    name: "MOCCA Street Minimalist Heavyweight Hoodie",
    price: 1750,
    currency: "INR",
    material: "450 GSM Organic Combed Fleece Cotton",
    category: "gents",
    subCategory: "shirts",
    isNewArrival: true,
    images: ["assets/mocca/mocca_hoodies.jpeg"],
    sizes: ["M", "L", "XL"],
    colors: ["Cobalt Blue", "Crimson Red", "Burgundy"],
    featured3D: false,
    weave: "Loopback Heavy Fleece",
    description: "As seen on MOCCA's viral showroom drops. Drop-shoulder boxy fit with double-layered hood and ribbed cuff reinforcements."
  },
  {
    id: "b-tr-08",
    name: "Junior Atelier Stretch Chino Trousers",
    price: 1100,
    currency: "INR",
    material: "98% Pima Cotton, 2% Elastane",
    category: "boys",
    subCategory: "boyswear",
    isNewArrival: false,
    images: ["assets/gent_wool_trousers.jpg"],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"],
    colors: ["Stone Khaki", "Navy"],
    featured3D: false,
    weave: "Stretch Satin Drill",
    description: "Designed for young gentlemen with an elasticated interior waist adjuster, slash pockets, and wrinkle-resistant peach-finish twill."
  }
];

const ID_ALIASES = {
  'g-sh-01': 'm-sh-01',
  'na-01': 'm-sh-01',
  'na-02': 'm-sh-02',
  'g-tr-03': 'm-tr-04',
  'b-et-04': 'b-et-05',
  'na-03': 'b-et-05',
  'b-sh-05': 'b-sh-06',
  'na-04': 'b-sh-06',
  'b-tr-07': 'b-tr-08',
  'na-05': 'm-cs-07',
  'na-06': 'm-et-03'
};

// Helper functions for easy querying across views
const ProductStore = {
  getAll: () => PRODUCTS,
  getById: (id) => {
    if (!id) return null;
    const cleanId = String(id).toLowerCase().trim();
    const targetId = ID_ALIASES[cleanId] || cleanId;
    return PRODUCTS.find(p => p.id.toLowerCase() === cleanId || p.id.toLowerCase() === targetId);
  },
  getByCategory: (cat) => cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat),
  getNewArrivals: () => PRODUCTS.filter(p => p.isNewArrival),
  getBySubCategory: (sub) => PRODUCTS.filter(p => p.subCategory === sub),
  registerItem: (item) => {
    if (!PRODUCTS.find(p => p.id === item.id)) {
      PRODUCTS.push({
        ...item,
        images: item.images || [item.image],
        subCategory: item.subCategory || item.category
      });
    }
  }
};
