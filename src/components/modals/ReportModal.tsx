import { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { reportsApi } from '../../services';
import { logger } from '../../utils/logger';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'post';
  targetId: string;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'It\'s spam' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'other', label: 'Something else' },
];

export default function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    try {
      await reportsApi.create({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason('');
        setDetails('');
        onClose();
      }, 2000);
    } catch (error) {
      logger.error('Failed to submit report', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#262626] w-full max-w-sm rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <h3 className="font-bold text-white">Report</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-green-500 animate-bounce" />
            </div>
            <p className="text-white font-medium">Thanks for reporting. We'll review your report shortly.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <p className="text-gray-400 text-sm">Why are you reporting this {targetType}?</p>
            
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <button type="button"
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all border ${
                    reason === r.id 
                      ? 'bg-red-500/10 border-red-500 text-white' 
                      : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {reason && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs text-gray-500 uppercase font-bold px-1">Additional Details (Optional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us more..."
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[100px] resize-none"
                />
              </div>
            )}

            <button type="button"
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
