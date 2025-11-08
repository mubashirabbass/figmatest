import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onAdd();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-3">
        <div className="mb-2">
          <h3 className="text-gray-900 mb-0.5 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-500">{product.category}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-orange-600">Rs. {product.price}</span>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {quantity > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  className="h-7 w-7 p-0"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-6 text-center text-sm">{quantity}</span>
              </>
            )}
            <Button
              size="sm"
              onClick={onAdd}
              className="h-7 w-7 p-0 bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
