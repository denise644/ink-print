export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  availability: boolean;
  compatibility: string[];
  description: string;
  image: string;
  images?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}
