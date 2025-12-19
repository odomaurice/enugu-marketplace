export interface Order {
  id: string;
  userId: string;
  addressId: string;
  totalAmount: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingCode: string | null;
  placedAt: string;
  deliveredAt: string | null;
  cancelledAt: string | null;
  updatedAt: string;
  couponId: string | null;
  discount: number;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string | null;
  productId: string | null;
  quantity: number;
  unitPrice: number;
  currency: string;
  total: number;
  variant?: ProductVariant;
  Product?: Product;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  netWeight: number;
  price: number;
  currency: string;
  image: string;
  attribute: string | null;
  expiryDate: string;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  brand: string | null;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  shelfLifeDays: number | null;
  unit: string;
  packageType: string;
  active: boolean;
  categoryId: string;
}