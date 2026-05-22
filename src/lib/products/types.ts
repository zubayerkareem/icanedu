// Shared Product types used across homepage, listing, and detail pages.

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  image_url?: string;
  images?: string[]; // gallery; first item is primary if image_url not set
  price?: number;
  discount_price?: number;
  short_description?: string;
  long_description?: string;
  in_stock?: boolean;
  delivery_info?: string;
  contact_info?: string;
  sales_count?: number;
  created_at?: string;
}
