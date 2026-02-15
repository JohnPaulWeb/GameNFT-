import { AIAdvisorClient } from '@/app/components/ai-advisor-client';
import { Card, CardContent } from '@/app/components/ui/card';

export default function AIAdvisorPage() {
  return (
    <div className="h-full w-full space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Advisor</h1>
        <p className="text-muted-foreground">
          Get intelligent recommendations for your NFT trading strategy
        </p>
      </div>
      
      <AIAdvisorClient />
    </div>
  );
}
