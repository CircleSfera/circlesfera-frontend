interface UserAvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  hasStory?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const statusSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
};

export default function UserAvatar({
  src,
  alt,
  size = 'md',
  className = '',
  onClick,
  hasStory = false,
  isOnline,
}: UserAvatarProps) {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&color=fff&bold=true`;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${hasStory ? 'ring-2 ring-pink-500 ring-offset-2' : ''}
          ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
          rounded-full overflow-hidden bg-linear-to-br from-purple-400 to-pink-400
        `}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyPress={(e) => onClick && e.key === 'Enter' && onClick()}
      >
        <img
          src={src || defaultAvatar}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultAvatar;
          }}
        />
      </div>
      
      {isOnline === true && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizeClasses[size]}
            bg-green-500
            border-2 border-[#1c1c1c] rounded-full
          `}
        />
      )}
    </div>
  );
}
