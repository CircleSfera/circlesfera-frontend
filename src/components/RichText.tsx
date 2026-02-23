import { Link } from 'react-router-dom';

interface RichTextProps {
  text: string;
  className?: string;
}

export default function RichText({ text, className = '' }: RichTextProps) {
  if (!text) return null;

  // Regex to match #tag and @mention
  // We use capturing groups to split the string but keep the delimiters
  const regex = /((?:#|@)[\w\u00C0-\u00FF]+)/g;
  
  const parts = text.split(regex);

  return (
    <span className={`whitespace-pre-wrap break-all ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          const tag = part.slice(1);
          return (
            <Link
              key={index}
              to={`/explore/tags/${tag}`}
              className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <Link
              key={index}
              to={`/${username}`}
              className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors"
            >
              {part}
            </Link>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
