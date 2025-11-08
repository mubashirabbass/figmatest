// Local Database using IndexedDB for offline POS system
import type { Order, Product } from '../types';

const DB_NAME = 'ShahJePizzaDB';
const DB_VERSION = 2;

// Store names
const STORES = {
  ORDERS: 'orders',
  PRODUCTS: 'products',
  SETTINGS: 'settings',
  BACKUP_LOG: 'backupLog'
};

export interface OrderRecord extends Order {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackupLogEntry {
  id: number;
  timestamp: string;
  type: 'auto' | 'manual';
  success: boolean;
}

export interface Settings {
  lastBackupDate: string;
  nextOrderId: number;
  autoBackupEnabled: boolean;
}

class LocalDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    // Request persistent storage to prevent browser from clearing data
    await this.requestPersistentStorage();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB opened successfully');
        this.verifyDataIntegrity();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('📦 Creating/Updating database schema...');

        // Orders store
        if (!db.objectStoreNames.contains(STORES.ORDERS)) {
          const orderStore = db.createObjectStore(STORES.ORDERS, { 
            keyPath: 'id', 
            autoIncrement: false 
          });
          orderStore.createIndex('status', 'status', { unique: false });
          orderStore.createIndex('orderType', 'orderType', { unique: false });
          orderStore.createIndex('createdAt', 'createdAt', { unique: false });
          orderStore.createIndex('tableNumber', 'tableNumber', { unique: false });
          console.log('✅ Orders store created');
        }

