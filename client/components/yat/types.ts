export type Yacht = {
  id: string;
  title: string;
  location: string; // city/area
  marina?: string;
  price: number; // base price per hour/day
  currency?: string;
  capacity: number;
  image: string; // primary image
  images?: string[]; // gallery
  video?: string; // optional promo video url
  specs?: {
    length?: string;
    width?: string;
    cabins?: number;
    wc?: number;
    buildYear?: number;
    speed?: string;
    crew?: number;
  };
  amenities?: string[]; // identifiers matching FilterSidebar features
  coords?: { lat: number; lng: number };
  description?: string;
};
