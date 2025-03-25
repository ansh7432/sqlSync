import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, visible, onClose, duration = 5000 }: ToastProps) {
    
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, duration]);
  
  if (!visible) return null;
  
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'error' || type === 'warning' ? <AlertTriangle size={18} /> : null}
      </div>
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}