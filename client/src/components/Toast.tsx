import React from 'react';

interface ToastProps {
  notification: { message: string; type: 'success' | 'error' } | null;
}

export default function Toast({ notification }: ToastProps) {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
        notification.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'
      }`}
    >
      {notification.message}
    </div>
  );
}
