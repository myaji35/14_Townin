/**
 * Townin Design System - Toast Component
 *
 * 알림 메시지를 표시하는 토스트 컴포넌트
 */

import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  submessage?: string;
  icon?: string;
  onClose?: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  submessage,
  icon = '✅',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-50 bg-[#13ecb6] text-[#11221e] px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn border-2 border-[#10cfa0]"
      role="alert"
      aria-live="polite"
    >
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="font-bold text-sm">{message}</p>
        {submessage && <p className="text-xs opacity-80">{submessage}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-[#11221e] hover:text-[#0a1410] transition-colors"
          aria-label="알림 닫기"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