        // Products store
        if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
          db.createObjectStore(STORES.PRODUCTS, { 
            keyPath: 'id'
          });
          console.log('✅ Products store created');
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
          console.log('✅ Settings store created');
        }

        // Backup log store
        if (!db.objectStoreNames.contains(STORES.BACKUP_LOG)) {
          db.createObjectStore(STORES.BACKUP_LOG, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          console.log('✅ Backup log store created');
        }
      };
    });
  }

  // Request persistent storage to prevent browser from clearing data
  private async requestPersistentStorage(): Promise<void> {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      if (isPersisted) {
        console.log('✅ Storage will persist and won\'t be cleared by browser');
      } else {
        console.warn('⚠️ Storage may be cleared by browser under pressure');
      }
      
      // Check current persistence status
      if (navigator.storage.persisted) {
        const persisted = await navigator.storage.persisted();
        console.log('📊 Storage persisted status:', persisted);
      }
    } else {
      console.warn('⚠️ Persistent storage API not available');
    }
  }

  // Verify data integrity on startup
  private async verifyDataIntegrity(): Promise<void> {
    try {
      const orders = await this.getAllOrders();
      const products = await this.getAllProducts();
      console.log(`📊 Database loaded: ${orders.length} orders, ${products.length} products`);
      
      // Show storage usage
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
        const quotaMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(2);
        console.log(`💾 Storage: ${usedMB} MB used of ${quotaMB} MB available`);
      }
    } catch (error) {
      console.error('❌ Data integrity check failed:', error);
    }
  }

  // Get storage information
  async getStorageInfo(): Promise<{ used: number; quota: number; percentage: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;
      return { used, quota, percentage };
    }
    return { used: 0, quota: 0, percentage: 0 };
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Orders
  async addOrder(order: Order): Promise<number> {
    const nextId = await this.getNextOrderId();
    const orderRecord: OrderRecord = {
      ...order,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.ORDERS, 'readwrite');
      const request = store.add(orderRecord);
      request.onsuccess = () => {
        this.incrementOrderId();
        resolve(nextId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<void> {
    const order = await this.getOrder(id);
    if (!order) throw new Error('Order not found');

    const updatedOrder: OrderRecord = {
      ...order,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.ORDERS, 'readwrite');
      const request = store.put(updatedOrder);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOrder(id: number): Promise<OrderRecord | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.ORDERS);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllOrders(): Promise<OrderRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.ORDERS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOrdersByStatus(status: 'complete' | 'incomplete'): Promise<OrderRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.ORDERS);
      const index = store.index('status');
      const request = index.getAll(status);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOrdersByType(orderType: 'takeaway' | 'dinein'): Promise<OrderRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.ORDERS);
      const index = store.index('orderType');
      const request = index.getAll(orderType);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getIncompleteOrdersByTable(tableNumber: number): Promise<OrderRecord[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(
      order => order.status === 'incomplete' && 
               order.orderType === 'dinein' && 
               order.tableNumber === tableNumber
    );
  }

  async deleteOrder(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.ORDERS, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings
  private async getSetting(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.SETTINGS);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  private async setSetting(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.SETTINGS, 'readwrite');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getNextOrderId(): Promise<number> {
    const nextId = await this.getSetting('nextOrderId');
    return nextId || 1;
  }

  private async incrementOrderId(): Promise<void> {
    const currentId = await this.getNextOrderId();
    await this.setSetting('nextOrderId', currentId + 1);
  }

  async getLastBackupDate(): Promise<string | null> {
    return await this.getSetting('lastBackupDate');
  }

  async setLastBackupDate(date: string): Promise<void> {
    await this.setSetting('lastBackupDate', date);
  }

  async getAutoBackupEnabled(): Promise<boolean> {
    const enabled = await this.getSetting('autoBackupEnabled');
    // Default to false to prevent auto-downloads on startup
    return enabled === true;
  }

  async setAutoBackupEnabled(enabled: boolean): Promise<void> {
    await this.setSetting('autoBackupEnabled', enabled);
  }

  // Backup log
  async addBackupLog(type: 'auto' | 'manual', success: boolean): Promise<void> {
    const entry: Omit<BackupLogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      type,
      success
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.BACKUP_LOG, 'readwrite');
      const request = store.add(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getBackupLogs(): Promise<BackupLogEntry[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.BACKUP_LOG);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.PRODUCTS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addProduct(product: Product): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.PRODUCTS, 'readwrite');
      const request = store.add(product);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateProduct(product: Product): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.PRODUCTS, 'readwrite');
      const request = store.put(product);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORES.PRODUCTS, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async initializeProducts(products: Product[]): Promise<void> {
    const existingProducts = await this.getAllProducts();
    if (existingProducts.length === 0) {
      for (const product of products) {
        await this.addProduct(product);
      }
    }
  }

  // Export all data for backup
  async exportAllData(): Promise<string> {
    const orders = await this.getAllOrders();
    const products = await this.getAllProducts();
    const settings = {
      nextOrderId: await this.getNextOrderId(),
      lastBackupDate: await this.getLastBackupDate(),
      autoBackupEnabled: await this.getAutoBackupEnabled()
    };
    const backupLogs = await this.getBackupLogs();

    const backup = {
      version: DB_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        orders,
        products,
        settings,
        backupLogs
      }
    };

    return JSON.stringify(backup, null, 2);
  }

  // Import data from backup
  async importData(backupJson: string): Promise<void> {
    try {
      const backup = JSON.parse(backupJson);
      
      if (!backup.data) {
        throw new Error('Invalid backup format');
      }

      // Clear existing data
      await this.clearAllData();

      // Import orders
      if (backup.data.orders) {
        for (const order of backup.data.orders) {
          const store = this.getStore(STORES.ORDERS, 'readwrite');
          await new Promise((resolve, reject) => {
            const request = store.add(order);
            request.onsuccess = () => resolve(null);
            request.onerror = () => reject(request.error);
          });
        }
      }

      // Import products
      if (backup.data.products) {
        for (const product of backup.data.products) {
          const store = this.getStore(STORES.PRODUCTS, 'readwrite');
          await new Promise((resolve, reject) => {
            const request = store.add(product);
            request.onsuccess = () => resolve(null);
            request.onerror = () => reject(request.error);
          });
        }
      }

      // Import settings
      if (backup.data.settings) {
        if (backup.data.settings.nextOrderId) {
          await this.setSetting('nextOrderId', backup.data.settings.nextOrderId);
        }
        if (backup.data.settings.lastBackupDate) {
          await this.setSetting('lastBackupDate', backup.data.settings.lastBackupDate);
        }
        if (backup.data.settings.autoBackupEnabled !== undefined) {
          await this.setSetting('autoBackupEnabled', backup.data.settings.autoBackupEnabled);
        }
      }

      // Import backup logs
      if (backup.data.backupLogs) {
        for (const log of backup.data.backupLogs) {
          const store = this.getStore(STORES.BACKUP_LOG, 'readwrite');
          await new Promise((resolve, reject) => {
            const request = store.add(log);
            request.onsuccess = () => resolve(null);
            request.onerror = () => reject(request.error);
          });
        }
      }

    } catch (error) {
      throw new Error('Failed to import backup: ' + (error as Error).message);
    }
  }

  async clearAllData(): Promise<void> {
    const stores = [STORES.ORDERS, STORES.PRODUCTS, STORES.SETTINGS, STORES.BACKUP_LOG];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.clear();
        request.onsuccess = () => resolve(null);
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Singleton instance
export const localDB = new LocalDatabase();
