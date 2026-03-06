import { AIAdvisorClient } from '@/app/components/ai-advisor-client';

export default function AIAdvisorPage() {
  return (
    <div className="w-full min-h-screen flex flex-col relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 md:px-8 py-12 md:py-20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* ito naman yung background and animation */}
          <div 
            className="absolute top-0 left-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5), rgba(16, 240, 252, 0.3), transparent)',
              animation: 'aurora 18s ease-in-out infinite',
            }} 
          />
          
          {/* ito naman yung animmated overview  */}
          <div 
            className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(187, 100, 253, 0.4), transparent)',
              animation: 'glow-pulse 14s ease-in-out infinite',
              animationDelay: '3s',
            }} 
          />
        </div>

        {/* ito naman ying ai advisor */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300">AI-Powered Insights</span>
            </div>
            {/* ito naman yung AI-Advisor */}
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight tracking-tight text-white">
              AI Advisor
              <span className="block bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                Smart AI-powered Intelligence
              </span>
            </h1>

            {/* ito naman yung AI powered */}
            <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl leading-relaxed">
              Leverage AI-powered analysis to optimize your NFT trading strategy and maximize returns.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* link for AI-AdvisorClient */}
          <AIAdvisorClient />
        </div>
      </div>
    </div>
  );
}


// End of the coded