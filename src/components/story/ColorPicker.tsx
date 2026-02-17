import { motion } from 'framer-motion';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#4CD964', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Indigo
  '#AF52DE', // Purple
  '#FF2D55', // Pink
];

export default function ColorPicker({ 
  selectedColor, 
  onColorSelect, 
  colors = DEFAULT_COLORS 
}: ColorPickerProps) {
  return (
    <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar px-1">
      {colors.map((color) => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onColorSelect(color)}
          className={`w-8 h-8 rounded-full shrink-0 border-2 transition-all ${
            selectedColor === color ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-white/10'
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}
