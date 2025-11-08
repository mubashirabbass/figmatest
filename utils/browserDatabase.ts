// Browser-based database using IndexedDB for Figma Make environment
import type { Order, Product } from '../types';

const DB_NAME = 'ShahJePizzaDB';
const DB_VERSION = 1;

// Initialize IndexedDB
let db: IDBDatabase | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains('orders')) {
        const orderStore = database.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        orderStore.createIndex('status', 'status', { unique: false });
        orderStore.createIndex('type', 'order_type', { unique: false });
      }

      if (!database.objectStoreNames.contains('products')) {
        database.createObjectStore('products', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

// Helper to get object store
function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
  return openDatabase().then(database => {
    const transaction = database.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  });
}

// Orders
export async function createOrder(orderData: any): Promise<Order> {
  const database = await openDatabase();
  const transaction = database.transaction('orders', 'readwrite');
  const store = transaction.objectStore('orders');

  return new Promise((resolve, reject) => {
    const record = {
      order_type: orderData.orderType,
      table_number: orderData.tableNumber,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      total: orderData.total,
      payment_method: orderData.paymentMethod,
      status: orderData.status,
      customer_name: orderData.customerName,
      customer_contact: orderData.customerContact,
      staff_name: orderData.staffName,
      amount_paid: orderData.amountPaid || 0,
      amount_remaining: orderData.amountRemaining || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const request = store.add(record);

    request.onsuccess = () => {
      const id = request.result as number;
      resolve({
        id: String(id),
        type: orderData.orderType,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        customerName: orderData.customerName,
        customerContact: orderData.customerContact,
        staffName: orderData.staffName,
        amountPaid: orderData.amountPaid || 0,
        amountRemaining: orderData.amountRemaining || 0,
        timestamp: new Date()
      });
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getAllOrders(): Promise<Order[]> {
  const store = await getStore('orders');

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result;
      const orders = records.map((record: any) => ({
        id: String(record.id),
        type: record.order_type,
        tableNumber: record.table_number,
        items: record.items,
        subtotal: record.subtotal,
        discount: record.discount,
        total: record.total,
        paymentMethod: record.payment_method,
        status: record.status,
        customerName: record.customer_name,
        customerContact: record.customer_contact,
        staffName: record.staff_name,
        amountPaid: record.amount_paid || 0,
        amountRemaining: record.amount_remaining || 0,
        timestamp: new Date(record.created_at)
      }));
      resolve(orders);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function updateOrder(id: number, updates: any): Promise<Order> {
  const database = await openDatabase();
  const transaction = database.transaction('orders', 'readwrite');
  const store = transaction.objectStore('orders');

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const record = getRequest.result;
      if (!record) {
        reject(new Error('Order not found'));
        return;
      }

      const updatedRecord = {
        ...record,
        order_type: updates.orderType || record.order_type,
        table_number: updates.tableNumber !== undefined ? updates.tableNumber : record.table_number,
        items: updates.items || record.items,
        subtotal: updates.subtotal !== undefined ? updates.subtotal : record.subtotal,
        discount: updates.discount !== undefined ? updates.discount : record.discount,
        total: updates.total !== undefined ? updates.total : record.total,
        payment_method: updates.paymentMethod || record.payment_method,
        status: updates.status || record.status,
        customer_name: updates.customerName !== undefined ? updates.customerName : record.customer_name,
        customer_contact: updates.customerContact !== undefined ? updates.customerContact : record.customer_contact,
        staff_name: updates.staffName || record.staff_name,
        amount_paid: updates.amountPaid !== undefined ? updates.amountPaid : record.amount_paid,
        amount_remaining: updates.amountRemaining !== undefined ? updates.amountRemaining : record.amount_remaining,
        updated_at: new Date().toISOString()
      };

      const putRequest = store.put(updatedRecord);

      putRequest.onsuccess = () => {
        resolve({
          id: String(id),
          type: updatedRecord.order_type,
          tableNumber: updatedRecord.table_number,
          items: updatedRecord.items,
          subtotal: updatedRecord.subtotal,
          discount: updatedRecord.discount,
          total: updatedRecord.total,
          paymentMethod: updatedRecord.payment_method,
          status: updatedRecord.status,
          customerName: updatedRecord.customer_name,
          customerContact: updatedRecord.customer_contact,
          staffName: updatedRecord.staff_name,
          amountPaid: updatedRecord.amount_paid,
          amountRemaining: updatedRecord.amount_remaining,
          timestamp: new Date(updatedRecord.created_at)
        });
      };

      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Products
export async function getAllProducts(): Promise<Product[]> {
  const store = await getStore('products');

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveProducts(products: Product[]): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction('products', 'readwrite');
  const store = transaction.objectStore('products');

  return new Promise((resolve, reject) => {
    // Clear existing products
    store.clear();

    // Add all products
    products.forEach(product => {
      store.add(product);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function addProduct(product: Product): Promise<void> {
  const store = await getStore('products', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.add(product);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateProduct(id: string, product: Product): Promise<void> {
  const store = await getStore('products', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.put(product);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const store = await getStore('products', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Settings
export async function getSetting(key: string): Promise<string | null> {
  const store = await getStore('settings');

  return new Promise((resolve, reject) => {
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : null);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function setSetting(key: string, value: string): Promise<void> {
  const store = await getStore('settings', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.put({ key, value });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Export/Import for backups
export async function exportAllData(): Promise<any> {
  const orders = await getAllOrders();
  const products = await getAllProducts();

  return {
    orders,
    products,
    exportDate: new Date().toISOString()
  };
}

export async function importAllData(data: any): Promise<void> {
  if (data.products) {
    await saveProducts(data.products);
  }

  if (data.orders) {
    const database = await openDatabase();
    const transaction = database.transaction('orders', 'readwrite');
    const store = transaction.objectStore('orders');

    store.clear();

    data.orders.forEach((order: Order) => {
      store.add({
        order_type: order.type,
        table_number: order.tableNumber,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        payment_method: order.paymentMethod,
        status: order.status,
        customer_name: order.customerName,
        customer_contact: order.customerContact,
        staff_name: order.staffName,
        amount_paid: order.amountPaid || 0,
        amount_remaining: order.amountRemaining || 0,
        created_at: order.timestamp ? new Date(order.timestamp).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
  }
}
