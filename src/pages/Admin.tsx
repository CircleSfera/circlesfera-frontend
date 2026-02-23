import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, reportsApi, usersApi, postsApi } from '../services';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Image as ImageIcon, 
  BarChart3, 
  Flag,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Ban,
  Search,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar, LoadingSpinner } from '../components';
import ConfirmModal from '../components/modals/ConfirmModal';
import { clsx } from 'clsx';

type Tab = 'analytics' | 'reports' | 'users' | 'posts';

interface AdminStats {
  users: number;
  posts: number;
  stories: number;
  pendingReports: number;
}

interface AdminUser {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    username: string;
    fullName: string | null;
    avatar: string | null;
  } | null;
}

interface AdminPost {
  id: string;
  caption: string | null;
  type: string;
  createdAt: string;
  media?: { url: string }[] | null;
  user?: {
    profile: {
      username: string;
    };
  } | null;
}

interface AdminReport {
  id: string;
  reason: string;
  details?: string | null;
  status: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  reporter?: {
    username: string;
  } | null;
}

interface PaginatedData<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ban_user' | 'unban_user' | 'delete_post' | null;
    id: string | null;
  }>({ type: null, id: null });

  const queryClient = useQueryClient();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then(res => res.data),
    enabled: activeTab === 'analytics'
  });

  const { data: reports, isLoading: reportsLoading } = useQuery<AdminReport[]>({
    queryKey: ['admin', 'reports'],
    queryFn: () => reportsApi.getAll().then(res => res.data as AdminReport[]),
    enabled: activeTab === 'reports'
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<PaginatedData<AdminUser>>({
    queryKey: ['admin', 'users', page, searchQuery],
    queryFn: () => adminApi.getUsers(page, 10, searchQuery).then(res => res.data as PaginatedData<AdminUser>),
    enabled: activeTab === 'users'
  });

  const { data: postsData, isLoading: postsLoading } = useQuery<PaginatedData<AdminPost>>({
    queryKey: ['admin', 'posts', page, searchQuery],
    queryFn: () => adminApi.getPosts(page, 10, searchQuery).then(res => res.data as PaginatedData<AdminPost>),
    enabled: activeTab === 'posts'
  });

  // Mutations
  const updateReportMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reportsApi.update(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });

  const banUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction({ type: null, id: null });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.unban(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction({ type: null, id: null });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => postsApi.adminDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      setConfirmAction({ type: null, id: null });
    },
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = useMemo(() => [
    { id: 'analytics', label: 'Estadísticas', icon: BarChart3 },
    { id: 'reports', label: 'Reportes', icon: Flag },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'posts', label: 'Publicaciones', icon: ImageIcon },
  ], []);

  return (
    <div className="min-h-screen pt-8 pb-20 px-4 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="text-brand-primary" size={32} />
            Panel de Control
          </h1>
          <p className="text-gray-400 mt-1">Gestión administrativa de CircleSfera</p>
        </div>

        <nav className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); setSearchQuery(''); }}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {(activeTab === 'users' || activeTab === 'posts') && (
        <div className="mb-6 relative max-w-md">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text"
            placeholder={`Buscar ${activeTab === 'users' ? 'usuarios...' : 'publicaciones...'}`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl h-32 animate-pulse bg-white/5" />
                ))
              ) : (
                <>
                  <StatCard label="Usuarios Totales" value={stats?.users || 0} icon={Users} color="blue" />
                  <StatCard label="Publicaciones" value={stats?.posts || 0} icon={ImageIcon} color="purple" />
                  <StatCard label="Historias Activas" value={stats?.stories || 0} icon={Clock} color="pink" />
                  <StatCard label="Reportes Pendientes" value={stats?.pendingReports || 0} icon={Flag} color="red" />
                </>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
              <Table 
                headers={['Fecha', 'Reportero', 'Tipo', 'Motivo', 'Estado', 'Acciones']}
                loading={reportsLoading}
                isEmpty={!reports || reports.length === 0}
              >
                {reports?.map((report) => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        @{report.reporter?.username || 'Anónimo'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black uppercase tracking-wider text-gray-400 border border-white/10">
                        {report.targetType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-red-400 text-sm font-medium">{report.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {report.status === 'pending' && (
                          <>
                            <ActionButton 
                              onClick={() => updateReportMutation.mutate({ id: report.id, status: 'resolved' })}
                              label="Resolver"
                              variant="success"
                            />
                            <ActionButton 
                              onClick={() => updateReportMutation.mutate({ id: report.id, status: 'dismissed' })}
                              label="Descartar"
                              variant="ghost"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
              <Table 
                headers={['Usuario', 'Email', 'Unido el', 'Estado', 'Acciones']}
                loading={usersLoading}
                isEmpty={!usersData || usersData.data.length === 0}
              >
                {usersData?.data.map((user) => (
                   <tr key={user.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <UserAvatar 
                           src={user.profile?.avatar || undefined} 
                           alt={user.profile?.username || 'user'} 
                           size="sm" 
                         />
                         <div>
                           <p className="text-white font-bold text-sm">@{user.profile?.username || 'user'}</p>
                           <p className="text-gray-500 text-xs">{user.profile?.fullName || ''}</p>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                     <td className="px-6 py-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                     <td className="px-6 py-4">
                       {!user.isActive ? 
                         <span className="text-red-500 text-xs font-black uppercase flex items-center gap-1">
                           <AlertCircle size={10} />
                           Baneado
                         </span> : 
                         <span className="text-green-500 text-xs font-black uppercase">Activo</span>
                       }
                     </td>
                      <td className="px-6 py-4">
                       {user.isActive ? (
                         <ActionButton 
                           onClick={() => setConfirmAction({ type: 'ban_user', id: user.id })}
                           label="Banear"
                           variant="danger"
                           icon={Ban}
                         />
                       ) : (
                         <ActionButton 
                           onClick={() => setConfirmAction({ type: 'unban_user', id: user.id })}
                           label="Desbanear"
                           variant="success"
                         />
                       )}
                     </td>
                   </tr>
                ))}
              </Table>
              <Pagination 
                meta={usersData?.meta} 
                onPageChange={setPage} 
              />
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
              <Table 
                headers={['Publicación', 'Autor', 'Fecha', 'Tipo', 'Acciones']}
                loading={postsLoading}
                isEmpty={!postsData || postsData.data.length === 0}
              >
                {postsData?.data.map((post) => (
                   <tr key={post.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0">
                           {post.media?.[0]?.url && (
                             <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
                           )}
                         </div>
                         <p className="text-white text-sm truncate max-w-[200px]">{post.caption || '(Sin pie de foto)'}</p>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className="text-gray-300 text-sm">@{post.user?.profile.username}</span>
                     </td>
                     <td className="px-6 py-4 text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</td>
                     <td className="px-6 py-4">
                        <span className="text-xs text-gray-400">{post.type}</span>
                     </td>
                     <td className="px-6 py-4">
                        <ActionButton 
                          onClick={() => setConfirmAction({ type: 'delete_post', id: post.id })}
                          label="Eliminar"
                          variant="danger"
                        />
                     </td>
                   </tr>
                ))}
              </Table>
              <Pagination 
                meta={postsData?.meta} 
                onPageChange={setPage} 
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmAction.type !== null}
        onClose={() => setConfirmAction({ type: null, id: null })}
        onConfirm={() => {
          if (!confirmAction.id) return;
          if (confirmAction.type === 'ban_user') banUserMutation.mutate(confirmAction.id);
          if (confirmAction.type === 'unban_user') unbanUserMutation.mutate(confirmAction.id);
          if (confirmAction.type === 'delete_post') deletePostMutation.mutate(confirmAction.id);
        }}
        title={
          confirmAction.type === 'ban_user' ? '¿Banear a este usuario?' :
          confirmAction.type === 'unban_user' ? '¿Desbanear a este usuario?' :
          '¿Eliminar publicación?'
        }
        message={
          confirmAction.type === 'ban_user' ? 'El usuario no podrá acceder a su cuenta ni interactuar en la plataforma hasta que sea desbaneado.' :
          confirmAction.type === 'unban_user' ? 'El usuario recuperará el acceso completo a su cuenta y podrá volver a interactuar en la plataforma.' :
          'Esta acción es irreversible y eliminará el contenido permanentemente de la plataforma.'
        }
        confirmText={
          confirmAction.type === 'ban_user' ? 'Banear Usuario' :
          confirmAction.type === 'unban_user' ? 'Desbanear Usuario' :
          'Eliminar'
        }
        cancelText="Cancelar"
        isDestructive={confirmAction.type === 'ban_user' || confirmAction.type === 'delete_post'}
        isLoading={banUserMutation.isPending || unbanUserMutation.isPending || deletePostMutation.isPending}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'pink' | 'red';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colors: Record<StatCardProps['color'], string> = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    pink: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-black text-white">{value.toLocaleString()}</p>
        </div>
        <div className={clsx("p-3 rounded-xl border", colors[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  loading: boolean;
  isEmpty: boolean;
}

function Table({ headers, children, loading, isEmpty }: TableProps) {
  if (loading) return (
    <div className="p-20 flex flex-col items-center gap-4 text-gray-400">
      <LoadingSpinner size="lg" />
      <p className="animate-pulse">Cargando datos...</p>
    </div>
  );

  if (isEmpty) return (
    <div className="p-20 text-center text-gray-500 italic">No se encontraron resultados.</div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            {headers.map((h: string) => (
              <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPending = status === 'pending';
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
      isPending ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20" : "text-green-400 bg-green-400/10 border border-green-400/20"
    )}>
      {isPending ? <Clock size={12} /> : <CheckCircle size={12} />}
      {status}
    </span>
  );
}

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  variant: 'success' | 'danger' | 'ghost';
  icon?: React.ElementType;
}

function ActionButton({ onClick, label, variant, icon: Icon }: ActionButtonProps) {
  const styles: Record<ActionButtonProps['variant'], string> = {
    success: 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white',
    ghost: 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
        styles[variant]
      )}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

interface PaginationProps {
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-white/5 bg-white/2">
      <p className="text-xs text-gray-500">
        Mostrando <span className="text-white font-bold">{meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0}</span> al <span className="text-white font-bold">{Math.min(meta.page * meta.limit, meta.total)}</span> de <span className="text-white font-bold">{meta.total}</span>
      </p>
      <div className="flex gap-2">
        <button
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
