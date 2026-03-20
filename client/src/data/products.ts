import bag1 from "@/assets/products/bag-1.jpg";
import bag2 from "@/assets/products/bag-2.jpg";
import bag3 from "@/assets/products/bag-3.jpg";
import bag4 from "@/assets/products/bag-4.jpg";
import bag5 from "@/assets/products/bag-5.jpg";
import bag6 from "@/assets/products/bag-6.jpg";

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  colors: string[];
  inStock: boolean;
  reviews: Review[];
}

export const products: Product[] = [
  {
    id: "cream-crossbody",
    name: "Aria Crossbody",
    price: 185,
    originalPrice: 220,
    description: "Soft cream leather crossbody with gold hardware.",
    longDescription: "The Aria Crossbody is crafted from buttery-soft Italian leather in a warm cream tone. Its adjustable strap and magnetic closure make it the perfect everyday companion. Interior features a zip pocket and two card slots.",
    category: "Crossbody",
    image: bag1,
    rating: 4.8,
    reviewCount: 124,
    colors: ["Cream", "Blush", "Tan"],
    inStock: true,
    reviews: [
      { id: 1, name: "Emma W.", rating: 5, comment: "Absolutely gorgeous! The leather is so soft and the size is perfect for daily use.", date: "2025-12-15", avatar: "E" },
      { id: 2, name: "Sarah L.", rating: 5, comment: "I get compliments every time I carry this bag. Worth every penny!", date: "2025-11-28", avatar: "S" },
      { id: 3, name: "Maya R.", rating: 4, comment: "Beautiful bag, wish the strap was a bit longer. Otherwise perfect.", date: "2025-11-10", avatar: "M" },
    ],
  },
  {
    id: "blush-shoulder",
    name: "Rosa Shoulder Bag",
    price: 245,
    description: "Elegant blush pink shoulder bag with gold accents.",
    longDescription: "The Rosa Shoulder Bag is a statement piece in our signature blush pink. Made from premium saffiano leather, it features a structured silhouette with gold-tone hardware. Spacious enough for all your essentials with a secure zip-top closure.",
    category: "Shoulder",
    image: bag2,
    rating: 4.9,
    reviewCount: 89,
    colors: ["Blush", "Ivory", "Black"],
    inStock: true,
    reviews: [
      { id: 1, name: "Olivia K.", rating: 5, comment: "The most beautiful pink I've ever seen on a bag. Stunning quality!", date: "2026-01-05", avatar: "O" },
      { id: 2, name: "Jessica T.", rating: 5, comment: "This bag is everything! The structure holds up beautifully.", date: "2025-12-20", avatar: "J" },
      { id: 3, name: "Amy C.", rating: 4, comment: "Love the color and quality. A bit heavy when fully loaded though.", date: "2025-12-01", avatar: "A" },
    ],
  },
  {
    id: "noir-satchel",
    name: "Noir Satchel",
    price: 295,
    description: "Classic black leather satchel with gold detailing.",
    longDescription: "The Noir Satchel is timeless elegance redefined. Crafted from full-grain leather with polished gold hardware, this bag transitions seamlessly from office to evening. Features multiple compartments and a detachable shoulder strap.",
    category: "Satchel",
    image: bag3,
    rating: 4.7,
    reviewCount: 156,
    colors: ["Black", "Navy", "Burgundy"],
    inStock: true,
    reviews: [
      { id: 1, name: "Diana M.", rating: 5, comment: "A true investment piece. The quality is outstanding.", date: "2026-01-12", avatar: "D" },
      { id: 2, name: "Rachel B.", rating: 5, comment: "Perfect work bag! Fits my laptop and still looks chic.", date: "2025-12-30", avatar: "R" },
      { id: 3, name: "Kate P.", rating: 4, comment: "Beautiful craftsmanship. The leather smells divine.", date: "2025-11-25", avatar: "K" },
    ],
  },
  {
    id: "tan-bucket",
    name: "Luna Bucket Bag",
    price: 210,
    description: "Rich tan leather bucket bag with drawstring closure.",
    longDescription: "The Luna Bucket Bag combines bohemian charm with refined craftsmanship. Made from vegetable-tanned leather that develops a beautiful patina over time. The drawstring closure and spacious interior make it both stylish and practical.",
    category: "Bucket",
    image: bag4,
    rating: 4.6,
    reviewCount: 73,
    colors: ["Tan", "Cognac", "Olive"],
    inStock: true,
    reviews: [
      { id: 1, name: "Nina F.", rating: 5, comment: "The leather quality is incredible. Gets more beautiful with age!", date: "2026-01-08", avatar: "N" },
      { id: 2, name: "Laura H.", rating: 4, comment: "Love the bucket style. Very roomy and well-made.", date: "2025-12-18", avatar: "L" },
      { id: 3, name: "Zoe A.", rating: 5, comment: "My everyday go-to bag now. Absolutely love it!", date: "2025-12-05", avatar: "Z" },
    ],
  },
  {
    id: "ivory-clutch",
    name: "Pearl Clutch",
    price: 145,
    description: "Minimalist white leather evening clutch.",
    longDescription: "The Pearl Clutch is the epitome of understated luxury. Clean lines and a fold-over design in pristine white leather make it the perfect evening accessory. Includes a delicate gold chain strap for hands-free carrying.",
    category: "Clutch",
    image: bag5,
    rating: 4.8,
    reviewCount: 95,
    colors: ["White", "Champagne", "Silver"],
    inStock: true,
    reviews: [
      { id: 1, name: "Chloe V.", rating: 5, comment: "Wore this to a gala and got so many compliments!", date: "2026-02-01", avatar: "C" },
      { id: 2, name: "Grace W.", rating: 5, comment: "Elegant and minimalist. Exactly what I was looking for.", date: "2026-01-15", avatar: "G" },
      { id: 3, name: "Lily D.", rating: 4, comment: "Beautiful clutch but could be slightly bigger.", date: "2025-12-22", avatar: "L" },
    ],
  },
  {
    id: "rose-backpack",
    name: "Petal Backpack",
    price: 265,
    originalPrice: 310,
    description: "Dusty rose leather backpack for everyday elegance.",
    longDescription: "The Petal Backpack reimagines the classic backpack in luxurious dusty rose leather. Padded straps and a structured frame ensure comfort, while the chevron-stitched front pocket adds a designer touch. Perfect for the modern woman on the go.",
    category: "Backpack",
    image: bag6,
    rating: 4.9,
    reviewCount: 67,
    colors: ["Rose", "Blush", "Mauve"],
    inStock: true,
    reviews: [
      { id: 1, name: "Bella S.", rating: 5, comment: "Finally a backpack that's both practical AND gorgeous!", date: "2026-02-10", avatar: "B" },
      { id: 2, name: "Mia J.", rating: 5, comment: "The color is even more beautiful in person. Obsessed!", date: "2026-01-20", avatar: "M" },
      { id: 3, name: "Sofia R.", rating: 5, comment: "Best purchase I've made in years. So versatile.", date: "2026-01-02", avatar: "S" },
    ],
  },
];

export const homeReviews: Review[] = [
  { id: 1, name: "Emma Watson", rating: 5, comment: "Bellara bags are my absolute favorite. The quality and design are unmatched. I've collected three so far!", date: "2026-01-15", avatar: "E" },
  { id: 2, name: "Sophie Chen", rating: 5, comment: "I receive compliments every single day. The Rosa Shoulder Bag is a masterpiece.", date: "2026-01-08", avatar: "S" },
  { id: 3, name: "Aria Johnson", rating: 5, comment: "From packaging to product, everything about Bellara screams luxury. My go-to gift for friends.", date: "2025-12-28", avatar: "A" },
  { id: 4, name: "Luna Martinez", rating: 4, comment: "Exceptional craftsmanship. The leather ages beautifully and the designs are timeless.", date: "2025-12-15", avatar: "L" },
];
