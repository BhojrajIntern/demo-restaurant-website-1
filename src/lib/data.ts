/* Ember & Saffron — restaurant content. All names, prices, reviews and awards are fictional.
   Used by both the website (browser) and the API (server), so prices can never disagree. */
import type { ImageName } from "./images";

export const brand = {
  name: "Ember & Saffron",
  /* Deliberately fictional (not a dialable number) so no real person receives a demo visitor's call or message. */
  phone: "+91 00000 00000",
  phoneHref: "tel:+910000000000",
  whatsapp: "https://wa.me/910000000000?text=Hi%20Ember%20%26%20Saffron!",
  whatsappNumber: "910000000000",
  email: "hello@emberandsaffron.demo",
  streetAddress: "123 Example Street, Demo Nagar",
  city: "Bengaluru",
  postalCode: "560000",
  address: "123 Example Street, Demo Nagar, Bengaluru 560000 (fictional demo address)",
  timezone: "Asia/Kolkata",
} as const;

/** 0 = Sunday … 6 = Saturday. Each day: list of [open, close] in 24h "HH:MM". */
export const hours: Record<number, [string, string][]> = {
  0: [["12:00", "16:00"], ["19:00", "23:30"]],
  1: [["19:00", "23:00"]],
  2: [["12:00", "15:30"], ["19:00", "23:00"]],
  3: [["12:00", "15:30"], ["19:00", "23:00"]],
  4: [["12:00", "15:30"], ["19:00", "23:00"]],
  5: [["12:00", "15:30"], ["19:00", "23:59"]],
  6: [["12:00", "16:00"], ["19:00", "23:59"]],
};

export type CategoryId = "small-plates" | "tandoor" | "curries" | "biryani-thali" | "breads-rice" | "desserts" | "drinks";

export const categories: { id: CategoryId; name: string; blurb: string }[] = [
  { id: "small-plates", name: "Small Plates", blurb: "Street-side favourites, plated for sharing." },
  { id: "tandoor", name: "From the Tandoor", blurb: "Charcoal clay oven, 480°C, marinated overnight." },
  { id: "curries", name: "Curries", blurb: "Slow-cooked gravies from four regions." },
  { id: "biryani-thali", name: "Biryani & Thalis", blurb: "Sealed-pot dum biryanis and complete platters." },
  { id: "breads-rice", name: "Breads & Rice", blurb: "Baked to order in the tandoor." },
  { id: "desserts", name: "Desserts", blurb: "Something sweet to close the evening." },
  { id: "drinks", name: "Drinks", blurb: "Coolers, chai, filter coffee and house cocktails." },
];

export type Tag = "bestseller" | "chef" | "new" | "vegan" | "gf";
export const tagLabels: Record<Tag, string> = { bestseller: "Bestseller", chef: "Chef's special", new: "New", vegan: "Vegan", gf: "Gluten-free" };
export const tagClass = (t: Tag) => (t === "chef" ? "chef" : t === "new" ? "new" : t === "vegan" || t === "gf" ? "diet" : "");

export type Dish = {
  id: string;
  cat: CategoryId;
  name: string;
  price: number;
  /** true = vegetarian (green mark), false = non-vegetarian (brown mark) */
  veg: boolean;
  /** 0-3 */
  spice: number;
  img: ImageName | null;
  tags: Tag[];
  allergens: string[];
  desc: string;
  /** unavailable by default (the manager can change this in the dashboard) */
  soldOut?: boolean;
  /** has options (spice, portion, add-ons) */
  custom?: boolean;
};

