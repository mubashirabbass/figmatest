import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { Order } from '../types';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ReportsSectionProps {
  completedOrders: Order[];
}

export function ReportsSection({ completedOrders }: ReportsSectionProps) {
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);

  const getOrdersForDateRange = (from: Date, to: Date) => {
    return completedOrders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= from && orderDate <= to;
    });
  };

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    return weekStart;
  };

  const getMonthStart = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    return monthStart;
  };

  const generateReport = (orders: Order[], title: string) => {
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const takeawayOrders = orders.filter(o => o.type === 'takeaway');
    const dineinOrders = orders.filter(o => o.type === 'dinein');
    const takeawayRevenue = takeawayOrders.reduce((sum, o) => sum + o.total, 0);
    const dineinRevenue = dineinOrders.reduce((sum, o) => sum + o.total, 0);

    return {
      title,
      totalOrders: orders.length,
      totalRevenue: revenue,
      averageOrder: orders.length > 0 ? revenue / orders.length : 0,
      takeawayCount: takeawayOrders.length,
      takeawayRevenue,
      dineinCount: dineinOrders.length,
      dineinRevenue,
      cashOrders: orders.filter(o => o.paymentMethod === 'cash').length,
      cashRevenue: orders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0),
      cardOrders: orders.filter(o => o.paymentMethod === 'card').length,
      cardRevenue: orders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.total, 0),
      upiOrders: orders.filter(o => o.paymentMethod === 'upi').length,
      upiRevenue: orders.filter(o => o.paymentMethod === 'upi').reduce((sum, o) => sum + o.total, 0),
    };
  };

  const downloadReport = (orders: Order[], filename: string) => {
    const reportData = orders.map(order => ({
      'Order ID': order.id,
      'Date': new Date(order.timestamp).toLocaleString(),
      'Type': order.type,
      'Table': order.tableNumber || 'N/A',
      'Items': order.items.length,
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
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const weekStart = getWeekStart();
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date();
  weekEnd.setHours(23, 59, 59);

  const monthStart = getMonthStart();
  const monthEnd = new Date();
  monthEnd.setHours(23, 59, 59);

  const todayOrdersData = getOrdersForDateRange(todayStart, todayEnd);
  const weekOrdersData = getOrdersForDateRange(weekStart, weekEnd);
  const monthOrdersData = getOrdersForDateRange(monthStart, monthEnd);

  const customOrdersData = customDateFrom && customDateTo
    ? getOrdersForDateRange(
        new Date(customDateFrom.setHours(0, 0, 0, 0)),
        new Date(customDateTo.setHours(23, 59, 59))
      )
    : [];

  const todayReport = generateReport(todayOrdersData, "Today's Sales");
  const weekReport = generateReport(weekOrdersData, 'Weekly Sales');
  const monthReport = generateReport(monthOrdersData, 'Monthly Sales');
  const customReport = customOrdersData.length > 0
    ? generateReport(customOrdersData, 'Custom Date Range Sales')
    : null;

  interface ReportCardProps {
    report: any;
    orders: Order[];
    filename: string;
  }

  const ReportCard = ({ report, orders, filename }: ReportCardProps) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{report.title}</CardTitle>
            <CardDescription>{orders.length} orders</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReport(orders, filename)}
            disabled={orders.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl text-green-600">Rs. {report.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
            <p className="text-2xl text-blue-600">Rs. {report.averageOrder.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm text-gray-900 mb-3">Order Type Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Take Away</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-900">{report.takeawayCount} orders</span>
                <span className="text-green-600">Rs. {report.takeawayRevenue.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dine In</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-900">{report.dineinCount} orders</span>
                <span className="text-green-600">Rs. {report.dineinRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm text-gray-900 mb-3">Payment Method Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cash</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-900">{report.cashOrders} orders</span>
                <span className="text-green-600">Rs. {report.cashRevenue.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Card</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-900">{report.cardOrders} orders</span>
                <span className="text-green-600">Rs. {report.cardRevenue.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">UPI</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-900">{report.upiOrders} orders</span>
                <span className="text-green-600">Rs. {report.upiRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Sales Reports</h1>
        <p className="text-sm text-gray-500">Download detailed sales reports for different time periods</p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="custom">Custom Range</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <ReportCard
            report={todayReport}
            orders={todayOrdersData}
            filename={`today-sales-${new Date().toISOString().split('T')[0]}.csv`}
          />
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          <ReportCard
            report={weekReport}
            orders={weekOrdersData}
            filename={`weekly-sales-${new Date().toISOString().split('T')[0]}.csv`}
          />
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          <ReportCard
            report={monthReport}
            orders={monthOrdersData}
            filename={`monthly-sales-${new Date().toISOString().split('T')[0]}.csv`}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Date Range</CardTitle>
              <CardDescription>Choose start and end dates for custom report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm transition-all outline-none focus-visible:ring-2 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full">
                        <CalendarIcon className="w-4 h-4" />
                        {customDateFrom ? customDateFrom.toLocaleDateString() : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customDateFrom}
                        onSelect={setCustomDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm transition-all outline-none focus-visible:ring-2 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full">
                        <CalendarIcon className="w-4 h-4" />
                        {customDateTo ? customDateTo.toLocaleDateString() : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customDateTo}
                        onSelect={setCustomDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {customReport && customDateFrom && customDateTo && (
            <ReportCard
              report={customReport}
              orders={customOrdersData}
              filename={`custom-sales-${customDateFrom.toISOString().split('T')[0]}-to-${customDateTo.toISOString().split('T')[0]}.csv`}
            />
          )}

          {(!customDateFrom || !customDateTo) && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Please select both start and end dates to generate report</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
