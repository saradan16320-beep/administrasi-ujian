import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemCount?: number;
  confirmLabel?: string;
  isAll?: boolean;
  canForce?: boolean;
  forceChecked?: boolean;
  onToggleForce?: (checked: boolean) => void;
  forceWarning?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemCount,
  confirmLabel = 'Hapus Sekarang',
  isAll = false,
  canForce = false,
  forceChecked = false,
  onToggleForce,
  forceWarning
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${isAll ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              {isAll ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {message}
              </p>

              {itemCount !== undefined && itemCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Jumlah target: <span className="text-red-700">{itemCount} data</span>
                </div>
              )}

              {canForce && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={forceChecked}
                      onChange={(e) => onToggleForce?.(e.target.checked)}
                      className="mt-0.5 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs text-red-900 font-medium">
                      Paksa hapus meskipun data terkait sedang digunakan
                    </span>
                  </label>
                  {forceWarning && (
                    <p className="mt-1 text-xs text-red-700 pl-6">
                      {forceWarning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
              isAll
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
