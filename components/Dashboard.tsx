import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  LogOut,
  Download,
  Calendar as CalendarIcon,
  Pizza,
  ClockAlert,
  BarChart3,
  History,
  PlusCircle,
  Printer,
  Database,
  Menu
} from 'lucide-react';
import { Button } from './ui/button';
import { Order, Product } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { ThermalReceipt } from './ThermalReceipt';
import { ReportsSection } from './ReportsSection';
import { BackupSettings } from './BackupSettings';
import { MenuManagement } from './MenuManagement';
import { AnimatedLogo } from './AnimatedLogo';

interface DashboardProps {
  onNewOrder: () => void;
  onLogout: () => void;
  completedOrders: Order[];
  incompleteOrders: Order[];
  onCompleteIncompleteOrder: (orderId: string, remainingAmount: number) => void;
  currentUser: string;
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

type Section = 'overview' | 'history' | 'incomplete' | 'reports' | 'duplicate' | 'backup' | 'menu';

export function Dashboard({ onNewOrder, onLogout, completedOrders, incompleteOrders, onCompleteIncompleteOrder, currentUser, products, onUpdateProduct, onAddProduct, onDeleteProduct }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedIncompleteOrder, setSelectedIncompleteOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [duplicateBillId, setDuplicateBillId] = useState('');
  const [duplicateBillOrder, setDuplicateBillOrder] = useState<Order | null>(null);

  // Filter orders based on selected date range
  const filterOrders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return completedOrders.filter(order => {
      const orderDate = new Date(order.timestamp);
      
      switch (dateFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredOrders = filterOrders();

  // Calculate statistics
  const todayOrders = completedOrders.filter(order => {
    const orderDate = new Date(order.timestamp);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthOrders = completedOrders.filter(order => {
    const orderDate = new Date(order.timestamp);
    return orderDate >= monthStart;
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrder = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  const todayTakeaway = todayOrders.filter(o => o.type === 'takeaway').reduce((sum, o) => sum + o.total, 0);
  const todayDineIn = todayOrders.filter(o => o.type === 'dinein').reduce((sum, o) => sum + o.total, 0);
  const todayDelivery = todayOrders.filter(o => o.type === 'delivery').reduce((sum, o) => sum + o.total, 0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportReport = () => {
    const reportData = filteredOrders.map(order => ({
      'Order ID': order.id,
      'Date': new Date(order.timestamp).toLocaleString(),
      'Type': order.type,
      'Table': order.tableNumber || 'N/A',
      'Items': order.items.map(item => `${item.product.name} (${item.quantity}x)`).join('; '),
      'Item Count': order.items.length,
      'Subtotal': order.subtotal.toFixed(2),
      'Discount': order.discount.toFixed(2),
      'Total': order.total.toFixed(2),
      'Payment': order.paymentMethod,
      'Customer': order.customerName || 'N/A',
      'Contact': order.customerContact || 'N/A',
      'Staff': order.staffName,
    }));

    const csv = [
      Object.keys(reportData[0] || {}).join(','),
      ...reportData.map(row => Object.values(row).map(val => 
        // Escape commas and quotes in CSV
        typeof val === 'string' && (val.includes(',') || val.includes(';')) 
          ? `"${val.replace(/"/g, '""')}"` 
          : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportOneMonthHistory = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const oneMonthOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= oneMonthAgo;
    });

    if (oneMonthOrders.length === 0) {
      toast.error('No orders found in the last month');
      return;
    }

    const reportData = oneMonthOrders.map(order => ({
      'Order ID': order.id,
      'Date': new Date(order.timestamp).toLocaleString(),
      'Type': order.type,
      'Table': order.tableNumber || 'N/A',
      'Items': order.items.map(item => `${item.product.name} (${item.quantity}x)`).join('; '),
      'Item Count': order.items.length,
      'Subtotal': order.subtotal.toFixed(2),
      'Discount': order.discount.toFixed(2),
      'Total': order.total.toFixed(2),
      'Payment': order.paymentMethod,
      'Customer': order.customerName || 'N/A',
      'Contact': order.customerContact || 'N/A',
      'Staff': order.staffName,
    }));

    const csv = [
      Object.keys(reportData[0] || {}).join(','),
      ...reportData.map(row => Object.values(row).map(val => 
        // Escape commas and quotes in CSV
        typeof val === 'string' && (val.includes(',') || val.includes(';')) 
          ? `"${val.replace(/"/g, '""')}"` 
          : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1-month-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success(`Exported ${oneMonthOrders.length} orders from the last month`);
  };

  const handleCompletePayment = () => {
    if (!selectedIncompleteOrder) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const remaining = (selectedIncompleteOrder.amountRemaining || selectedIncompleteOrder.total) - amount;
    
    if (remaining <= 0 || amount >= (selectedIncompleteOrder.amountRemaining || selectedIncompleteOrder.total)) {
      onCompleteIncompleteOrder(String(selectedIncompleteOrder.id), 0);
      toast.success('Order completed!');
    } else {
      toast.success('Partial payment received');
    }
    
    setSelectedIncompleteOrder(null);
    setPaymentAmount('');
  };

  const handleSearchDuplicateBill = () => {
    const id = parseInt(duplicateBillId);
    if (isNaN(id) || id <= 0) {
      toast.error('Please enter a valid bill number');
      return;
    }

    const allOrders = [...completedOrders, ...incompleteOrders];
    const order = allOrders.find(o => Number(o.id) === id);
    
    if (order) {
      setDuplicateBillOrder(order);
      toast.success('Bill found!');
    } else {
      toast.error(`Bill #${id} not found. Please check the bill number.`);
      setDuplicateBillOrder(null);
    }
  };

  const handlePrintDuplicateBill = () => {
    window.print();
  };

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-2">
          <AnimatedLogo size="sm" animate={false} />
          <div>
            <h2 className="text-gray-900">Shah Je Pizza</h2>
            <p className="text-xs text-gray-500">POS System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Button
          onClick={() => setActiveSection('overview')}
          variant={activeSection === 'overview' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${activeSection === 'overview' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </Button>

        <Button
          onClick={onNewOrder}
          variant="ghost"
          className="w-full justify-start gap-3 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Order
        </Button>

        <Button
          onClick={() => setActiveSection('history')}
          variant={activeSection === 'history' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${activeSection === 'history' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <History className="w-4 h-4" />
          View History
        </Button>

        <Button
          onClick={() => setActiveSection('incomplete')}
          variant={activeSection === 'incomplete' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${activeSection === 'incomplete' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <ClockAlert className="w-4 h-4" />
          Incomplete Orders
          {incompleteOrders.length > 0 && (
            <Badge className="ml-auto bg-red-500">{incompleteOrders.length}</Badge>
          )}
        </Button>

        <Button
          onClick={() => setActiveSection('reports')}
          variant={activeSection === 'reports' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${activeSection === 'reports' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <FileText className="w-4 h-4" />
          Reports
        </Button>

        <Button
          onClick={() => setActiveSection('duplicate')}
          variant={activeSection === 'duplicate' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${activeSection === 'duplicate' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <Printer className="w-4 h-4" />
          Duplicate Bill
        </Button>

        <Button
          onClick={() => setActiveSection('backup')}
          variant={activeSection === 'backup' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${activeSection === 'backup' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <Database className="w-4 h-4" />
          Backup & Data
        </Button>

        <Button
          onClick={() => setActiveSection('menu')}
          variant={activeSection === 'menu' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${activeSection === 'menu' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <Menu className="w-4 h-4" />
          Menu Management
        </Button>
      </nav>

      <div className="p-4 border-t space-y-3">
        {/* Developer Branding */}
        <div className="text-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Developed by</p>
          <p className="text-sm text-gray-900">Abbas Developers</p>
          <p className="text-xs text-gray-600 mt-1">0304165629</p>
        </div>

        <Button 
          variant="outline" 
          onClick={onLogout}
          className="w-full gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Welcome to Shah Je Pizza POS</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-gray-900">{todayOrders.length}</div>
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-gray-900">Rs. {todayRevenue.toFixed(2)}</div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-gray-900">{incompleteOrders.length}</div>
              <ClockAlert className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-gray-900">Rs. {monthRevenue.toFixed(2)}</div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SQLite3 Database Status Info */}
      <Card className="bg-emerald-50 border-emerald-200 border-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-emerald-600" />
            <div className="flex-1">
              <h3 className="text-emerald-800 mb-1">SQLite3 Database - D Drive</h3>
              <p className="text-emerald-700 text-sm mb-2">
                ✓ Professional database - ACID compliant, no data loss! 
                Total: <strong>{completedOrders.length + incompleteOrders.length} orders</strong>, <strong>{products.length} products</strong>
              </p>
              <p className="text-xs text-emerald-600">
                📁 Location: D:\ShahJePizza\database\shahje-pizza.db
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Breakdown</CardTitle>
            <CardDescription>Sales by order type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Take Away</span>
              <span className="text-green-600">Rs. {todayTakeaway.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dine In</span>
              <span className="text-green-600">Rs. {todayDineIn.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delivery</span>
              <span className="text-green-600">Rs. {todayDelivery.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">Rs. {todayRevenue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overall performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-gray-900">{completedOrders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Order Value</span>
              <span className="text-gray-900">Rs. {averageOrder.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month Orders</span>
              <span className="text-gray-900">{monthOrders.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900 mb-1">Sales History</h1>
          <p className="text-sm text-gray-500">View all completed orders</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleExportOneMonthHistory}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            1 Month
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportReport}
            className="gap-2"
            disabled={filteredOrders.length === 0}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No orders found for selected period</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(order.timestamp)}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-sm">
                            {order.type}
                            {order.tableNumber && ` (T${order.tableNumber})`}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.customerName || '-'}
                          {order.customerContact && (
                            <div className="text-xs text-gray-500">{order.customerContact}</div>
                          )}
                          {order.customerAddress && (
                            <div className="text-xs text-blue-500 mt-1">📍 {order.customerAddress}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs">
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-xs">
                                {item.product.name} <span className="text-gray-500">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm uppercase">{order.paymentMethod}</span>
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          Rs. {order.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                <span className="text-sm text-gray-600">
                  Showing {filteredOrders.length} order(s)
                </span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-green-600">Rs. {totalRevenue.toFixed(2)}</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderIncompleteOrders = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Incomplete Orders</h1>
        <p className="text-sm text-gray-500">Orders with partial payments</p>
      </div>

      {incompleteOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <ClockAlert className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No incomplete orders</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {incompleteOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <CardDescription>
                      {formatDate(order.timestamp)} • {order.type}
                      {order.tableNumber && ` • Table ${order.tableNumber}`}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">Incomplete</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.customerName && (
                  <div>
                    <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                    {order.customerContact && (
                      <p className="text-sm text-gray-600">Contact: {order.customerContact}</p>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product.name} x{item.quantity}</span>
                      <span className="text-gray-900">Rs. {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-gray-900">Rs. {order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="text-green-600">Rs. {(order.amountPaid || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-red-600">Amount Remaining</span>
                    <span className="text-red-600">Rs. {(order.amountRemaining || order.total).toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedIncompleteOrder(order)}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Complete Payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selectedIncompleteOrder !== null} onOpenChange={() => setSelectedIncompleteOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Enter the remaining payment amount
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncompleteOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-gray-900">Rs. {selectedIncompleteOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Already Paid</span>
                  <span className="text-green-600">Rs. {(selectedIncompleteOrder.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-red-600">Remaining</span>
                  <span className="text-red-600">
                    Rs. {(selectedIncompleteOrder.amountRemaining || selectedIncompleteOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Payment Amount</Label>
                <Input
                  id="payment"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedIncompleteOrder(null);
                    setPaymentAmount('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompletePayment}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Complete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderReports = () => <ReportsSection completedOrders={completedOrders} />;

  const renderBackup = () => <BackupSettings />;

  const renderMenu = () => (
    <MenuManagement
      products={products}
      onUpdateProduct={onUpdateProduct}
      onAddProduct={onAddProduct}
      onDeleteProduct={onDeleteProduct}
    />
  );

  const renderDuplicateBill = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Print Duplicate Bill</h1>
        <p className="text-sm text-gray-500">Enter bill number to reprint bill</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billId">Bill Number</Label>
              <div className="flex gap-2">
                <Input
                  id="billId"
                  type="number"
                  placeholder="Enter bill number (e.g., 1, 2, 3...)"
                  value={duplicateBillId}
                  onChange={(e) => setDuplicateBillId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchDuplicateBill();
                    }
                  }}
                />
                <Button 
                  onClick={handleSearchDuplicateBill}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Search
                </Button>
              </div>
            </div>

            {duplicateBillOrder && (
              <div className="border-t pt-4">
                <div className="mb-4">
                  <h3 className="text-gray-900 mb-2">Bill Found</h3>
                  <p className="text-sm text-gray-600">
                    Order #{duplicateBillOrder.id} - {formatDate(duplicateBillOrder.timestamp)}
                  </p>
                </div>

                <ThermalReceipt order={duplicateBillOrder} restaurantName="Shah Je Pizza" />

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDuplicateBillOrder(null);
                      setDuplicateBillId('');
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handlePrintDuplicateBill}
                    className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    <Printer className="w-4 h-4" />
                    Print Bill
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {renderSidebar()}
      
      <div className="flex-1 p-8">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'history' && renderHistory()}
        {activeSection === 'incomplete' && renderIncompleteOrders()}
        {activeSection === 'reports' && renderReports()}
        {activeSection === 'duplicate' && renderDuplicateBill()}
        {activeSection === 'backup' && renderBackup()}
        {activeSection === 'menu' && renderMenu()}
      </div>
    </div>
  );
}
