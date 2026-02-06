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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-bold">Input Data</CardTitle>
          <CardDescription>Provide data for the AI to analyze.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="marketData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Data</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Top sellers, player demand..." {...field} rows={4}/>
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
                    <FormLabel>Your Inventory</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 2x Health Potion, 1x Magic Sword" {...field} />
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
                    <FormLabel>SUI Balance</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 150.75" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Get Suggestion
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-bold">AI Suggestion</CardTitle>
          <CardDescription>The AI's recommendation based on your data.</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[300px] items-center justify-center">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          
          {!isLoading && !result && (
            <div className="text-center text-muted-foreground">
              <Bot className="mx-auto h-12 w-12" />
              <p className="mt-2">Your suggestion will appear here.</p>
            </div>
          )}
          
          {result && (
            <div className="w-full space-y-4 animate-in fade-in-0">
                <div className="p-4 bg-card-foreground/5 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">Suggested Item</p>
                            <p className="text-2xl font-bold font-headline">{result.suggestedItem}</p>
                        </div>
                        <Badge variant={result.isProfitable ? 'default' : 'destructive'} className={result.isProfitable ? 'bg-green-600' : ''}>
                            {result.isProfitable ? <CheckCircle className="mr-2 size-4" /> : <MinusCircle className="mr-2 size-4" />}
                            {result.isProfitable ? 'Profitable' : 'Not Profitable'}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-card-foreground/5 rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="size-4"/>Est. Profit</p>
                    <p className="text-xl font-semibold">{result.estimatedProfit} SUI</p>
                  </div>
                   <div className="p-3 bg-card-foreground/5 rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Flame className="size-4"/>Recommended Action</p>
                    <p className="text-xl font-semibold">Mint & Sell</p>
                  </div>
                </div>

                <div>
                    <p className="font-medium">Reasoning</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.reasoning}</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
