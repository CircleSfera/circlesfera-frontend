import Carousel from '../Carousel';
import type { Post } from '../../types';

interface PostMediaProps {
  post: Post;
}

export default function PostMedia({ post }: PostMediaProps) {
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
