import Carousel from '../Carousel';
import type { Post } from '../../types';

interface PostMediaProps {
  post: Post;
}

export default function PostMedia({ post }: PostMediaProps) {
  return (
    <div className="relative aspect-4/5 bg-black overflow-hidden group">
      {post.media && post.media.length > 0 ? (
        <Carousel media={post.media} />
      ) : (
        (() => {
          const isVideo = 
            post.mediaUrl?.match(/\.(mp4|mov|webm|quicktime)$/i) || 
            post.mediaType === 'video';
          
          if (isVideo) {
            return (
              <video
                src={post.mediaUrl}
                className="w-full h-full object-cover"
                controls
                playsInline
                loop
              />
            );
          }
          return (
            <img
              src={post.mediaUrl}
              alt={post.caption || ''}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          );
        })()
      )}
    </div>
  );
}
