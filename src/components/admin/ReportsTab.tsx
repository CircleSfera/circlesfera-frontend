import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import type { AdminReport } from '../../services/admin.service';
import type { PaginatedResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Table,
  StatusBadge,
  ActionButton,
  Pagination,
  SearchInput,
  FilterDropdown,
} from './AdminTable';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = Math.max(0, now - d);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(date).toLocaleDateString();
}

interface Props {
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export default function ReportsTab({ onToast }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<AdminReport>>({
    queryKey: ['admin', 'reports', page, debouncedSearch, statusFilter],
    queryFn: () =>
      adminApi
        .getReports(page, 10, debouncedSearch || undefined, statusFilter || undefined)
        .then((res) => res.data as PaginatedResponse<AdminReport>),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateReport(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      onToast('Reporte actualizado', 'success');
    },
    onError: () => onToast('Error al actualizar reporte', 'error'),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar reportes..."
        />
        <FilterDropdown
          label="Filtrar por estado"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'resolved', label: 'Resueltos' },
            { value: 'dismissed', label: 'Descartados' },
          ]}
        />
      </div>

      <div className="glass-panel rounded-2xl overflow-clip border border-white/10">
        <Table
          headers={[
            'Fecha',
            'Reportero',
            'Tipo',
            'Motivo',
            'Detalles',
            'Estado',
            'Acciones',
          ]}
          loading={isLoading}
          isEmpty={!data || data.data.length === 0}
        >
          {data?.data.map((report) => (
            <>
              {/* Desktop row */}
              <motion.tr
                key={report.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="hover:bg-white/[0.07] transition-colors border-b border-white/5 last:border-0"
              >
                <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">
                  <span title={new Date(report.createdAt).toLocaleString()}>
                    {timeAgo(report.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-white font-medium text-sm">
                    @{report.reporter?.profile?.username || 'Anónimo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black uppercase tracking-wider text-gray-400 border border-white/10">
                    {report.targetType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-red-400 text-sm font-medium">
                    {report.reason}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {report.details ? (
                    <button
                      type="button"
                      aria-label="Ver detalles"
                      onClick={() =>
                        setExpandedId(
                          expandedId === report.id ? null : report.id
                        )
                      }
                      className="text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    >
                      {expandedId === report.id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      {expandedId === report.id ? 'Ocultar' : 'Ver'}
                    </button>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    {report.status === 'pending' && (
                      <>
                        <ActionButton
                          onClick={() =>
                            updateMutation.mutate({
                              id: report.id,
                              status: 'resolved',
                            })
                          }
                          label="Resolver"
                          variant="success"
                          iconOnly
                          disabled={updateMutation.isPending}
                        />
                        <ActionButton
                          onClick={() =>
                            updateMutation.mutate({
                              id: report.id,
                              status: 'dismissed',
                            })
                          }
                          label="Descartar"
                          variant="ghost"
                          iconOnly
                          disabled={updateMutation.isPending}
                        />
                      </>
                    )}
                    <a
                      href={
                        report.targetType === 'post'
                          ? `/post/${report.targetId}`
                          : `/profile/${report.targetId}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver contenido"
                      className="p-2 rounded-lg text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white transition-all"
                      aria-label="Ver contenido reportado"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </td>
              </motion.tr>

              {/* Expanded details row */}
              {expandedId === report.id && report.details && (
                <tr
                  key={`${report.id}-details`}
                  className="border-b border-white/5"
                >
                  <td colSpan={7} className="px-6 py-4 bg-white/2">
                    <p className="text-gray-400 text-sm">{report.details}</p>
                  </td>
                </tr>
              )}
            </>
          ))}
        </Table>
        <Pagination meta={data?.meta} onPageChange={setPage} />
      </div>
    </div>
  );
}
