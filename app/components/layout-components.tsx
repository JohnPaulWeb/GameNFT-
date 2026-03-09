'use client';

import { MoreVertical, Share2, Flame } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 py-16">
      {/* Icon Container */}
      <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 border border-cyan-400/30 animate-fade-up">
        <div className="text-cyan-300 text-4xl">
          {icon}
        </div>
      </div>

      {/*ito yung Text Content */}
      <div className="text-center max-w-md mb-8 space-y-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-2xl md:text-3xl font-bold font-display text-white">
          {title}
        </h3>
        <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
          {description}
        </p>
      </div>

      {/*ito yung Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold px-8 py-3 rounded-lg animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          {action.label}
        </Button>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 252, 0.3), transparent)',
          }}
        />
      </div>
    </div>
  );
}

interface CollectionStatsProps {
  stats: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    highlight?: boolean;
  }[];
}

export function CollectionStats({ stats }: CollectionStatsProps) {
  return (
    // ito yung key index map
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl p-5 transition-all duration-300 animate-fade-up ${
            stat.highlight
              ? 'bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/30'
              : 'bg-gradient-to-br from-white/5 to-white/2 border-white/10 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10'
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* ito yung stat and label and icon */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                {stat.label}
              </span>
              {stat.icon && (
                <div className="text-cyan-300 text-lg">
                  {stat.icon}
                </div>
              )}
            </div>
            <div className="text-2xl md:text-3xl font-bold font-display text-white">
              {stat.value}
            </div>
          </div>

          {stat.highlight && (
            <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-20 rounded-2xl blur-xl"
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2), transparent)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