export const menu: Dish[] = [
  { id: "samosa-chaat", cat: "small-plates", name: "Samosa Chaat", price: 289, veg: true, spice: 1, img: "samosa-platter", tags: ["bestseller"], allergens: ["gluten", "dairy"], desc: "Crushed Punjabi samosa, chole, sweet yoghurt, tamarind and mint chutneys, crunchy sev." },
  { id: "pav-bhaji", cat: "small-plates", name: "Bombay Pav Bhaji", price: 319, veg: true, spice: 2, img: "pav-bhaji", tags: [], allergens: ["gluten", "dairy"], desc: "Buttery mashed-vegetable bhaji cooked on the tawa, toasted pav, raw onion and lime." },
  { id: "ragda-chaat", cat: "small-plates", name: "Ragda Pattice", price: 279, veg: true, spice: 2, img: "ragda-chaat", tags: ["vegan"], allergens: ["gluten"], desc: "White-pea ragda over crisp potato patties, onion, coriander and sev." },
  { id: "classic-samosa", cat: "small-plates", name: "Classic Samosa (2 pcs)", price: 189, veg: true, spice: 1, img: "samosa", tags: ["vegan"], allergens: ["gluten"], desc: "Hand-folded pastry, spiced potato and peas, green and tamarind chutneys." },
  { id: "chilli-prawns", cat: "small-plates", name: "Goan Chilli Prawns", price: 549, veg: false, spice: 3, img: null, tags: ["new"], allergens: ["shellfish"], desc: "Tiger prawns tossed in recheado masala, curry leaves and garlic." },
  { id: "idli-vada", cat: "small-plates", name: "Idli, Vada & Sambar", price: 249, veg: true, spice: 1, img: "idli-vada", tags: ["gf"], allergens: [], desc: "Steamed rice idlis, crisp medu vada, sambar and two chutneys. Available until 4 pm." },

  { id: "paneer-tikka", cat: "tandoor", name: "Achari Paneer Tikka", price: 429, veg: true, spice: 2, img: "paneer-tikka", tags: ["chef"], allergens: ["dairy"], desc: "Pickling-spice marinated cottage cheese, peppers and onions, charred on a sizzler.", custom: true },
  { id: "seekh-kebab", cat: "tandoor", name: "Charcoal Seekh Kebab", price: 489, veg: false, spice: 2, img: "seekh-grill", tags: ["bestseller"], allergens: [], desc: "Minced lamb, fresh ginger and green chilli, grilled on skewers over live coal.", custom: true },
  { id: "tandoori-chicken", cat: "tandoor", name: "Tandoori Chicken", price: 529, veg: false, spice: 2, img: "tandoori-chicken", tags: ["bestseller"], allergens: ["dairy"], desc: "Bone-in chicken, 24-hour yoghurt and Kashmiri chilli marinade, smoked butter.", custom: true },
  { id: "malai-broccoli", cat: "tandoor", name: "Malai Broccoli", price: 389, veg: true, spice: 0, img: null, tags: [], allergens: ["dairy", "nuts"], desc: "Cream cheese and cardamom marinade, cashew crumb.", soldOut: true },

  { id: "butter-chicken", cat: "curries", name: "Old Delhi Butter Chicken", price: 549, veg: false, spice: 1, img: "butter-chicken", tags: ["bestseller", "chef"], allergens: ["dairy", "nuts"], desc: "Tandoori chicken in a velvety tomato-butter makhani, kasuri methi, cream.", custom: true },
  { id: "paneer-makhani", cat: "curries", name: "Paneer Makhani", price: 459, veg: true, spice: 1, img: "paneer-makhani", tags: [], allergens: ["dairy", "nuts"], desc: "Soft paneer cubes in our signature makhani gravy.", custom: true },
  { id: "malabar-fish", cat: "curries", name: "Malabar Fish Curry", price: 599, veg: false, spice: 2, img: "fish-curry", tags: ["gf"], allergens: ["fish"], desc: "Seer fish simmered in coconut milk, kokum and curry leaves, Kerala style." },
  { id: "chettinad", cat: "curries", name: "Chicken Chettinad", price: 529, veg: false, spice: 3, img: "chettinad", tags: [], allergens: [], desc: "Fiery Tamil Nadu curry with freshly roasted kalpasi, star anise and black pepper." },
  { id: "rogan-josh", cat: "curries", name: "Kashmiri Rogan Josh", price: 649, veg: false, spice: 2, img: "curry-naan", tags: ["chef"], allergens: [], desc: "Slow-braised lamb shoulder, Kashmiri chilli, fennel and dry ginger." },
  { id: "dal-ember", cat: "curries", name: "Dal Ember", price: 349, veg: true, spice: 1, img: null, tags: ["bestseller", "gf"], allergens: ["dairy"], desc: "Black lentils cooked overnight on the dying embers of the tandoor." },

  { id: "dum-biryani", cat: "biryani-thali", name: "Hyderabadi Dum Biryani", price: 589, veg: false, spice: 2, img: "dum-biryani", tags: ["bestseller"], allergens: ["dairy", "nuts"], desc: "Aged basmati and chicken sealed with dough and cooked dum. Mirchi ka salan and raita.", custom: true },
  { id: "veg-biryani", cat: "biryani-thali", name: "Subz Dum Biryani", price: 469, veg: true, spice: 1, img: "veg-biryani", tags: [], allergens: ["dairy", "nuts"], desc: "Seasonal vegetables, saffron, fried onions and mint, cooked dum." },
  { id: "royal-thali", cat: "biryani-thali", name: "Ember Royal Thali", price: 899, veg: false, spice: 2, img: "royal-thali", tags: ["chef"], allergens: ["dairy", "gluten"], desc: "Eight bowls: tandoori starter, two curries, dal, rice, breads, raita and dessert.", custom: true },
  { id: "north-thali", cat: "biryani-thali", name: "Weekday Lunch Thali", price: 499, veg: true, spice: 1, img: "north-thali", tags: ["new"], allergens: ["dairy", "gluten"], desc: "Changes daily. Two curries, dal, jeera rice, roti, salad and sweet. Tue–Fri lunch only." },
  { id: "sadya", cat: "biryani-thali", name: "Kerala Sadya (Sundays)", price: 749, veg: true, spice: 1, img: "sadya-thali", tags: ["vegan", "gf"], allergens: [], desc: "Fourteen-item banana-leaf feast with rice, sambar, avial, olan, payasam." },

  { id: "butter-naan", cat: "breads-rice", name: "Butter Naan", price: 89, veg: true, spice: 0, img: null, tags: [], allergens: ["gluten", "dairy"], desc: "Leavened tandoor bread, brushed with butter." },
  { id: "garlic-naan", cat: "breads-rice", name: "Garlic & Coriander Naan", price: 109, veg: true, spice: 0, img: null, tags: ["bestseller"], allergens: ["gluten", "dairy"], desc: "Roasted garlic, fresh coriander." },
  { id: "laccha", cat: "breads-rice", name: "Laccha Paratha", price: 99, veg: true, spice: 0, img: null, tags: [], allergens: ["gluten", "dairy"], desc: "Flaky layered whole-wheat bread." },
  { id: "jeera-rice", cat: "breads-rice", name: "Jeera Rice", price: 199, veg: true, spice: 0, img: null, tags: ["vegan", "gf"], allergens: [], desc: "Basmati tempered with cumin and ghee." },

  { id: "shrikhand", cat: "desserts", name: "Rose Shrikhand Cups", price: 279, veg: true, spice: 0, img: "shrikhand-cups", tags: ["new"], allergens: ["dairy"], desc: "Hung-curd shrikhand, rose and strawberry compote, pistachio crumble." },
  { id: "gulab-jamun", cat: "desserts", name: "Warm Gulab Jamun", price: 229, veg: true, spice: 0, img: null, tags: ["bestseller"], allergens: ["dairy", "gluten"], desc: "With saffron rabri." },
  { id: "kulfi", cat: "desserts", name: "Pista Matka Kulfi", price: 249, veg: true, spice: 0, img: null, tags: [], allergens: ["dairy", "nuts"], desc: "Slow-reduced milk set in a clay pot." },

  { id: "kokum-cooler", cat: "drinks", name: "Kokum Cooler", price: 189, veg: true, spice: 0, img: "kokum-cooler", tags: ["vegan"], allergens: [], desc: "Kokum, lime, black salt and soda." },
  { id: "kahwa", cat: "drinks", name: "Kashmiri Kahwa", price: 169, veg: true, spice: 0, img: "kahwa", tags: [], allergens: ["nuts"], desc: "Green tea, saffron, cardamom and almond slivers." },
  { id: "filter-coffee", cat: "drinks", name: "Madras Filter Coffee", price: 149, veg: true, spice: 0, img: "filter-coffee", tags: ["bestseller"], allergens: ["dairy"], desc: "Chicory blend, frothed by hand." },
  { id: "masala-chai", cat: "drinks", name: "Cutting Masala Chai", price: 99, veg: true, spice: 0, img: null, tags: [], allergens: ["dairy"], desc: "Ginger, cardamom and lemongrass." },
];

