import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="glass-panel-post w-full max-w-sm rounded-[24px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient line */}
        <div className="relative p-6 pb-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-red-500/50 to-transparent opacity-50" />
          
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-white'} ring-1 ring-white/10 shadow-inner`}>
              {isDestructive ? <AlertTriangle size={28} strokeWidth={1.5} /> : <X size={28} strokeWidth={1.5} />}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {title}
              </h2>
              <p className="text-gray-400 text-[15px] leading-relaxed px-2">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 flex flex-col gap-3">
          <button type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`group relative overflow-hidden w-full py-4 px-4 font-black text-[15px] tracking-wide uppercase rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isLoading ? 'Processing...' : confirmText}
            </span>
          </button>
          
          <button type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-4 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-[14px] rounded-2xl transition-all active:scale-[0.98]"
          >
            {cancelText}
          </button>
        </div>

        {/* Close Button Top Right */}
        <button type="button" 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
