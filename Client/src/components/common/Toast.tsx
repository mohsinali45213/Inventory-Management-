import React from 'react';
import './../../../src/styles/Toast.css';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  text: string;
  details?: any;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, text, details, onClose }) => {
  return (
    <div className={`toast toast-${type}`}> 
      <div className="toast-content">
        <div className="toast-header">
          {type === 'success' && <span>✅ Success!</span>}
          {type === 'error' && <span>❌ Error!</span>}
          {type === 'info' && <span>ℹ️ Info</span>}
          <button className="toast-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="toast-message">{text}</div>
        {details && (
          <div className="toast-details">
            {details.invoiceNumber && <div>Invoice #: {details.invoiceNumber}</div>}
            {details.draftNumber && <div>Draft #: {details.draftNumber}</div>}
            {details.customerName && <div>Customer: {details.customerName}</div>}
            {details.total && <div>Total: ₹{Number(details.total).toFixed(2)}</div>}
            {details.itemsCount && <div>Items: {details.itemsCount}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast; 