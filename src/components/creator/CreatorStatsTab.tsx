import { useQuery } from '@tanstack/react-query';
import { creatorApi } from '../../services/creator.service';
import type { CreatorStats, CreatorChartDay } from '../../services/creator.service';
import {
  Image as ImageIcon,
  Film,
  Clock,
  Users,
  UserPlus,
  Heart,
  MessageCircle,
  Bookmark,
  Zap,
  Megaphone,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState } from 'react';

function StatMini({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/15 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          <Icon size={18} className={`text-${color}-400`} />
        </div>
        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-white text-2xl font-black">{value}</p>
    </div>
  );
}

export default function CreatorStatsTab() {
  const [activeMetrics, setActiveMetrics] = useState({
    followers: true,
    views: true,
    likes: true,
    comments: true,
  });

  const toggleMetric = (key: keyof typeof activeMetrics) => {
    setActiveMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const { data: stats, isLoading } = useQuery<CreatorStats>({
    queryKey: ['creator', 'stats'],
    queryFn: () => creatorApi.getStats().then((r) => r.data),
  });

  const { data: chartData } = useQuery<CreatorChartDay[]>({
    queryKey: ['creator', 'activity-chart'],
    queryFn: () => creatorApi.getActivityChart().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl h-24 animate-pulse bg-white/5" />
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatMini label="Posts" value={stats?.postCount || 0} icon={ImageIcon} color="purple" />
        <StatMini label="Frames" value={stats?.frameCount || 0} icon={Film} color="blue" />
        <StatMini label="Stories" value={stats?.storyCount || 0} icon={Clock} color="pink" />
        <StatMini label="Seguidores" value={stats?.followerCount || 0} icon={Users} color="green" />
        <StatMini label="Siguiendo" value={stats?.followingCount || 0} icon={UserPlus} color="gray" />
        <StatMini label="Likes Totales" value={stats?.totalLikes || 0} icon={Heart} color="pink" />
        <StatMini
          label="Comentarios"
          value={stats?.totalComments || 0}
          icon={MessageCircle}
          color="blue"
        />
        <StatMini label="Guardados" value={stats?.totalBookmarks || 0} icon={Bookmark} color="yellow" />
        <StatMini
          label="Engagement"
          value={`${stats?.engagementRate || 0}%`}
          icon={Zap}
          color="orange"
        />
        <StatMini
          label="Promociones"
          value={stats?.activePromotions || 0}
          icon={Megaphone}
          color="red"
        />
      </div>

      {/* Activity Chart */}
      <div className="glass-panel rounded-2xl border border-white/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-primary" />
            <h3 className="text-white font-bold text-sm">Evolución (últimos 14 días)</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => toggleMetric('followers')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${activeMetrics.followers ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}
            >
              Seguidores
            </button>
            <button 
              onClick={() => toggleMetric('views')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${activeMetrics.views ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}
            >
              Vistas
            </button>
            <button 
              onClick={() => toggleMetric('likes')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${activeMetrics.likes ? 'bg-pink-500/20 text-pink-400 border-pink-500/50' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}
            >
              Likes
            </button>
            <button 
              onClick={() => toggleMetric('comments')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${activeMetrics.comments ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}
            >
              Comentarios
            </button>
          </div>
        </div>
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="#4b5563"
                fontSize={10}
                tickFormatter={(v) => String(v).slice(5)}
              />
              <YAxis stroke="#4b5563" fontSize={10} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,17,17,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelFormatter={(v) => `Fecha: ${String(v)}`}
              />
              <Legend wrapperStyle={{ display: 'none' }} />
              {activeMetrics.followers && (
                <Area
                  type="monotone"
                  dataKey="followers"
                  name="Nuevos Seguidores"
                  stroke="#10b981"
                  fill="url(#gradFollowers)"
                  strokeWidth={2}
                />
              )}
              {activeMetrics.views && (
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Vistas Stories"
                  stroke="#a855f7"
                  fill="url(#gradViews)"
                  strokeWidth={2}
                />
              )}
              {activeMetrics.likes && (
                <Area
                  type="monotone"
                  dataKey="likes"
                  name="Likes"
                  stroke="#ec4899"
                  fill="url(#gradLikes)"
                  strokeWidth={2}
                />
              )}
              {activeMetrics.comments && (
                <Area
                  type="monotone"
                  dataKey="comments"
                  name="Comentarios"
                  stroke="#3b82f6"
                  fill="url(#gradComments)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-600 text-sm">
            Sin datos de actividad aún
          </div>
        )}
      </div>
    </div>
  );
}
