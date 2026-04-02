import Carousel from '../Carousel';
import type { Post } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { Lock } from 'lucide-react';
import { paymentsApi } from '../../services';

interface PostMediaProps {
  post: Post;
}

export default function PostMedia({ post }: PostMediaProps) {
  const { profile } = useAuthStore();
  const isOwner = profile?.userId === post.userId;

  const handleCheckout = async () => {
    try {
      const response = await paymentsApi.createCheckoutSession('post', post.id);
      if (response.sessionUrl) {
        window.location.href = response.sessionUrl;
      }
    } catch (error) {
      console.error('Could not initiate payment:', error);
      alert('Error initiating checkout. Please try again.');
    }
  };

  // Render Lock Screen if Premium, Not Purchased, and Not Owner
  if (post.isPremium && !post.isPurchased && !isOwner) {
    return (
      <div className="relative aspect-4/5 bg-gray-900 overflow-hidden flex flex-col items-center justify-center p-6 text-center border-y border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-black/80 to-gray-900/90 backdrop-blur-3xl z-0" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 shadow-xl border border-white/10">
            <Lock className="w-8 h-8 text-white/80" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Post Exclusivo</h3>
          <p className="text-white/60 text-sm mb-6 max-w-[260px] leading-relaxed">
            Desbloquea este contenido para ver el material multimedia y la descripción completa.
          </p>
          
          <button 
            onClick={handleCheckout}
            className="px-8 py-3 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
          >
            <span>Desbloquear por {post.currency === 'usd' ? '$' : ''}{(post.price || 0).toFixed(2)} {post.currency?.toUpperCase() !== 'USD' ? post.currency?.toUpperCase() : ''}</span>
          </button>
        </div>
      </div>
    );
  }

  // Use new media array if available
  if (post.media && post.media.length > 0) {
    return (
      <div className="relative aspect-4/5 bg-black overflow-hidden group">
        <Carousel media={post.media} />
      </div>
    );
  }

  return null;
}
