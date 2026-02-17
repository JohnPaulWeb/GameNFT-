import * as React from 'react';

import {cn} from '@/app/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2.5 text-base text-white ring-offset-background placeholder:text-white/40 focus-visible:outline-none focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/20 focus-visible:ring-offset-0 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 font-body resize-none md:text-base',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
