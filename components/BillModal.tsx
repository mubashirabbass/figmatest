import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CartItem, Order } from '../types';
import { CheckCircle, Printer } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { Checkbox } from './ui/checkbox';

interface BillModalProps {
  items: CartItem[];
  onClose: () => void;
  onComplete: (order: Order) => void;
  type: 'takeaway' | 'dinein' | 'delivery';
  tableNumber?: number;
  orderCounter: number;
  onIncrementCounter: () => void;
  staffName: string;
}

export function BillModal({ items, onClose, onComplete, type, tableNumber, orderCounter, onIncrementCounter, staffName }: BillModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [discountPercent, setDiscountPercent] = useState<string>('0');
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Partial payment
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal * (parseFloat(discountPercent) || 0) / 100;
  const total = subtotal - discount;

  const handlePrint = () => {
    window.print();
  };

  const handleComplete = () => {
    const paidAmount = isPartialPayment ? parseFloat(amountPaid) || 0 : total;
    const remainingAmount = total - paidAmount;
    
    if (isPartialPayment && (paidAmount <= 0 || paidAmount > total)) {
      alert('Please enter a valid payment amount');
      return;
    }

    // Validation for delivery orders
    if (type === 'delivery' && !customerAddress.trim()) {
      alert('Please enter customer address for delivery order');
      return;
    }

    const order: Order = {
      id: String(orderCounter),
      tableNumber,
      items,
      subtotal,
      discount,
      total,
      status: remainingAmount > 0 ? 'incomplete' : 'complete',
      type,
      paymentMethod,
      timestamp: new Date(),
      customerName: customerName || undefined,
      customerContact: customerContact || undefined,
      customerAddress: type === 'delivery' ? customerAddress || undefined : undefined,
      amountPaid: paidAmount,
      amountRemaining: remainingAmount > 0 ? remainingAmount : 0,
      staffName,
    };
    
    onIncrementCounter();
    setCompletedOrder(order);
    setShowReceipt(true);
  };

  const handleFinalComplete = () => {
    if (completedOrder) {
      onComplete(completedOrder);
    }
  };

  if (showReceipt && completedOrder) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill #{completedOrder.id}</DialogTitle>
            <DialogDescription>
              {completedOrder.status === 'incomplete' 
                ? 'Partial payment received - Order incomplete' 
                : 'Order completed successfully'}
            </DialogDescription>
          </DialogHeader>

          <ThermalReceipt order={completedOrder} restaurantName="Shah Je Pizza" />

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Bill
            </Button>
            <Button
              onClick={handleFinalComplete}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proceed to Pay</DialogTitle>
          <DialogDescription>
            {type === 'takeaway' ? 'Take Away Order' : type === 'delivery' ? 'Delivery Order' : `Table ${tableNumber} - Dine In`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Items List */}
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-900">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="text-gray-900">
                  Rs. {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Customer Details */}
          <div className="space-y-3 border-t pt-3">
            <h3 className="text-sm text-gray-900">
              Customer Details {type === 'delivery' ? '(Required for Delivery)' : '(Optional)'}
            </h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customerContact">Contact Number</Label>
                <Input
                  id="customerContact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                />
              </div>
              {type === 'delivery' && (
                <div>
                  <Label htmlFor="customerAddress">Delivery Address *</Label>
                  <Input
                    id="customerAddress"
                    type="text"
                    placeholder="Enter delivery address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className={!customerAddress && type === 'delivery' ? 'border-orange-500' : ''}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 border-t pt-3">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="cursor-pointer">Card</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="cursor-pointer">UPI</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="Enter discount percentage"
            />
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({discountPercent}%)</span>
                <span>-Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-orange-600 border-t pt-2">
              <span>Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Partial Payment Option */}
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="partial" 
                checked={isPartialPayment}
                onCheckedChange={(checked) => setIsPartialPayment(checked as boolean)}
              />
              <Label htmlFor="partial" className="cursor-pointer">
                Partial Payment
              </Label>
            </div>
            
            {isPartialPayment && (
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  min="0"
                  max={total}
                  placeholder="Enter amount paid"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
                {amountPaid && parseFloat(amountPaid) < total && (
                  <p className="text-sm text-red-600">
                    Remaining: Rs. {(total - parseFloat(amountPaid)).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              disabled={items.length === 0}
            >
              <CheckCircle className="w-4 h-4" />
              {isPartialPayment ? 'Save Order' : 'Complete Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