export const dishById = (id: string) => menu.find((d) => d.id === id);

/** Customisation options for dishes marked custom: true. [label, extra price] */
export const options = {
  spice: { label: "Spice level", choices: [["Mild", 0], ["Medium", 0], ["Hot", 0], ["Ember hot", 0]] as [string, number][], default: 1 },
  portion: { label: "Portion", choices: [["Regular", 0], ["Large (serves 2)", 220]] as [string, number][], default: 0 },
  addons: { label: "Add-ons", choices: [["Extra makhani gravy", 79], ["Butter naan", 89], ["Garlic naan", 109], ["Burani raita", 99], ["Green salad", 69]] as [string, number][] },
};

export type Coupon = { type: "percent" | "flat"; value: number; min: number; label: string };
export const coupons: Record<string, Coupon> = {
  EMBER15: { type: "percent", value: 15, min: 0, label: "15% off your first online order" },
  FEAST100: { type: "flat", value: 100, min: 999, label: "₹100 off orders above ₹999" },
};

export const fees = { deliveryFee: 49, freeDeliveryAbove: 799, packaging: 25, gst: 0.05, minOrder: 199 };
export const servicePincodes = ["560008", "560017", "560038", "560071", "560075", "560093", "560102", "560001", "560025"];

export const reviews = [
  { name: "Ananya R.", src: "Google", stars: 5, when: "2 weeks ago", text: "The Old Delhi butter chicken is unreal, and the dal cooked overnight on the tandoor is the best I've had outside Delhi. Staff remembered my daughter's birthday without being asked." },
  { name: "Rohit & Meera", src: "Zomato", stars: 5, when: "1 month ago", text: "Booked the terrace for our anniversary. Perfect lighting, perfect kebabs, and the kokum cooler is dangerously good." },
  { name: "James W.", src: "TripAdvisor", stars: 5, when: "3 weeks ago", text: "As a visitor to Bengaluru this was the highlight. The Royal Thali is a tour of India on one plate. Book ahead on weekends!" },
  { name: "Priya S.", src: "Google", stars: 4, when: "5 days ago", text: "Lovely Sunday sadya, great value. It gets busy around 1:30 so go early. Will be back for the Chef's Table." },
  { name: "Karthik N.", src: "Google", stars: 5, when: "2 months ago", text: "Ordered delivery on a rainy night — arrived hot, beautifully packed, and the biryani still had its dum aroma. Ten out of ten." },
];

export const seatingOptions = ["Dining hall", "Terrace", "Bar counter"] as const;
export const MAX_ONLINE_PARTY = 8;
export const SLOT_CAPACITY = 6;
