import { Link } from 'react-router-dom';

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
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-black hover:bg-white/5 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
            </div>
            <span className="text-xs text-white truncate max-w-[70px]">New</span>
        </div>
     );
  }

  return (
    <Link to={`/stories/highlights/${id}`} className="flex flex-col items-center gap-1">
      <div className="p-[2px] rounded-full border border-gray-600">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800">
            {coverUrl ? (
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-600" />
                </div>
            )}
          </div>
      </div>
      <span className="text-xs text-white truncate max-w-[70px] text-center">{title}</span>
    </Link>
  );
}
