export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber?: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'complete' | 'incomplete';
  type: 'takeaway' | 'dinein' | 'delivery';
  paymentMethod: 'cash' | 'card' | 'upi';
  timestamp: Date;
  customerName?: string;
  customerContact?: string;
  customerAddress?: string;
  amountPaid?: number;
  amountRemaining?: number;
  staffName: string;
}

export interface Table {
  number: number;
  status: 'available' | 'occupied';
  currentOrder?: Order;
}
