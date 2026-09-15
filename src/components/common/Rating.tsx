import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  showValue = true,
  size = 'md'
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400 fill-amber-400">
        <Star className={`${iconSizes[size]} fill-amber-400`} />
      </div>
      {showValue && (
        <span className={`font-semibold text-slate-800 ${textSizes[size]}`}>
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={`text-slate-400 font-normal ${textSizes[size]}`}>
          ({count} نظر)
        </span>
      )}
    </div>
  );
};
