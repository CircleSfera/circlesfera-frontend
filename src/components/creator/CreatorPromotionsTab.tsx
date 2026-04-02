import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorApi } from '../../services/creator.service';
import type { CreatorPromotion, CreatorPost } from '../../services/creator.service';
import type { PaginatedResponse } from '../../types';
import {
  Megaphone,
  XCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Eye,
  Plus,
  RefreshCw,
  Image,
  Clock,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────

function computeProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

function computeDaysLeft(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000));
}

function getProgressColor(pct: number): string {
  if (pct < 50) return 'from-emerald-500 to-emerald-400';
  if (pct < 80) return 'from-yellow-500 to-amber-400';
  return 'from-red-500 to-orange-400';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── New Promotion Modal ────────────────────────────────────────

interface NewPromoModalProps {
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

function NewPromoModal({ onClose, onToast }: NewPromoModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedPost, setSelectedPost] = useState<CreatorPost | null>(null);
  const [budget, setBudget] = useState(5);
  const [duration, setDuration] = useState(7);

  const { data: postsData, isLoading: loadingPosts } = useQuery<PaginatedResponse<CreatorPost>>({
    queryKey: ['creator', 'posts', 'promo-select'],
    queryFn: () => creatorApi.getPosts(1, 20).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      creatorApi.createPromotion({
        targetType: selectedPost?.type?.toLowerCase() === 'frame' ? 'frame' : 'post',
        targetId: selectedPost!.id,
        budget,
        durationDays: duration,
        currency: 'EUR',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'promotions'] });
      onToast('Promoción creada', 'success');
      onClose();
    },
    onError: () => onToast('Error al crear promoción', 'error'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 glass-panel rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/20 rounded-xl">
              <Megaphone size={18} className="text-brand-primary" />
            </div>
            <h3 className="font-bold text-white text-lg">
              {step === 'select' ? 'Select Content' : 'Configure Promotion'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {step === 'select' ? (
            <div className="space-y-3">
              {loadingPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : postsData?.data?.length ? (
                postsData.data.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      setSelectedPost(post);
                      setStep('configure');
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-brand-primary/50 hover:bg-white/5 ${
                      selectedPost?.id === post.id ? 'border-brand-primary bg-brand-primary/10' : 'border-white/10'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden shrink-0">
                      {post.media?.[0]?.url ? (
                        <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image size={20} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {post.caption || 'Sin caption'}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        ❤️ {post._count.likes} · 💬 {post._count.comments}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-400 uppercase">
                      {post.type}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No posts available</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected post preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0">
                  {selectedPost?.media?.[0]?.url ? (
                    <img src={selectedPost.media[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{selectedPost?.caption || 'Sin caption'}</p>
                </div>
                <button type="button" onClick={() => setStep('select')} className="text-xs text-brand-primary hover:underline">
                  Change
                </button>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Budget (EUR)</label>
                <div className="flex items-center gap-3">
                  {[5, 10, 25, 50].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBudget(v)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        budget === v
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      €{v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Duration (days)</label>
                <div className="flex items-center gap-3">
                  {[3, 7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        duration === d
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="p-5 border-t border-white/10">
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full py-3 bg-linear-to-r from-brand-primary to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Creating...
                </span>
              ) : (
                `Promote for €${budget} · ${duration} days`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

interface Props {
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export default function CreatorPromotionsTab({ onToast }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showNewPromo, setShowNewPromo] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<CreatorPromotion>>({
    queryKey: ['creator', 'promotions', page],
    queryFn: () => creatorApi.getPromotions(page, 10).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => creatorApi.cancelPromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'promotions'] });
      onToast('Promoción eliminada', 'success');
      setConfirmCancel(null);
    },
    onError: () => onToast('Error al cancelar', 'error'),
  });

  const activePromos = data?.data?.filter((p) => p.status === 'active') || [];
  const completedPromos = data?.data?.filter((p) => p.status === 'completed') || [];

  const handleRepeat = (promo: CreatorPromotion) => {
    creatorApi
      .createPromotion({
        targetType: promo.targetType,
        targetId: promo.targetId,
        budget: promo.budget,
        durationDays: 7,
        currency: promo.currency,
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['creator', 'promotions'] });
        onToast('Promoción repetida', 'success');
      })
      .catch(() => onToast('Error al repetir', 'error'));
  };

  return (
    <div className="space-y-8">
      {/* Header + New Promotion Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Your Promotions</h3>
          <p className="text-gray-500 text-sm mt-0.5">Boost your content reach</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewPromo(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-brand-primary to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <Plus size={16} />
          New Promotion
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl h-28 animate-pulse bg-white/5" />
            ))}
        </div>
      ) : !data?.data?.length ? (
        /* Empty State */
        <div className="text-center py-20">
          <div className="inline-flex p-6 rounded-full bg-linear-to-br from-brand-primary/10 to-purple-500/10 mb-6">
            <TrendingUp size={48} className="text-brand-primary opacity-60" />
          </div>
          <h4 className="text-white font-bold text-xl mb-2">No promotions yet</h4>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Boost your best content to reach more people. Create your first promotion to get started.
          </p>
          <button
            type="button"
            onClick={() => setShowNewPromo(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-brand-primary to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all"
          >
            <Megaphone size={18} />
            Create First Promotion
          </button>
        </div>
      ) : (
        <>
          {/* Active Promotions */}
          {activePromos.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Active ({activePromos.length})
              </h4>
              {activePromos.map((promo) => {
                const pct = computeProgress(promo.startDate, promo.endDate);
                const daysLeft = computeDaysLeft(promo.endDate);

                return (
                  <div
                    key={promo.id}
                    className="glass-panel rounded-2xl border border-white/5 p-5 hover:border-white/15 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden shrink-0">
                        {promo.target?.thumbnail ? (
                          <img src={promo.target.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image size={24} className="text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate mb-1">
                          {promo.target?.caption || `${promo.targetType} promotion`}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full bg-linear-to-r ${getProgressColor(pct)} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-green-400">
                            <DollarSign size={12} />
                            <span className="font-bold">{promo.budget} {promo.currency}</span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-400">
                            <Eye size={12} />
                            <span className="font-bold">{promo.reach.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Clock size={12} />
                            <span className="font-bold">{daysLeft}d left</span>
                          </span>
                        </div>
                      </div>

                      {/* Cancel */}
                      <div className="shrink-0">
                        {confirmCancel === promo.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => cancelMutation.mutate(promo.id)}
                              disabled={cancelMutation.isPending}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition disabled:opacity-40"
                            >
                              {cancelMutation.isPending ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancel(null)}
                              className="px-3 py-1.5 bg-white/5 text-gray-400 text-xs font-bold rounded-lg hover:bg-white/10 transition"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancel(promo.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed Promotions */}
          {completedPromos.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={12} className="text-gray-500" />
                Completed ({completedPromos.length})
              </h4>
              {completedPromos.map((promo) => (
                <div
                  key={promo.id}
                  className="glass-panel rounded-2xl border border-white/5 p-5 opacity-75 hover:opacity-100 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-white/5 overflow-hidden shrink-0">
                      {promo.target?.thumbnail ? (
                        <img src={promo.target.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image size={20} className="text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white/80 font-bold text-sm truncate">
                          {promo.target?.caption || `${promo.targetType} promotion`}
                        </p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400">
                          Completed
                        </span>
                      </div>

                      {/* Final metrics */}
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-green-400/70">
                          <DollarSign size={12} />
                          <span className="font-bold">{promo.budget} {promo.currency}</span>
                        </span>
                        <span className="flex items-center gap-1 text-blue-400/70">
                          <Eye size={12} />
                          <span className="font-bold">{promo.reach.toLocaleString()} reached</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar size={12} />
                          <span>{formatDate(promo.endDate)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Repeat */}
                    <button
                      type="button"
                      onClick={() => handleRepeat(promo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/20 transition-colors shrink-0"
                    >
                      <RefreshCw size={12} /> Repeat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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

      {/* New Promotion Modal */}
      {showNewPromo && <NewPromoModal onClose={() => setShowNewPromo(false)} onToast={onToast} />}
    </div>
  );
}
