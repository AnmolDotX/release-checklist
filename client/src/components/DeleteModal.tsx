import React from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Delete Release</h3>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this release? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
