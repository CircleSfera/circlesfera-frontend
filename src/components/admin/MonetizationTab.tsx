import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, History, PieChart, Receipt, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/admin.service';
import StatCard from './StatCard';

export default function MonetizationTab() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['adminMonetization'],
    queryFn: () => adminApi.getMonetizationAnalytics().then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl border border-red-500/10">
        <DollarSign size={48} className="text-red-500/20 mx-auto mb-4" />
        <h3 className="text-white font-bold text-lg">Error al cargar datos</h3>
        <p className="text-gray-500">No se pudo obtener la información de monetización.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Volumen Bruto Total"
          value={analytics?.totalGrossVolume || 0}
          icon={TrendingUp}
          color="blue"
          growth={analytics?.grossVolumeGrowth}
        />
        <StatCard
          label="Ingresos Plataforma (20%)"
          value={analytics?.platformRevenue || 0}
          icon={PieChart}
          color="purple"
          growth={analytics?.grossVolumeGrowth}
        />
        <StatCard
          label="Compras Realizadas"
          value={analytics?.totalPurchases || 0}
          icon={Receipt}
          color="green"
          growth={analytics?.purchasesGrowth}
        />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Platform Transactions */}
        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} className="text-brand-primary" /> Transacciones Recientes
            </h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">ID / Tipo</th>
                  <th className="px-6 py-4">Creador</th>
                  <th className="px-6 py-4">Comprador</th>
                  <th className="px-6 py-4 text-right">Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics?.recentPurchases?.map((p: {
                  id: string;
                  targetType: string;
                  creator?: { profile: { username: string } };
                  buyer?: { profile: { username: string } };
                  amount: number;
                }) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-400">
                          {p.id.substring(0, 8)}...
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">
                          {p.targetType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-300">
                        @{p.creator?.profile?.username || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-400">
                        @{p.buyer?.profile?.username || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-white">
                        ${p.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!analytics?.recentPurchases || analytics.recentPurchases.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-600 text-xs font-bold">
                      SIN TRANSACCIONES REGISTRADAS
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Distribution Info */}
        <div className="glass-panel rounded-3xl border border-white/5 p-8 flex flex-col justify-center bg-linear-to-br from-brand-primary/5 to-transparent">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <PieChart size={32} className="text-brand-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Distribución de Ingresos</h3>
              <p className="text-gray-500 text-sm font-medium">Modelo 80/20 estándar de CircleSfera</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Distribución Real</span>
                <span className="text-xs font-black text-white">100.0%</span>
              </div>
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                />
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '20%' }}
                   transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                   className="h-full bg-brand-primary rounded-full ml-0.5 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)]" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Creadores (80%)</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Settlement Directo</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-white tabular-nums">
                  ${((analytics?.totalGrossVolume ?? 0) * 0.8).toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-5 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 hover:border-brand-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand-primary">Plataforma (20%)</span>
                    <span className="text-[10px] text-brand-primary/60 font-bold uppercase tracking-tighter">Fee de Servicio</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-brand-primary tabular-nums">
                  ${(analytics?.platformRevenue ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-black/20 rounded-2xl border border-white/5 flex items-start gap-3">
            <ShieldCheck size={20} className="text-green-500 mt-1" />
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Todos los pagos son procesados de forma segura a través de <strong className="text-white">Stripe Connect</strong>. 
              La plataforma retiene automáticamente el 20% de cada transacción antes de liquidar el saldo al creador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
