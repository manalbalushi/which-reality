export type Locale = "en" | "ar";

export interface LocalizedText {
  en: string;
  ar: string;
}

/** A curated soft color pairing used to render elegant placeholder "photography" */
export interface Swatch {
  from: string;
  to: string;
  accent: string;
  icon: IconName;
}

export type IconName =
  | "perfume"
  | "candle"
  | "coffee"
  | "chocolate"
  | "dates"
  | "stationery"
  | "accessories"
  | "hair"
  | "travel"
  | "selfcare"
  | "home"
  | "omani"
  | "baby"
  | "beauty"
  | "bag"
  | "basket"
  | "tote"
  | "pouch"
  | "box"
  | "tray"
  | "gift"
  | "sparkle";

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  icon: IconName;
}

export interface Occasion {
  id: string;
  slug: string;
  name: LocalizedText;
  blurb: LocalizedText;
  swatch: Swatch;
}

export type GiftStyle =
  | "feminine"
  | "minimal"
  | "luxury"
  | "wellness"
  | "coffee"
  | "omani"
  | "cute"
  | "executive";

export interface StyleDef {
  id: GiftStyle;
  name: LocalizedText;
}

export interface Recipient {
  id: string;
  name: LocalizedText;
}

export interface Packaging {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  swatch: Swatch;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  category: string;
  occasions: string[];
  styles: GiftStyle[];
  swatch: Swatch;
  stock: number;
  featured?: boolean;
  badge?: LocalizedText;
}

export interface Personalization {
  recipientName: string;
  message: string;
  greetingCard: boolean;
  companyLogo: boolean;
  customRibbon: boolean;
  personalizedTag: boolean;
}

export interface CartLineProduct {
  productId: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  kind: "product" | "gift-build";
  quantity: number;
  // Direct product purchase
  productId?: string;
  // Gift build fields
  recipient?: string;
  occasion?: string;
  budget?: number;
  style?: GiftStyle;
  packagingId?: string;
  products?: CartLineProduct[];
  personalization?: Personalization;
  unitPrice: number;
}

export type OrderStatus =
  | "New"
  | "Confirmed"
  | "Being Prepared"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface Address {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  area: string;
  city: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: Address;
  items: CartItem[];
  isGift: boolean;
  deliveryDate: string;
  deliveryMethod: "Standard" | "Express" | "Scheduled";
  deliveryRegion: "Muscat" | "Other";
  giftRecipientName: string;
  giftMessage: string;
  paymentMethod: "Card" | "Apple Pay" | "Online Payment" | "Cash on Delivery";
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface CorporateRequest {
  id: string;
  createdAt: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  numberOfGifts: number;
  budgetPerGift: number;
  occasion: string;
  preferredDeliveryDate: string;
  message: string;
  status: "New" | "Contacted" | "Quoted" | "Closed";
}
