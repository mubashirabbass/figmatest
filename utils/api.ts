// API client for connecting to local database server
import type { Order } from '../types';

const API_URL = 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw error;
  }
}

export interface OrderData {
  orderType: 'takeaway' | 'dinein';
  tableNumber?: number;
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      category: string;
      image: string;
    };
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'pending' | 'complete' | 'incomplete';
  customerName?: string;
  customerContact?: string;
  staffName: string;
  amountPaid?: number;
  amountRemaining?: number;
}

export interface OrderRecord {
  id: number;
  order_type: string;
  table_number?: number;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  status: string;
  customer_name?: string;
  customer_contact?: string;
  staff_name: string;
  amount_paid?: number;
  amount_remaining?: number;
  created_at: string;
  updated_at: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      category: string;
      image: string;
    };
    quantity: number;
  }>;
}

export interface BackupLog {
  id: number;
  timestamp: string;
  type: 'auto' | 'manual';
  success: number;
  file_path?: string;
}

export interface BackupFile {
  filename: string;
  path: string;
  size: number;
  created: string;
  type: 'auto' | 'manual';
}

// Convert database record to Order type
function convertToOrder(record: OrderRecord): Order {
  return {
    id: String(record.id),
    type: record.order_type as 'takeaway' | 'dinein',
    tableNumber: record.table_number,
    items: record.items,
    subtotal: record.subtotal,
    discount: record.discount,
    total: record.total,
    paymentMethod: record.payment_method as 'cash' | 'card' | 'upi',
    status: record.status as 'pending' | 'complete' | 'incomplete',
    customerName: record.customer_name,
    customerContact: record.customer_contact,
    staffName: record.staff_name,
    amountPaid: record.amount_paid,
    amountRemaining: record.amount_remaining,
    timestamp: new Date(record.created_at)
  };
}

// API methods
export const api = {
  // Health check
  async healthCheck() {
    return apiCall<{ status: string; message: string }>('/health');
  },

  // Stats
  async getStats() {
    return apiCall<{
      totalOrders: number;
      completeOrders: number;
      incompleteOrders: number;
      databasePath: string;
      databaseSize: number;
    }>('/stats');
  },

  // Orders
  async createOrder(orderData: OrderData): Promise<Order> {
    const record = await apiCall<OrderRecord>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return convertToOrder(record);
  },

  async getAllOrders(): Promise<Order[]> {
    const records = await apiCall<OrderRecord[]>('/orders');
    return records.map(convertToOrder);
  },

  async getOrder(id: number): Promise<Order> {
    const record = await apiCall<OrderRecord>(`/orders/${id}`);
    return convertToOrder(record);
  },

  async getOrdersByStatus(status: 'complete' | 'incomplete'): Promise<Order[]> {
    const records = await apiCall<OrderRecord[]>(`/orders/status/${status}`);
    return records.map(convertToOrder);
  },

  async updateOrder(id: number, updates: Partial<OrderData>): Promise<Order> {
    const record = await apiCall<OrderRecord>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return convertToOrder(record);
  },

  async deleteOrder(id: number): Promise<void> {
    await apiCall<{ success: boolean }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings
  async getSetting(key: string): Promise<string | null> {
    const result = await apiCall<{ key: string; value: string | null }>(`/settings/${key}`);
    return result.value;
  },

  async setSetting(key: string, value: string): Promise<void> {
    await apiCall('/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  },

  // Backup
  async getBackupLogs(): Promise<BackupLog[]> {
    return apiCall<BackupLog[]>('/backup/logs');
  },

  async createBackup(): Promise<{ success: boolean; filePath?: string; filename?: string }> {
    return apiCall('/backup/create', {
      method: 'POST',
    });
  },

  async listBackups(): Promise<BackupFile[]> {
    return apiCall<BackupFile[]>('/backup/list');
  },

  async downloadBackup(filename: string): Promise<void> {
    window.open(`${API_URL}/backup/download/${filename}`, '_blank');
  },

  async restoreBackup(file: File): Promise<{ success: boolean; error?: string }> {
    const formData = new FormData();
    formData.append('backup', file);

    const response = await fetch(`${API_URL}/backup/restore`, {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  },

  async toggleAutoBackup(enabled: boolean): Promise<void> {
    await apiCall('/backup/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  async exportData(): Promise<any> {
    return apiCall('/backup/export');
  },

  // Products
  async getAllProducts(): Promise<any[]> {
    return apiCall<any[]>('/products');
  },

  async saveProducts(products: any[]): Promise<{ success: boolean; count: number }> {
    return apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(products),
    });
  },

  async addProduct(product: any): Promise<{ success: boolean; product: any }> {
    return apiCall('/products/add', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, product: any): Promise<{ success: boolean; product: any }> {
    return apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return apiCall(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
