import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Image as ImageIcon, Clock, Megaphone, DollarSign } from 'lucide-react';
import type { CreatorPost } from '../services/creator.service';
import CreatorStatsTab from '../components/creator/CreatorStatsTab';
import CreatorPostsTab from '../components/creator/CreatorPostsTab';
import CreatorStoriesTab from '../components/creator/CreatorStoriesTab';
import CreatorPromotionsTab from '../components/creator/CreatorPromotionsTab';
import CreatorMonetizationTab from '../components/creator/CreatorMonetizationTab';
import PromoteModal from '../components/creator/PromoteModal';

type Tab = 'stats' | 'content' | 'stories' | 'promotions' | 'monetization';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'stats', label: 'Resumen', icon: BarChart3 },
  { id: 'content', label: 'Contenido', icon: ImageIcon },
  { id: 'stories', label: 'Stories', icon: Clock },
  { id: 'promotions', label: 'Promociones', icon: Megaphone },
  { id: 'monetization', label: 'Monetización', icon: DollarSign },
];

export default function Creator() {

  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [promotePost, setPromotePost] = useState<CreatorPost | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: string }[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Creator Studio
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Analíticas y gestión de tu contenido
        </p>
      </header>

      {/* Tab Navigation */}
      <nav className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-8 w-fit border border-white/5 glass-panel">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === id
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {activeTab === id && (
              <motion.div
                layoutId="creator-tab"
                className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={16} />
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stats' && <CreatorStatsTab />}
          {activeTab === 'content' && (
            <CreatorPostsTab onPromote={(post) => setPromotePost(post)} />
          )}
          {activeTab === 'stories' && <CreatorStoriesTab />}
          {activeTab === 'promotions' && (
            <CreatorPromotionsTab onToast={addToast} />
          )}
          {activeTab === 'monetization' && <CreatorMonetizationTab />}
        </motion.div>
      </AnimatePresence>

      {/* Promote Modal */}
      {promotePost && (
        <PromoteModal
          post={promotePost}
          onClose={() => setPromotePost(null)}
          onToast={addToast}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xl animate-slide-up ${
              t.type === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
