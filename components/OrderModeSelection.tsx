import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ShoppingBag, Users, ArrowLeft, ClockAlert, Utensils, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { Table } from '../types';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface OrderModeSelectionProps {
  onSelectMode: (mode: 'takeaway' | 'dinein' | 'delivery') => void;
  onBack: () => void;
  tables: Table[];
  onSelectTable: (tableNumber: number) => void;
}

export function OrderModeSelection({ onSelectMode, onBack, tables, onSelectTable }: OrderModeSelectionProps) {
  const pendingTables = tables.filter(table => table.status === 'occupied');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-gray-900 mb-2">New Order</h1>
            <p className="text-gray-600">Select order type to continue</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
            onClick={() => onSelectMode('takeaway')}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-500 p-6 rounded-full">
                  <ShoppingBag className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle>Take Away</CardTitle>
              <CardDescription>Quick orders for customers taking food to go</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Fast checkout process</li>
                <li>• Print bills instantly</li>
                <li>• Multiple payment options</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
            onClick={() => onSelectMode('dinein')}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-500 p-6 rounded-full">
                  <Users className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle>Dine In</CardTitle>
              <CardDescription>Table service for customers dining in restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Select tables</li>
                <li>• Manage pending orders</li>
                <li>• Track table status</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
            onClick={() => onSelectMode('delivery')}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-500 p-6 rounded-full">
                  <Truck className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle>Delivery</CardTitle>
              <CardDescription>Orders to be delivered to customer's address</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Collect customer address</li>
                <li>• Track delivery orders</li>
                <li>• Print delivery bills</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {pendingTables.length > 0 && (
          <Card className="border-2 border-orange-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-3 rounded-full">
                  <ClockAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Pending Dine-In Orders</CardTitle>
                  <CardDescription>
                    {pendingTables.length} table(s) with active orders
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {pendingTables.map((table) => (
                    <Card
                      key={table.number}
                      className="cursor-pointer hover:shadow-md transition-shadow border border-orange-200 hover:border-orange-400"
                      onClick={() => onSelectTable(table.number)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                              <Utensils className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="text-gray-900 mb-1">Table {table.number}</h4>
                              {table.currentOrder && (
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-600">
                                    {table.currentOrder.items.length} items
                                  </p>
                                  <span className="text-gray-400">•</span>
                                  <p className="text-sm text-green-600">
                                    Rs. {table.currentOrder.subtotal.toFixed(2)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-orange-500">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
