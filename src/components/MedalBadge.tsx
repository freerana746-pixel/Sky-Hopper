import React from 'react';
import { MedalTier } from '../game/types';

interface MedalBadgeProps {
  tier: MedalTier;
  size?: number;
}

export const MedalBadge: React.FC<MedalBadgeProps> = ({ tier, size = 48 }) => {
  if (tier === 'none') {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 text-xs font-medium"
      >
        —
      </div>
    );
  }

  const configs: Record<
    Exclude<MedalTier, 'none'>,
    { label: string; bg: string; border: string; ribbon: string; star: string }
  > = {
    bronze: {
      label: 'Bronze',
      bg: 'linear-gradient(135deg, #FDBA74, #C2410C)',
      border: '#9A3412',
      ribbon: '#EA580C',
      star: '#FFEDD5',
    },
    silver: {
      label: 'Silver',
      bg: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
      border: '#64748B',
      ribbon: '#3B82F6',
      star: '#FFFFFF',
    },
    gold: {
      label: 'Gold',
      bg: 'linear-gradient(135deg, #FEF08A, #EAB308)',
      border: '#CA8A04',
      ribbon: '#EF4444',
      star: '#FFFBEB',
    },
    platinum: {
      label: 'Platinum',
      bg: 'linear-gradient(135deg, #E0E7FF, #818CF8, #C084FC)',
      border: '#6366F1',
      ribbon: '#8B5CF6',
      star: '#FFFFFF',
    },
  };

  const c = configs[tier];

  return (
    <div className="relative inline-flex flex-col items-center group" title={`${c.label} Medal`}>
      {/* Ribbon */}
      <div className="flex gap-0.5 -mb-2 z-0">
        <div
          className="w-2.5 h-4 rounded-t-sm shadow-xs"
          style={{ backgroundColor: c.ribbon }}
        />
        <div
          className="w-2.5 h-4 rounded-t-sm shadow-xs"
          style={{ backgroundColor: c.ribbon }}
        />
      </div>

      {/* Coin medal */}
      <div
        style={{
          width: size,
          height: size,
          background: c.bg,
          borderColor: c.border,
        }}
        className="relative z-10 rounded-full border-2 shadow-md flex items-center justify-center animate-bounce-subtle"
      >
        {/* Inner ring */}
        <div
          style={{ borderColor: c.border }}
          className="w-3/4 h-3/4 rounded-full border border-dashed flex items-center justify-center opacity-80"
        >
          {/* Star symbol */}
          <svg
            className="w-4 h-4 drop-shadow-xs"
            fill={c.star}
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>

        {/* Shine gloss glare */}
        <div className="absolute top-1 left-2 w-2.5 h-1.5 bg-white/60 rounded-full rotate-[-30deg]" />
      </div>

      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-1 uppercase tracking-wider">
        {c.label}
      </span>
    </div>
  );
};
