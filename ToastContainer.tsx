import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-[60] flex flex-col gap-3 pointer-events-none sm:max-w-sm w-auto">
      {toasts.map((toast) => {
        let borderLeftColor = '#7b2ff2';
        let Icon = Info;
        let iconColor = 'text-[#c77dff]';

        if (toast.type === 'success') {
          borderLeftColor = '#00d4aa';
          Icon = CheckCircle2;
          iconColor = 'text-[#00d4aa]';
        } else if (toast.type === 'error') {
          borderLeftColor = '#ff4d6d';
          Icon = AlertTriangle;
          iconColor = 'text-[#ff4d6d]';
        } else if (toast.type === 'warning') {
          borderLeftColor = '#ffc857';
          Icon = AlertTriangle;
          iconColor = 'text-[#ffc857]';
        }

        return (
          <div
            key={toast.id}
            style={{ borderLeft: `4px solid ${borderLeftColor}` }}
            className="pointer-events-auto bg-[#12121f] border border-[#2a2a4a] p-4 rounded-lg shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-right-8 duration-300 backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div>
                <h4 className="text-sm font-semibold text-white leading-tight">{toast.title}</h4>
                {toast.description && (
                  <p className="text-xs text-[#9090b8] mt-1 leading-relaxed">{toast.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#5c5c8a] hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
