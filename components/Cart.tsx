import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { ScrollArea } from './ui/scroll-area';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  title?: string;
}

export function Cart({ items, onRemoveItem, onCheckout, title = 'Current Order' }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No items added</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="space-y-3 pr-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Rs. {item.product.price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-600">
                        Rs. {(item.product.price * item.quantity)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-900">Total</span>
                <span className="text-orange-600">Rs. {total}</span>
              </div>
              <Button 
                onClick={onCheckout} 
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
