// SQLite Database setup for Pakistani Pizza Shop POS
// STORED ON D DRIVE FOR SAFETY (C Drive can corrupt)
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// ⚠️ IMPORTANT: Database is stored on D drive to prevent data loss if C drive corrupts
// Default location: D:\ShahJePizza\database\
// You can change this path if needed

// Check if D drive exists
const customPath = process.env.DATABASE_PATH || 'D:\\ShahJePizza';
let dataDir;

try {
  // Try to use D drive first
  dataDir = path.join(customPath, 'database');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  console.log(`✅ Using D drive for database: ${dataDir}`);
} catch (error) {
  // Fallback to project directory if D drive not accessible
  console.warn('⚠️ D drive not accessible, using project directory as fallback');
  dataDir = path.join(__dirname, '..', 'database_files');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Database file path
const dbPath = path.join(dataDir, 'shahje-pizza.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_type TEXT NOT NULL CHECK(order_type IN ('takeaway', 'dinein')),
    table_number INTEGER,
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card', 'upi')),
    status TEXT NOT NULL CHECK(status IN ('pending', 'complete', 'incomplete')),
    customer_name TEXT,
    customer_contact TEXT,
    staff_name TEXT NOT NULL,
    amount_paid REAL DEFAULT 0,
    amount_remaining REAL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    product_category TEXT NOT NULL,
    product_image TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS backup_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    type TEXT NOT NULL CHECK(type IN ('auto', 'manual')),
    success INTEGER NOT NULL,
    file_path TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

// Initialize settings
const initSetting = db.prepare(`
  INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
`);

initSetting.run('auto_backup_enabled', 'true');
initSetting.run('last_backup_date', '');

console.log('═══════════════════════════════════════════════════');
console.log('🗄️  DATABASE INITIALIZED');
console.log('═══════════════════════════════════════════════════');
console.log(`📍 Location: ${dbPath}`);
console.log(`💾 Drive: ${dbPath.charAt(0).toUpperCase()} (${dbPath.charAt(0) === 'D' ? '✅ SAFE - Not on C drive' : '⚠️ WARNING - On C drive'})`);
console.log(`📊 File Size: ${fs.existsSync(dbPath) ? (fs.statSync(dbPath).size / 1024).toFixed(2) + ' KB' : '0 KB (new)'}`);
console.log('═══════════════════════════════════════════════════');

// Database operations
const dbOperations = {
  // Orders
  createOrder: (orderData) => {
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_type, table_number, subtotal, discount, total, 
        payment_method, status, customer_name, customer_contact, 
        staff_name, amount_paid, amount_remaining
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, product_price, 
        product_category, product_image, quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((order) => {
      const result = insertOrder.run(
        order.orderType,
        order.tableNumber || null,
        order.subtotal,
        order.discount,
        order.total,
        order.paymentMethod,
        order.status,
        order.customerName || null,
        order.customerContact || null,
        order.staffName,
        order.amountPaid || 0,
        order.amountRemaining || 0
      );

      const orderId = result.lastInsertRowid;

      for (const item of order.items) {
        insertItem.run(
          orderId,
          item.product.id,
          item.product.name,
          item.product.price,
          item.product.category,
          item.product.image,
          item.quantity
        );
      }

      return orderId;
    });

    return transaction(orderData);
  },

  getOrder: (id) => {
    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ?
    `).get(id);

    if (!order) return null;

    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(id);

    return {
      ...order,
      items: items.map(item => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          category: item.product_category,
          image: item.product_image
        },
        quantity: item.quantity
      }))
    };
  },

  getAllOrders: () => {
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC
    `).all();

    return orders.map(order => ({
      ...order,
      items: db.prepare(`
        SELECT * FROM order_items WHERE order_id = ?
      `).all(order.id).map(item => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          category: item.product_category,
          image: item.product_image
        },
        quantity: item.quantity
      }))
    }));
  },

  getOrdersByStatus: (status) => {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC
    `).all(status);

    return orders.map(order => ({
      ...order,
      items: db.prepare(`
        SELECT * FROM order_items WHERE order_id = ?
      `).all(order.id).map(item => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          category: item.product_category,
          image: item.product_image
        },
        quantity: item.quantity
      }))
    }));
  },

  updateOrder: (id, updates) => {
    const updateOrder = db.prepare(`
      UPDATE orders 
      SET status = ?, amount_paid = ?, amount_remaining = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    return updateOrder.run(
      updates.status,
      updates.amountPaid,
      updates.amountRemaining,
      id
    );
  },

  deleteOrder: (id) => {
    return db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  },

  // Settings
  getSetting: (key) => {
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
  },

  setSetting: (key, value) => {
    return db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `).run(key, value);
  },

  // Backup logs
  addBackupLog: (type, success, filePath) => {
    return db.prepare(`
      INSERT INTO backup_logs (type, success, file_path) VALUES (?, ?, ?)
    `).run(type, success ? 1 : 0, filePath);
  },

  getBackupLogs: () => {
    return db.prepare(`
      SELECT * FROM backup_logs ORDER BY timestamp DESC LIMIT 20
    `).all();
  },

  // Backup entire database
  exportData: () => {
    const orders = dbOperations.getAllOrders();
    const settings = db.prepare('SELECT * FROM settings').all();
    const backupLogs = dbOperations.getBackupLogs();

    return {
      version: 1,
      timestamp: new Date().toISOString(),
      database_path: dbPath,
      data: {
        orders,
        settings,
        backupLogs
      }
    };
  },

  // Import data (restore)
  importData: (backupData) => {
    const transaction = db.transaction(() => {
      // Clear existing data
      db.prepare('DELETE FROM order_items').run();
      db.prepare('DELETE FROM orders').run();
      db.prepare('DELETE FROM settings').run();
      db.prepare('DELETE FROM backup_logs').run();

      // Import orders
      if (backupData.data.orders) {
        for (const order of backupData.data.orders) {
          dbOperations.createOrder(order);
        }
      }

      // Import settings
      if (backupData.data.settings) {
        for (const setting of backupData.data.settings) {
          dbOperations.setSetting(setting.key, setting.value);
        }
      }

      // Import backup logs
      if (backupData.data.backupLogs) {
        for (const log of backupData.data.backupLogs) {
          dbOperations.addBackupLog(log.type, log.success, log.file_path || '');
        }
      }
    });

    transaction();
  },

  // Get database stats
  getStats: () => {
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const completeOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "complete"').get().count;
    const incompleteOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "incomplete"').get().count;
    
    return {
      totalOrders: orderCount,
      completeOrders,
      incompleteOrders,
      databasePath: dbPath,
      databaseSize: fs.statSync(dbPath).size
    };
  }
};

module.exports = { db, dbOperations, dbPath };
