import React from 'react';
import { Order } from '../types';

interface ThermalReceiptProps {
  order: Order;
  restaurantName?: string;
}

export function ThermalReceipt({ order, restaurantName = 'Shah Je Pizza' }: ThermalReceiptProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-PK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div 
      className="thermal-receipt bg-white font-mono text-black mx-auto" 
      style={{ 
        fontFamily: 'Courier New, monospace',
        width: '80mm', // Standard thermal printer width
        fontSize: '12px',
        lineHeight: '1.4',
        padding: '10mm 5mm',
      }}
    >
      {/* Header */}
      <div className="text-center mb-3" style={{ borderBottom: '1px dashed #000', paddingBottom: '8px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{restaurantName}</div>
        <div style={{ fontSize: '11px' }}>Tel: 0304165629</div>
      </div>

      {/* Order Info */}
      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Bill #:</span>
          <span style={{ fontWeight: 'bold' }}>{order.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Date:</span>
          <span>{formatDate(order.timestamp)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Type:</span>
          <span style={{ textTransform: 'uppercase' }}>{order.type}</span>
        </div>
        {order.tableNumber && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Table:</span>
            <span>#{order.tableNumber}</span>
          </div>
        )}
        {order.customerName && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Customer:</span>
            <span>{order.customerName}</span>
          </div>
        )}
        {order.customerContact && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Contact:</span>
            <span>{order.customerContact}</span>
          </div>
        )}
        {order.customerAddress && (
          <div style={{ marginBottom: '2px' }}>
            <span>Address:</span>
            <div style={{ fontSize: '11px', marginLeft: '8px', marginTop: '2px', wordWrap: 'break-word' }}>
              {order.customerAddress}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Staff:</span>
          <span>{order.staffName}</span>
        </div>
      </div>

      {/* Items */}
      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
          <span>ITEM</span>
          <span>AMOUNT</span>
        </div>
        {order.items.map((item, index) => (
          <div key={index} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.product.name}</span>
              <span>Rs. {(item.product.price * item.quantity).toFixed(0)}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#555', paddingLeft: '8px' }}>
              {item.quantity} x Rs. {item.product.price.toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span>Subtotal:</span>
          <span>Rs. {order.subtotal.toFixed(0)}</span>
        </div>
        {order.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Discount:</span>
            <span>-Rs. {order.discount.toFixed(0)}</span>
          </div>
        )}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '1px solid #000', 
          paddingTop: '4px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          <span>TOTAL:</span>
          <span>Rs. {order.total.toFixed(0)}</span>
        </div>
        {order.status === 'incomplete' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', color: '#16a34a' }}>
              <span>Paid:</span>
              <span>Rs. {(order.amountPaid || 0).toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', color: '#dc2626' }}>
              <span>Remaining:</span>
              <span>Rs. {(order.amountRemaining || 0).toFixed(0)}</span>
            </div>
          </>
        )}
      </div>

      {/* Payment Method */}
      <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginBottom: '8px', textAlign: 'center' }}>
        <span style={{ textTransform: 'uppercase' }}>Payment: {order.paymentMethod}</span>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        borderTop: '1px dashed #000', 
        paddingTop: '8px',
        fontSize: '11px'
      }}>
        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Thank you for your order!</div>
        <div style={{ color: '#555' }}>Visit again</div>
      </div>
    </div>
  );
}
