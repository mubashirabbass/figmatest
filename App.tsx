import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { OrderModeSelection } from './components/OrderModeSelection';
import { TakeAwayPage } from './components/TakeAwayPage';
import { DineInPage } from './components/DineInPage';
import { DeliveryPage } from './components/DeliveryPage';
import { OrderTakingPage } from './components/OrderTakingPage';
import { Table, Order, Product } from './types';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { defaultProducts } from './data/products';
import { api } from './utils/api';

type View = 'login' | 'dashboard' | 'order-mode' | 'takeaway' | 'dinein' | 'delivery' | 'order-taking';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [incompleteOrders, setIncompleteOrders] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const [currentUser, setCurrentUser] = useState('');
  const [isDbReady, setIsDbReady] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      status: 'available',
    }))
  );

  // Connect to SQLite backend server (RUNS ONCE ON APP START)
  useEffect(() => {
    const connectToServer = async () => {
      try {
        console.log('🚀 Connecting to SQLite3 backend server...');
        console.log('📍 Server URL: http://localhost:3001');
        
        // Check if server is running
        const healthCheck = await api.healthCheck();
        console.log('✅ Server connected:', healthCheck);
        
        // Initialize products if needed
        try {
          const existingProducts = await api.getAllProducts();
          if (existingProducts.length === 0) {
            console.log('📦 Initializing products...');
            await api.saveProducts(defaultProducts);
            console.log('✅ Products initialized');
          }
        } catch (error) {
          console.log('📦 Setting up initial products...');
          await api.saveProducts(defaultProducts);
        }
        
        setIsDbReady(true);
        
        console.log('═══════════════════════════════════════════════════');
        console.log('✅ CONNECTED TO SQLITE3 DATABASE ON D DRIVE');
        console.log('═══════════════════════════════════════════════════');
        console.log('💾 Database: D:\\ShahJePizza\\database\\shahje-pizza.db');
        console.log('📦 Backups:  D:\\ShahJePizza\\backups\\');
        console.log('📁 Products: D:\\ShahJePizza\\data\\products.json');
        console.log('🛡️  SQLite3: ACID compliant, no data loss!');
        console.log('🔒 Offline: Works without internet');
        console.log('═══════════════════════════════════════════════════');
        
      } catch (error) {
        console.error('❌ Failed to connect to server:', error);
        console.error('');
        console.error('═══════════════════════════════════════════════════');
        console.error('⚠️  BACKEND SERVER NOT RUNNING!');
        console.error('═══════════════════════════════════════════════════');
        console.error('');
        console.error('Please start the backend server:');
        console.error('  1. Open new terminal');
        console.error('  2. cd to your project folder');
        console.error('  3. npm run server');
        console.error('');
        console.error('OR double-click: start-complete-system.bat');
        console.error('');
        console.error('═══════════════════════════════════════════════════');
        
        setServerError(true);
        
        toast.error('Backend server not running! Please start it.', { 
          duration: 10000,
          description: 'Run: npm run server'
        });
      }
    };

    connectToServer();
  }, []); // Empty dependency array = runs ONLY ONCE on mount

  // Load data from SQLite database when ready (INITIAL LOAD BEFORE LOGIN)
  useEffect(() => {
    const loadData = async () => {
      if (!isDbReady) return;

      try {
        console.log('📂 Loading data from SQLite3 database on D drive...');
        
        // Load products from D drive
        const loadedProducts = await api.getAllProducts();
        setProducts(loadedProducts);

        // Load orders from D drive SQLite database
        const allOrders = await api.getAllOrders();
        const completed = allOrders.filter(o => o.status === 'complete');
        const incomplete = allOrders.filter(o => o.status === 'incomplete');
        
        setCompletedOrders(completed);
        setIncompleteOrders(incomplete);

        // Set order counter to next available ID
        if (allOrders.length > 0) {
          const maxId = Math.max(...allOrders.map(o => parseInt(o.id) || 0));
          setOrderCounter(maxId + 1);
        }

        // Update table statuses based on incomplete orders
        const incompleteTableOrders = incomplete.filter(o => o.type === 'dinein');
        setTables(prevTables =>
          prevTables.map(table => {
            const tableOrder = incompleteTableOrders.find(o => o.tableNumber === table.number);
            if (tableOrder) {
              return {
                ...table,
                status: 'occupied' as const,
                currentOrder: tableOrder
              };
            }
            return table;
          })
        );

        console.log(`✅ Data loaded from D drive: ${completed.length} completed, ${incomplete.length} incomplete orders`);
        console.log(`📦 Products loaded: ${loadedProducts.length} items`);
        console.log(`🔢 Next order ID: ${allOrders.length > 0 ? Math.max(...allOrders.map(o => parseInt(o.id) || 0)) + 1 : 1}`);
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        toast.error('Failed to load data from SQLite database', { duration: 2000 });
      }
    };

    loadData();
  }, [isDbReady]); // Runs when database becomes ready

  const handleLogin = async (username: string) => {
    if (!isDbReady) {
      toast.error('Server not connected. Please start backend server.', { duration: 2000 });
      return;
    }
    
    // Reload data from SQLite on login (ENSURES FRESH DATA FROM D DRIVE)
    try {
      console.log('📂 Reloading all data from SQLite3 database on login...');
      
      // Load products from D drive
      const loadedProducts = await api.getAllProducts();
      setProducts(loadedProducts);

      // Load ALL orders from SQLite database
      const allOrders = await api.getAllOrders();
      const completed = allOrders.filter(o => o.status === 'complete');
      const incomplete = allOrders.filter(o => o.status === 'incomplete');
      
      setCompletedOrders(completed);
      setIncompleteOrders(incomplete);

      // Update order counter
      if (allOrders.length > 0) {
        const maxId = Math.max(...allOrders.map(o => parseInt(o.id) || 0));
        setOrderCounter(maxId + 1);
      }

      // Update table statuses based on incomplete orders
      const incompleteTableOrders = incomplete.filter(o => o.type === 'dinein');
      setTables(prevTables =>
        prevTables.map(table => {
          const tableOrder = incompleteTableOrders.find(o => o.tableNumber === table.number);
          if (tableOrder) {
            return {
              ...table,
              status: 'occupied' as const,
              currentOrder: tableOrder
            };
          }
          return { ...table, status: 'available' as const, currentOrder: undefined };
        })
      );

      console.log('═══════════════════════════════════════════════════');
      console.log('✅ DATA LOADED FROM SQLITE3 ON D DRIVE');
      console.log('═══════════════════════════════════════════════════');
      console.log(`📊 Complete orders: ${completed.length}`);
      console.log(`⏳ Incomplete orders: ${incomplete.length}`);
      console.log(`📦 Products: ${loadedProducts.length}`);
      console.log(`💾 Source: D:\\ShahJePizza\\database\\shahje-pizza.db`);
      console.log('═══════════════════════════════════════════════════');
      
      // Show success message with data count
      const totalOrders = completed.length + incomplete.length;
      if (totalOrders > 0) {
        toast.success(`Welcome! Loaded ${totalOrders} orders from D drive`, { 
          duration: 2000,
          description: `${completed.length} complete, ${incomplete.length} pending`
        });
      } else {
        toast.success('Connected to SQLite3 database', { duration: 1500 });
      }
    } catch (error) {
      console.error('❌ Failed to reload data on login:', error);
      toast.error('Failed to load data from server', { 
        duration: 2000,
        description: 'Make sure backend server is running'
      });
    }
    
    setIsAuthenticated(true);
    setCurrentUser(username);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('login');
    setCurrentUser('');
    console.log('👋 Logged out - Data remains safe in SQLite3 on D drive');
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      await api.updateProduct(product.id, product);
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      toast.success('Product updated on D drive', { duration: 1000 });
      console.log('✅ Product updated on D drive:', product.name);
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product', { duration: 1000 });
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
      await api.addProduct(product);
      setProducts(prev => [...prev, product]);
      toast.success('Product added to D drive', { duration: 1000 });
      console.log('✅ Product added to D drive:', product.name);
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product', { duration: 1000 });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted from D drive', { duration: 1000 });
      console.log('✅ Product deleted from D drive');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product', { duration: 1000 });
    }
  };

  const handleCompleteIncompleteOrder = async (orderId: string, remainingAmount: number) => {
    const order = incompleteOrders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder = {
      ...order,
      status: 'complete' as const,
      amountPaid: order.total,
      amountRemaining: 0
    };

    try {
      // Update in SQLite database on D drive
      await api.updateOrder(parseInt(orderId), {
        orderType: order.type,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        customerContact: order.customerContact,
        staffName: order.staffName,
        status: 'complete',
        amountPaid: order.total,
        amountRemaining: 0
      });

      setIncompleteOrders(prev => prev.filter(o => o.id !== orderId));
      setCompletedOrders(prev => [...prev, updatedOrder]);
      
      toast.success('Order completed and saved to D drive', { duration: 1000 });
      console.log('✅ Order completed and saved to SQLite3:', orderId);
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to complete order', { duration: 1000 });
    }
  };

  const handleNewOrder = () => {
    setCurrentView('order-mode');
  };

  const handleSelectMode = (mode: 'takeaway' | 'dinein' | 'delivery') => {
    setCurrentView(mode);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTable(null);
  };

  const handleBackToOrderMode = () => {
    setCurrentView('order-mode');
    setSelectedTable(null);
  };

  const handleSelectTable = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setCurrentView('order-taking');
  };

  const handleSaveOrder = (order: Order) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.number === order.tableNumber
          ? { ...table, status: 'occupied', currentOrder: order }
          : table
      )
    );
  };

  const handleCompleteTakeAwayOrder = async (order: Order) => {
    try {
      // Save to SQLite database on D drive
      const orderToSave = {
        orderType: order.type,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        customerContact: order.customerContact,
        staffName: order.staffName,
        status: order.status,
        amountPaid: order.amountPaid || 0,
        amountRemaining: order.amountRemaining || 0
      };

      const savedOrder = await api.createOrder(orderToSave);

      if (order.status === 'incomplete') {
        setIncompleteOrders(prev => [...prev, savedOrder]);
      } else {
        setCompletedOrders(prev => [...prev, savedOrder]);
      }
      
      toast.success('Order saved to SQLite3 on D drive', { duration: 1500 });
      console.log('✅ Order saved to D drive SQLite3:', savedOrder.id);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Failed to save order:', error);
      toast.error('Failed to save order', { duration: 2000 });
    }
  };

  const handleCompleteDineInOrder = async (tableNumber: number, order: Order) => {
    try {
      // Save to SQLite database on D drive
      const orderToSave = {
        orderType: order.type,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        customerContact: order.customerContact,
        staffName: order.staffName,
        status: order.status,
        amountPaid: order.amountPaid || 0,
        amountRemaining: order.amountRemaining || 0
      };

      const savedOrder = await api.createOrder(orderToSave);

      if (order.status === 'incomplete') {
        setIncompleteOrders(prev => [...prev, savedOrder]);
      } else {
        setCompletedOrders(prev => [...prev, savedOrder]);
      }
      
      setTables(prevTables =>
        prevTables.map(table =>
          table.number === tableNumber
            ? { ...table, status: 'available', currentOrder: undefined }
            : table
        )
      );
      
      toast.success('Order saved to SQLite3 on D drive', { duration: 1500 });
      console.log('✅ Dine-in order saved to D drive SQLite3:', savedOrder.id);
    } catch (error) {
      console.error('Failed to save order:', error);
      toast.error('Failed to save order', { duration: 2000 });
    }
  };

  const getCurrentTable = () => {
    return tables.find(t => t.number === selectedTable);
  };

  // Show error screen if server is not running
  if (serverError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-500">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🚨</div>
            <h1 className="text-4xl mb-4 text-red-600">Backend Server Not Running!</h1>
            <p className="text-xl text-gray-700 mb-6">
              The POS system needs the backend server to access the SQLite3 database on D drive.
            </p>
          </div>

          <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-6 mb-6">
            <h2 className="text-2xl mb-4 text-yellow-800">⚡ START THE SERVER NOW:</h2>
            <ol className="space-y-4 text-lg">
              <li className="flex items-start gap-3">
                <span className="bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <strong>Open Terminal/Command Prompt</strong>
                  <p className="text-gray-600">Press Windows + R, type "cmd", press Enter</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <strong>Navigate to project folder</strong>
                  <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">cd [your project path]</code>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <strong>Start the server:</strong>
                  <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">npm run server</code>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-6 mb-6">
            <h3 className="text-xl mb-3 text-blue-800">📋 Alternative: Use Batch File</h3>
            <p className="mb-2 text-gray-700">Double-click this file in your project folder:</p>
            <code className="block bg-gray-800 text-green-400 p-3 rounded">start-complete-system.bat</code>
            <p className="mt-3 text-sm text-gray-600">This will start both backend and frontend automatically!</p>
          </div>

          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6">
            <h3 className="text-xl mb-3 text-green-800">✅ After Starting the Server:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Server will run on http://localhost:3001</li>
              <li>✓ SQLite3 database on D:\\ShahJePizza\\database\\</li>
              <li>✓ Login with: <strong>admin</strong> / <strong>admin</strong></li>
              <li>✓ All data safe on D drive (no browser storage!)</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Check Again (After Starting Server)
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Your data will be stored at: D:\\ShahJePizza\\database\\shahje-pizza.db</p>
            <p className="mt-2">Developed by Abbas Developers - 0304165629</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while connecting to server
  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Connecting to SQLite3 backend server...</p>
          <p className="text-sm text-gray-500">Make sure "npm run server" is running</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard 
          onNewOrder={handleNewOrder} 
          onLogout={handleLogout}
          completedOrders={completedOrders}
          incompleteOrders={incompleteOrders}
          onCompleteIncompleteOrder={handleCompleteIncompleteOrder}
          currentUser={currentUser}
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {currentView === 'order-mode' && (
        <OrderModeSelection
          onSelectMode={handleSelectMode}
          onBack={handleBackToDashboard}
          tables={tables}
          onSelectTable={(tableNumber) => {
            setSelectedTable(tableNumber);
            setCurrentView('order-taking');
          }}
        />
      )}

      {currentView === 'takeaway' && (
        <TakeAwayPage 
          onBack={handleBackToOrderMode}
          onCompleteOrder={handleCompleteTakeAwayOrder}
          orderCounter={orderCounter}
          onIncrementCounter={() => setOrderCounter(prev => prev + 1)}
          staffName={currentUser}
          products={products}
        />
      )}

      {currentView === 'dinein' && (
        <DineInPage
          onBack={handleBackToOrderMode}
          onSelectTable={handleSelectTable}
          tables={tables}
        />
      )}

      {currentView === 'delivery' && (
        <DeliveryPage 
          onBack={handleBackToOrderMode}
          onCompleteOrder={handleCompleteTakeAwayOrder}
          orderCounter={orderCounter}
          onIncrementCounter={() => setOrderCounter(prev => prev + 1)}
          staffName={currentUser}
          products={products}
        />
      )}

      {currentView === 'order-taking' && selectedTable !== null && (
        <OrderTakingPage
          tableNumber={selectedTable}
          existingOrder={getCurrentTable()?.currentOrder}
          onBack={() => setCurrentView('dinein')}
          onSaveOrder={handleSaveOrder}
          onCompleteOrder={handleCompleteDineInOrder}
          orderCounter={orderCounter}
          onIncrementCounter={() => setOrderCounter(prev => prev + 1)}
          staffName={currentUser}
          products={products}
        />
      )}

      <Toaster position="top-right" duration={1000} />
    </>
  );
}
