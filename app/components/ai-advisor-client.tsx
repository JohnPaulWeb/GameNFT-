'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  aiPoweredItemSuggestion,
  type AIPoweredItemSuggestionOutput,
} from '@/app/ai/flows/ai-powered-item-suggestion';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { useToast } from '@/app/hooks/use-toast';
import { Bot, CheckCircle, Flame, Loader2, MinusCircle, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';

const formSchema = z.object({
  marketData: z.string().min(10, 'Please provide more detailed market data.'),
  userInventory: z.string().min(5, 'Please provide your user inventory.'),
  suiAccountBalance: z.number().positive('SUI balance must be a positive number.'),
});

const defaultValues = {
  marketData: 'Top sellers this week: Dragonfire Helm (88 SUI), Archmage Staff (120 SUI). Low volume items: Elixir of Vigor. Player demand for rare cosmetic items is high.',
  userInventory: '1x Sword of a Thousand Truths, 1x Aegis of the Immortal, 3x Health Potion',
  suiAccountBalance: 0,
};

export function AIAdvisorClient() {
  const [result, setResult] = useState<AIPoweredItemSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const { data: coinBalance } = useQuery({
    queryKey: ['coinBalance', account?.address],
    queryFn: () => {
      if (!account?.address) return null;
      return suiClient.getBalance({ owner: account.address });
    },
    enabled: !!account?.address,
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (coinBalance) {
      const balanceInSui = Number(coinBalance.totalBalance) / 1_000_000_000;
      form.setValue('suiAccountBalance', balanceInSui);
    }
  }, [coinBalance, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const suggestion = await aiPoweredItemSuggestion(values);
      setResult(suggestion);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get suggestion from AI.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold">Market Analysis Input</CardTitle>
          <CardDescription>Provide market and inventory data for AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="marketData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Market Data *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Top sellers, price trends, player demand..." 
                        {...field} 
                        rows={5}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userInventory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Your Inventory *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., 2x Health Potion, 1x Magic Sword" 
                        {...field}
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="suiAccountBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">SUI Balance *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 150.75" 
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full font-semibold shadow-md" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Get AI Recommendation
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold">AI Recommendation</CardTitle>
          <CardDescription>Smart insights based on your market data</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          {isLoading && (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Analyzing market data...</p>
            </div>
          )}
          
          {!isLoading && !result && (
            <div className="text-center text-muted-foreground">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Bot className="h-10 w-10" />
              </div>
              <p className="mt-4 font-medium">Awaiting Analysis</p>
              <p className="mt-2 text-sm">Submit your data to receive AI-powered recommendations</p>
            </div>
          )}
          
          {result && (
            <div className="w-full space-y-4">
              <div className="rounded-lg bg-card-foreground/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Suggested Item</p>
                    <p className="mt-1 text-2xl font-bold">{result.suggestedItem}</p>
                  </div>
                  <Badge 
                    variant={result.isProfitable ? 'default' : 'destructive'} 
                    className={result.isProfitable ? 'bg-green-600' : ''}
                  >
                    {result.isProfitable ? (
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <MinusCircle className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {result.isProfitable ? 'Profitable' : 'Not Profitable'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-card-foreground/5 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-sm font-medium">Est. Profit</p>
                  </div>
                  <p className="mt-2 text-xl font-bold">{result.estimatedProfit} SUI</p>
                </div>
                <div className="rounded-lg bg-card-foreground/5 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    <p className="text-sm font-medium">Action</p>
                  </div>
                  <p className="mt-2 text-xl font-bold">Mint & Sell</p>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="font-semibold">AI Reasoning</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.reasoning}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
