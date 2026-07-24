import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info' | 'success' | 'warning' | 'error'
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  };

  const colors = {
    info: {
      bg: 'bg-[#4cc9f0]',
      border: 'border-[#4cc9f0]',
      text: 'text-[#4cc9f0]',
      bgLight: 'bg-[#4cc9f0]/10'
    },
    success: {
      bg: 'bg-[#72efdd]',
      border: 'border-[#72efdd]',
      text: 'text-[#72efdd]',
      bgLight: 'bg-[#72efdd]/10'
    },
    warning: {
      bg: 'bg-[#fbbf24]',
      border: 'border-[#fbbf24]',
      text: 'text-[#fbbf24]',
      bgLight: 'bg-[#fbbf24]/10'
    },
    error: {
      bg: 'bg-[#f43f5e]',
      border: 'border-[#f43f5e]',
      text: 'text-[#f43f5e]',
      bgLight: 'bg-[#f43f5e]/10'
    }
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f1422] border border-[#1e2640] rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${colorScheme.bgLight} border ${colorScheme.border} flex items-center justify-center flex-shrink-0`}>
            <Icon size={24} className={colorScheme.text} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1e2640]">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-700 text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'error' 
                ? 'bg-rose-500 hover:bg-rose-400 text-white' 
                : type === 'success'
                ? 'bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17]'
                : 'bg-[#4cc9f0] hover:bg-[#3ab0d8] text-[#0b0f17]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}