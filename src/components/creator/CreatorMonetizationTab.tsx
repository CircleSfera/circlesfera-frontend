import { useQuery, useMutation } from '@tanstack/react-query';
import { DollarSign, TrendingUp, History, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { paymentsApi } from '../../services';
import { useAuthStore } from '../../stores/authStore';

export default function CreatorMonetizationTab() {
  const { profile } = useAuthStore();
  const user = profile?.user;

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['creatorAnalytics'],
    queryFn: () => paymentsApi.getCreatorAnalytics(),
    enabled: !!user?.stripeAccountId,
  });

  const connectMutation = useMutation({
    mutationFn: () => paymentsApi.createConnectAccount(),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  if (!user?.stripeAccountId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-panel rounded-3xl border border-white/5">
        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
          <DollarSign size={40} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Comienza a monetizar</h2>
        <p className="text-gray-400 max-w-sm mb-8">
          Configura tu cuenta de Stripe Connect para empezar a vender contenido PPV y recibir pagos directamente en tu cuenta bancaria.
        </p>
        <button
          onClick={() => connectMutation.mutate()}
          disabled={connectMutation.isPending}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
        >
          {connectMutation.isPending ? 'Cargando...' : (
            <>
              Configurar Stripe <ExternalLink size={18} />
            </>
          )}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="h-64 bg-white/5 rounded-3xl md:col-span-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl border border-red-500/10">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <p className="text-white font-bold">Error al cargar estadísticas</p>
        <p className="text-gray-400 text-sm">Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 glass-panel rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} className="text-blue-500" />
          </div>
          <p className="text-gray-400 font-medium mb-1">Ingresos Totales (Neto 80%)</p>
          <h3 className="text-4xl font-black text-white tracking-tight">
            ${analytics?.totalEarnings?.toFixed(2) || '0.00'}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
            <ShieldCheck size={14} /> Pagos seguros con Stripe
          </div>
        </div>

        <div className="p-6 glass-panel rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} className="text-indigo-500" />
          </div>
          <p className="text-gray-400 font-medium mb-1">Este Mes</p>
          <h3 className="text-4xl font-black text-white tracking-tight">
             ${analytics?.earningsThisMonth?.toFixed(2) || '0.00'}
          </h3>
          <p className="text-indigo-400 text-sm mt-4 font-medium flex items-center gap-1">
            Calculado sobre compras completadas este periodo
          </p>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={20} className="text-gray-400" /> Ventas Recientes
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Contenido</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics?.recentSales?.map((sale: { 
                id: string; 
                buyer: { profile: { username: string; avatar: string | null } }; 
                targetType: string; 
                createdAt: string; 
                amount: number; 
              }) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                        {sale.buyer?.profile?.avatar ? (
                          <img src={sale.buyer.profile.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                             {sale.buyer?.profile?.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-white">@{sale.buyer?.profile?.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-400 border border-white/10">
                      {sale.targetType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-white">
                      +${(sale.amount * 0.8).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {(!analytics?.recentSales || analytics.recentSales.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Aún no se han registrado ventas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
