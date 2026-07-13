export type Variant = {
  size: string;
  price: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  nameBg: string;
  description: string;
  descriptionBg: string;
  brand: string;
  category: string;
  volume: string;
  gender: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  images: string[];
  notes: string;
  notesBg: string;
  variants: Variant[];
  featured: boolean;
  inPromotion: boolean;
  discountPct: number | null;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PurchaseRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  items: unknown;
  status: string;
  createdAt: Date;
};
