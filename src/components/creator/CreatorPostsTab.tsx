import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { creatorApi } from '../../services/creator.service';
import type { CreatorPost } from '../../services/creator.service';
import type { PaginatedResponse } from '../../types';
import { Heart, MessageCircle, Bookmark, Megaphone, ImageIcon, Film } from 'lucide-react';

interface Props {
  onPromote: (post: CreatorPost) => void;
}

export default function CreatorPostsTab({ onPromote }: Props) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data, isLoading } = useQuery<PaginatedResponse<CreatorPost>>({
    queryKey: ['creator', 'posts', page, typeFilter],
    queryFn: () =>
      creatorApi.getPosts(page, 10, typeFilter || undefined).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {['', 'POST', 'FRAME'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              typeFilter === t
                ? 'bg-brand-primary text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {t === '' ? 'Todos' : t === 'POST' ? 'Posts' : 'Frames'}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl h-64 animate-pulse bg-white/5" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.map((post) => (
            <div
              key={post.id}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden hover:border-white/15 transition-all group"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-white/5 relative overflow-hidden">
                {post.media?.[0] ? (
                  <img
                    src={post.media[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {post.type === 'FRAME' ? (
                      <Film size={40} className="text-gray-700" />
                    ) : (
                      <ImageIcon size={40} className="text-gray-700" />
                    )}
                  </div>
                )}
                {/* Type badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-black uppercase text-white">
                  {post.type}
                </span>
              </div>

              {/* Metrics */}
              <div className="p-4">
                <p className="text-gray-400 text-sm truncate mb-3">
                  {post.caption || 'Sin caption'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-pink-400">
                    <Heart size={14} /> {post._count.likes}
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <MessageCircle size={14} /> {post._count.comments}
                  </span>
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <Bookmark size={14} /> {post._count.bookmarks}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-gray-600 text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPromote(post)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/20 transition-colors"
                  >
                    <Megaphone size={12} /> Promocionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !data?.data?.length && (
        <div className="text-center py-16 text-gray-600">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
          <p>No tienes publicaciones aún</p>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                page === p
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
