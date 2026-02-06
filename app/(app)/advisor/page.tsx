import { AIAdvisorClient } from '@/app/components/ai-advisor-client';
import { Card, CardContent } from '@/app/components/ui/card';

export default function AIAdvisorPage() {
  return (
    <div className="space-y-8">
      <AIAdvisorClient />
    </div>
  );
}
