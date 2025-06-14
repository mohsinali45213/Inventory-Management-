import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { AlertType } from '../../types';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="alert-icon" />;
      case 'error':
        return <XCircle className="alert-icon" />;
      case 'warning':
        return <AlertCircle className="alert-icon" />;
      case 'info':
        return <Info className="alert-icon" />;
      default:
        return <Info className="alert-icon" />;
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      {getIcon()}
      <span className="alert-message">{message}</span>
      {onClose && (
        <button onClick={onClose} className="alert-close">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;