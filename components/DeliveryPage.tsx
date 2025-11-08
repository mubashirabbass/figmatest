import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Grid3x3, List } from 'lucide-react';
import { CartItem, Order, Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { Cart } from './Cart';
import { BillModal } from './BillModal';
import { toast } from 'sonner@2.0.3';

interface DeliveryPageProps {
  onBack: () => void;
  onCompleteOrder: (order: Order) => void;
  orderCounter: number;
  onIncrementCounter: () => void;
  staffName: string;
  products: Product[];
}

export function DeliveryPage({ onBack, onCompleteOrder, orderCounter, onIncrementCounter, staffName, products }: DeliveryPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showBill, setShowBill] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      if (!existingItem) return prevCart;

      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.product.id !== productId);
      }
      return prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowBill(true);
    }
  };

  const handleCompleteBill = (order: Order) => {
    onCompleteOrder(order);
    setCart([]);
    setShowBill(false);
    if (order.status === 'incomplete') {
      toast.success('Partial payment received', { duration: 1000 });
    } else {
      toast.success('Delivery order completed!', { duration: 1000 });
    }
  };

  const getQuantity = (productId: string): number => {
    return cart.find(item => item.product.id === productId)?.quantity || 0;
  };

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Define category order
  const categoryOrder = ['Pizza', 'Deals', 'Sides', 'Beverages', 'Appetizer', 'Dessert'];
  const sortedCategories = categoryOrder.filter(cat => groupedProducts[cat]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-gray-900">Delivery Order</h1>
                <p className="text-sm text-gray-500">Add items to the delivery order</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {sortedCategories.map(category => (
                <div key={category}>
                  <h2 className="text-gray-900 mb-4 pb-2 border-b">{category}</h2>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupedProducts[category].map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          quantity={getQuantity(product.id)}
                          onAdd={() => handleAddToCart(product.id)}
                          onRemove={() => handleRemoveFromCart(product.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {groupedProducts[category].map(product => (
                        <ProductListItem
                          key={product.id}
                          product={product}
                          quantity={getQuantity(product.id)}
                          onAdd={() => handleAddToCart(product.id)}
                          onRemove={() => handleRemoveFromCart(product.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Cart
                items={cart}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </div>

      {showBill && (
        <BillModal
          items={cart}
          onClose={() => setShowBill(false)}
          onComplete={handleCompleteBill}
          type="delivery"
          orderCounter={orderCounter}
          onIncrementCounter={onIncrementCounter}
          staffName={staffName}
        />
      )}
    </div>
  );
}
