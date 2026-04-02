import { X } from 'lucide-react';
import type { AdminPost } from '../../services/admin.service';

interface Props {
  post: AdminPost;
  onClose: () => void;
}

export default function PostPreviewModal({ post, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="glass-panel-post w-full max-w-lg rounded-[24px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">
              @{post.user?.profile?.username || 'unknown'}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(post.createdAt).toLocaleDateString()} · {post.type}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
            aria-label="Cerrar vista previa"
          >
            <X size={20} />
          </button>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="max-h-[400px] overflow-hidden bg-black">
            {post.media.map((m, i) => (
              <div key={i}>
                {m.type === 'video' ? (
                  <video
                    src={m.url}
                    controls
                    className="w-full max-h-[400px] object-contain"
                  />
                ) : (
                  <img
                    src={m.url}
                    alt={`Media ${i + 1}`}
                    className="w-full max-h-[400px] object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Caption */}
        <div className="p-4 space-y-3">
          {post.caption && (
            <p className="text-white text-sm leading-relaxed">{post.caption}</p>
          )}
          {post._count && (
            <div className="flex gap-4 text-xs text-gray-500">
              <span>
                <span className="text-white font-bold">{post._count.likes}</span> likes
              </span>
              <span>
                <span className="text-white font-bold">{post._count.comments}</span> comentarios
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
