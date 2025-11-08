import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Table, Order } from '../types';
import { Badge } from './ui/badge';

interface DineInPageProps {
  onBack: () => void;
  onSelectTable: (tableNumber: number) => void;
  tables: Table[];
}

export function DineInPage({ onBack, onSelectTable, tables }: DineInPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-gray-900">Dine In - Table Selection</h1>
              <p className="text-sm text-gray-500">Select a table to manage orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card
              key={table.number}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                table.status === 'occupied'
                  ? 'border-orange-500 bg-orange-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => onSelectTable(table.number)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-gray-700" />
                  </div>
                  <Badge
                    variant={table.status === 'available' ? 'secondary' : 'default'}
                    className={
                      table.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-500'
                    }
                  >
                    {table.status === 'available' ? 'Available' : 'Occupied'}
                  </Badge>
                </div>
                <h3 className="text-gray-900 mb-1">Table {table.number}</h3>
                {table.currentOrder && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{table.currentOrder.items.length} items</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
