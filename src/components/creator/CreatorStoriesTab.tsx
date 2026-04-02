import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { creatorApi } from '../../services/creator.service';
import type { CreatorStory } from '../../services/creator.service';
import type { PaginatedResponse } from '../../types';
import { Eye, Heart, Clock } from 'lucide-react';

export default function CreatorStoriesTab() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<CreatorStory>>({
    queryKey: ['creator', 'stories', page],
    queryFn: () => creatorApi.getStories(page, 12).then((r) => r.data),
  });

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="aspect-9/16 rounded-2xl animate-pulse bg-white/5" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.data?.map((story) => (
            <div
              key={story.id}
              className="relative aspect-9/16 rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all group"
            >
              {/* Media */}
              {story.mediaType === 'video' ? (
                <video
                  src={story.mediaUrl}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={story.mediaUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30" />

              {/* Status badge */}
              <div className="absolute top-3 left-3">
                {isExpired(story.expiresAt) ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-900/80 backdrop-blur rounded-lg text-[10px] font-bold text-gray-400">
                    <Clock size={10} /> Expirada
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 backdrop-blur rounded-lg text-[10px] font-bold text-green-400">
                    <Clock size={10} /> Activa
                  </span>
                )}
              </div>

              {/* Metrics overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-white font-bold">
                    <Eye size={14} /> {story._count.views}
                  </span>
                  <span className="flex items-center gap-1 text-pink-400 font-bold">
                    <Heart size={14} /> {story._count.reactions}
                  </span>
                </div>
                <span className="text-gray-400 text-[10px]">
                  {new Date(story.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !data?.data?.length && (
        <div className="text-center py-16 text-gray-600">
          <Clock size={48} className="mx-auto mb-3 opacity-50" />
          <p>No tienes historias aún</p>
        </div>
      )}

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
