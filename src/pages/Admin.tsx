
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, reportsApi, usersApi, postsApi } from '../services';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Report {
    id: string;
    reason: string;
    details?: string;
    status: string;
    targetType: string;
    targetId: string;
    createdAt: string;
    reporter: {
        username: string;
    };
}

export default function AdminDashboard() {
    const { data: reports, isLoading, error } = useQuery({
        queryKey: ['admin', 'reports'],
        queryFn: async () => {
            const res = await api.get<Report[]>('/api/v1/reports');
            return res.data;
        }
    });

    const queryClient = useQueryClient();

    const updateReportMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => reportsApi.update(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
    });

    const banUserMutation = useMutation({
        mutationFn: (id: string) => usersApi.ban(id),
        onSuccess: () => alert('User banned successfully'),
    });

    const deletePostMutation = useMutation({
        mutationFn: (id: string) => postsApi.adminDelete(id),
        onSuccess: () => alert('Post deleted successfully'),
    });

    if (isLoading) return <div className="p-8 text-center text-white">Loading reports...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Error loading reports: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    return (
        <div className="min-h-screen pt-8 pb-20 px-4 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <AlertCircle className="text-red-500" />
                Admin Dashboard
            </h1>

            <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
                
                {reports?.length === 0 ? (
                    <p className="text-gray-400">No reports found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="text-xs uppercase bg-white/5 text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                    <th className="px-4 py-3">Reporter</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Details</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {reports?.map((report) => (
                                    <tr key={report.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-white font-medium">
                                           @{report.reporter?.username || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 uppercase text-xs font-bold text-gray-400">
                                            {report.targetType}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-xs font-bold border border-red-500/20">
                                                {report.reason}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {report.status === 'pending' ? (
                                                <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold">
                                                    <Clock size={14} /> Pending
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                                                    <CheckCircle size={14} /> {report.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate text-gray-400" title={report.details}>
                                            {report.details || '-'}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button type="button" 
                                                        onClick={() => updateReportMutation.mutate({ id: report.id, status: 'resolved' })}
                                                        className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded text-xs transition-colors"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button type="button" 
                                                        onClick={() => updateReportMutation.mutate({ id: report.id, status: 'dismissed' })}
                                                        className="px-2 py-1 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 rounded text-xs transition-colors"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </>
                                            )}
                                            {report.targetType === 'user' && (
                                                <button type="button" 
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to ban this user?')) {
                                                            banUserMutation.mutate(report.targetId);
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors"
                                                >
                                                    Ban User
                                                </button>
                                            )}
                                            {report.targetType === 'post' && (
                                                <button type="button" 
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this post?')) {
                                                            deletePostMutation.mutate(report.targetId);
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors"
                                                >
                                                    Delete Post
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
