import React from 'react';
import { Button } from './ui/button';
import { Plus, Minus } from 'lucide-react';
import { Product } from '../types';

interface ProductListItemProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function ProductListItem({ product, quantity, onAdd, onRemove }: ProductListItemProps) {
  const handleItemClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onAdd();
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleItemClick}
    >
      <div className="flex-1">
        <h3 className="text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
      </div>
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <span className="text-orange-600 min-w-[80px] text-right">Rs. {product.price}</span>
        <div className="flex items-center gap-2">
          {quantity > 0 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onRemove}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
            </>
          )}
          <Button
            size="sm"
            onClick={onAdd}
            className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
