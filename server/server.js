// Node.js Express server for Pakistani Pizza Shop POS
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbOperations } = require('./database');
const backupService = require('./backupService');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads (backup restore)
const upload = multer({ dest: 'uploads/' });

// Start backup service
backupService.start();

// ============= API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get database stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = dbOperations.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ORDERS =============

// Create order
app.post('/api/orders', (req, res) => {
  try {
    const orderId = dbOperations.createOrder(req.body);
    const order = dbOperations.getOrder(orderId);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = dbOperations.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = dbOperations.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders by status
app.get('/api/orders/status/:status', (req, res) => {
  try {
    const orders = dbOperations.getOrdersByStatus(req.params.status);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order
app.put('/api/orders/:id', (req, res) => {
  try {
    dbOperations.updateOrder(req.params.id, req.body);
    const order = dbOperations.getOrder(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  try {
    dbOperations.deleteOrder(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SETTINGS =============

// Get setting
app.get('/api/settings/:key', (req, res) => {
  try {
    const value = dbOperations.getSetting(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set setting
app.post('/api/settings', (req, res) => {
  try {
    const { key, value } = req.body;
    dbOperations.setSetting(key, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= PRODUCTS =============

// Products are stored in JSON file on D drive
const customPath = process.env.DATABASE_PATH || 'D:\\ShahJePizza';
let productsFilePath;

try {
  const productsDir = path.join(customPath, 'data');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
  productsFilePath = path.join(productsDir, 'products.json');
  console.log(`✅ Products file: ${productsFilePath}`);
} catch (error) {
  productsFilePath = path.join(__dirname, '..', 'data', 'products.json');
}

// Initialize products file if it doesn't exist
if (!fs.existsSync(productsFilePath)) {
  fs.writeFileSync(productsFilePath, JSON.stringify([], null, 2));
}

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    const products = JSON.parse(productsData);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save products (add or update)
app.post('/api/products', (req, res) => {
  try {
    const products = req.body;
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    res.json({ success: true, count: products.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add single product
app.post('/api/products/add', (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    const products = JSON.parse(productsData);
    products.push(req.body);
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    res.json({ success: true, product: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update single product
app.put('/api/products/:id', (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    let products = JSON.parse(productsData);
    const index = products.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body };
      fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
      res.json({ success: true, product: products[index] });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    let products = JSON.parse(productsData);
    products = products.filter(p => p.id !== req.params.id);
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= BACKUP =============

// Get backup logs
app.get('/api/backup/logs', (req, res) => {
  try {
    const logs = dbOperations.getBackupLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create manual backup
app.post('/api/backup/create', (req, res) => {
  try {
    const result = backupService.performManualBackup();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download backup file
app.get('/api/backup/download/:filename', (req, res) => {
  try {
    const customPath = process.env.DATABASE_PATH || 'D:\\ShahJePizza';
    const backupDir = fs.existsSync(path.join(customPath, 'backups')) 
      ? path.join(customPath, 'backups')
      : path.join(__dirname, '..', 'backups');
    
    const filePath = path.join(backupDir, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all backups
app.get('/api/backup/list', (req, res) => {
  try {
    const backups = backupService.listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore from backup
app.post('/api/backup/restore', upload.single('backup'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No backup file provided' });
    }

    const result = backupService.restoreFromBackup(req.file.path);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle auto backup
app.post('/api/backup/toggle', (req, res) => {
  try {
    const { enabled } = req.body;
    dbOperations.setSetting('auto_backup_enabled', enabled ? 'true' : 'false');
    res.json({ success: true, enabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data
app.get('/api/backup/export', (req, res) => {
  try {
    const data = dbOperations.exportData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= START SERVER =============

app.listen(PORT, () => {
  const customPath = process.env.DATABASE_PATH || 'D:\\ShahJePizza';
  const isDDrive = customPath.startsWith('D:');
  
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║                                                      ║');
  console.log('║       🍕 SHAH JE PIZZA POS SERVER - OFFLINE 🍕       ║');
  console.log('║                                                      ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log('🌐 Server Status:');
  console.log(`   ✅ Running on: http://localhost:${PORT}`);
  console.log(`   ✅ Mode: Offline (No internet required)`);
  console.log('');
  console.log('💾 Data Storage:');
  console.log(`   ${isDDrive ? '✅' : '⚠️'} Drive: ${customPath.charAt(0)}: ${isDDrive ? '(SAFE - D Drive)' : '(WARNING - Not on D Drive)'}`);
  console.log(`   📁 Database: ${customPath}\\database\\shahje-pizza.db`);
  console.log(`   📁 Backups:  ${customPath}\\backups\\`);
  console.log(`   📁 Products: ${customPath}\\data\\products.json`);
  console.log('');
  console.log('🔒 Security:');
  console.log('   ✅ All data stored locally (no cloud)');
  console.log('   ✅ Works without internet');
  console.log('   ✅ Data safe from C drive corruption');
  console.log('');
  console.log('📊 Auto Backup:');
  console.log('   ✅ Enabled (every 24 hours)');
  console.log('   ✅ Keeps last 30 days of backups');
  console.log('');
  console.log('💡 To change storage location:');
  console.log('   Set environment variable: DATABASE_PATH');
  console.log('   Example: SET DATABASE_PATH=E:\\MyPOSData');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  backupService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  backupService.stop();
  process.exit(0);
});
