
// ito yung Client Side Components\
'use client';

import React from 'react';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';


// ito yung StatItem Interface
interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'cyan' | 'indigo' | 'gold' | 'rose' | 'emerald';
}

// ito yung stats-dashboard Props 
interface StatsDashboardProps {
  stats: StatItem[];
  title?: string;
  description?: string;
}
// ito yung Color Classes for different stat types
const colorClasses = {
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-400/30',
    text: 'text-cyan-300',
    icon: 'bg-cyan-400/20',
    change: 'text-cyan-300',
  },
  indigo: {
    bg: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-400/30',
    text: 'text-indigo-300',
    icon: 'bg-indigo-400/20',
    change: 'text-indigo-300',
  },
  gold: {
    bg: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-400/30',
    text: 'text-amber-300',
    icon: 'bg-amber-400/20',
    change: 'text-amber-300',
  },
  rose: {
    bg: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-400/30',
    text: 'text-rose-300',
    icon: 'bg-rose-400/20',
    change: 'text-rose-300',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-400/30',
    text: 'text-emerald-300',
    icon: 'bg-emerald-400/20',
    change: 'text-emerald-300',
  },
};

// ito yung stats-dashboard component
export function StatsDashboard({
  stats,
  title,
  description,
}: StatsDashboardProps) {
  return (
    <div className="w-full space-y-6">
      {/*ito yung Header */}
      {(title || description) && (
        <div className="space-y-2 animate-fade-up">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-[hsl(var(--text-secondary))]">
              {description}
            </p>
          )}
        </div>
      )}

      {/* ito yung Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const isPositive = !stat.change || stat.change >= 0;

          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border animate-fade-up ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/*ito yung Glow Effect */}
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-2xl blur-xl"
                style={{
                  background: `radial-gradient(circle at center, rgba(${stat.color === 'cyan' ? '0, 240, 252' : stat.color === 'indigo' ? '99, 102, 241' : stat.color === 'gold' ? '245, 158, 11' : stat.color === 'rose' ? '236, 72, 153' : '16, 185, 129'}, 0.25), transparent)`,
                  pointerEvents: 'none',
                }}
              />

              {/*ito yung  Content */}
              <div className="relative z-10 space-y-4">
                {/*ito yung Header */}
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${colors.icon}`}>
                    <div className={`${colors.text} text-xl`}>
                      {stat.icon}
                    </div>
                  </div>
                  {stat.change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'}`}>
                      <TrendingUp className={`h-3 w-3 ${!isPositive && 'rotate-180'}`} />
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  )}
                </div>

                {/*ito yung Stats */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className={`text-2xl md:text-3xl font-bold font-display ${colors.text}`}>
                    {stat.value}
                  </p>
                </div>
              </div>

              {/* ito yung Bottom Border Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ito yung Export preset stat configurations
export const statPresets = {
  portfolio: {
    title: 'Your Portfolio',
    description: 'Overview of your NFT collection and trading activity',
  },
  marketplace: {
    title: 'Marketplace Activity',
    description: 'Real-time marketplace statistics and trending items',
  },
  trading: {
    title: 'Trading Performance',
    description: 'Your trading statistics and performance metrics',
  },
};
