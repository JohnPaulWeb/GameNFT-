import { cn } from '@/app/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// ito yung LoadingSpinner component 
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/*ito yung Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-white/10" />
      
      {/*ito yung Spinning gradient ring */}
      <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" 
        style={{
          animationDuration: '1s',
        }}
      />
      
      {/*ito yung Inner pulsing dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>
      
      {/*ito yung Glow effect */}
      <div className="absolute inset-0 rounded-full opacity-50 blur-md"
        style={{
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.3), transparent 70%)',
        }}
      />
    </div>
  );
}


// ito yung LoadingProps
interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

// ito yung  LoadingState component
export function LoadingState({ message = 'Loading', submessage }: LoadingStateProps) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <div className="space-y-2">
          <p className="text-lg text-white font-semibold animate-pulse">{message}</p>
          {submessage && (
            <p className="text-sm text-[hsl(var(--text-secondary))]">{submessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
