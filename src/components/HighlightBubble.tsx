import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HighlightBubbleProps {
  id: string;
  title: string;
  coverUrl?: string;
  isAddButton?: boolean;
  onClick?: () => void;
}

export default function HighlightBubble({ id, title, coverUrl, isAddButton, onClick }: HighlightBubbleProps) {
  if (isAddButton) {
     return (
        <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" 
            onClick={onClick}
        >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">New</span>
        </motion.div>
     );
  }

  return (
    <Link to={`/stories/highlights/${id}`} className="flex flex-col items-center gap-1.5 shrink-0 group">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-[3px] rounded-full border border-white/10 bg-white/5 group-hover:border-white/30 transition-all duration-300 ring-4 ring-black/40"
      >
          <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-900 border border-white/5 shadow-inner">
            {coverUrl ? (
                <img src={coverUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-800 to-zinc-900 text-gray-500">
                    <div className="w-8 h-8 rounded-full border-2 border-white/5 animate-pulse-slow" />
                </div>
            )}
          </div>
      </motion.div>
      <span className="text-[10px] font-black text-white/60 group-hover:text-white truncate max-w-[72px] text-center uppercase tracking-tighter transition-colors">
        {title}
      </span>
    </Link>
  );
}

