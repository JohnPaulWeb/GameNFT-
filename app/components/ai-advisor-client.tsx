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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { useToast } from '@/app/hooks/use-toast';
import { Bot, CheckCircle, Flame, Loader2, MinusCircle, TrendingUp, Sparkles, Wallet } from 'lucide-react';

const formSchema = z.object({
  marketData: z.string().min(10, 'Please provide more detailed market data.'),
  userInventory: z.string().min(5, 'Please provide your user inventory.'),
  suiAccountBalance: z.number().positive('SUI balance must be a positive number.'),
});

const defaultValues = {
  marketData:
    'Top sellers this week: Dragonfire Helm (88 SUI), Archmage Staff (120 SUI). Low volume items: Elixir of Vigor. Player demand for rare cosmetic items is high.',
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

  const fieldClass =
    'rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 ' +
    'focus:border-cyan-400/60 focus:ring-0 focus:bg-white/8 transition-all duration-200 font-medium';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* ── Input Panel ── */}
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(16,240,252,0.06), transparent 60%)' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="relative p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/25 to-indigo-500/15 border border-cyan-400/40 shadow-lg shadow-cyan-400/15">
              <Bot className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white tracking-tight">Market Analysis Input</h2>
              <p className="text-sm text-white/50 mt-0.5">Provide data for AI analysis</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField control={form.control} name="marketData" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white/80">
                    Market Data <span className="text-cyan-400 text-xs font-normal">required</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Top sellers, price trends, player demand..." {...field}
                      rows={5} className={`resize-none ${fieldClass}`} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="userInventory" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white/80">
                    Your Inventory <span className="text-cyan-400 text-xs font-normal">required</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 2x Health Potion, 1x Magic Sword" {...field}
                      rows={3} className={`resize-none ${fieldClass}`} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="suiAccountBalance" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white/80">
                    SUI Balance{' '}
                    <span className="text-cyan-400 text-xs font-normal">
                      {account ? '(auto-filled)' : 'required'}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="number" placeholder="e.g., 150.75" {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className={`h-11 pr-16 ${fieldClass}`} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                        <Wallet className="h-3.5 w-3.5 text-cyan-400/60" />
                        <span className="text-xs font-bold text-cyan-400/60">SUI</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <Button type="submit" disabled={isLoading}
                className="w-full font-bold text-base h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing Market...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Get AI Recommendation</>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* ── Result Panel ── */}
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl transition-all duration-300 hover:border-indigo-400/30">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.06), transparent 60%)' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

        <div className="relative p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400/25 to-cyan-500/15 border border-indigo-400/40 shadow-lg shadow-indigo-400/15">
              <TrendingUp className="h-6 w-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white tracking-tight">AI Recommendation</h2>
              <p className="text-sm text-white/50 mt-0.5">Smart insights from your data</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

          <div className="flex-1 flex items-center justify-center min-h-[340px]">

            {isLoading && (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
                  <div className="absolute inset-[6px] rounded-full border-t-2 border-indigo-400/60 animate-spin"
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  <Bot className="absolute inset-0 m-auto h-7 w-7 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Analyzing market data</p>
                  <p className="text-xs text-white/40 mt-1">This may take a few seconds...</p>
                </div>
              </div>
            )}

            {!isLoading && !result && (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 border border-indigo-400/20">
                  <Bot className="h-10 w-10 text-indigo-300/60" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white/70">Awaiting Analysis</p>
                  <p className="text-sm text-white/35 max-w-[260px] mx-auto mt-1 leading-relaxed">
                    Submit your market data to receive AI-powered trading recommendations
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="w-full space-y-4 animate-fade-up">
                {/* Suggested item */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Suggested Item</p>
                      <p className="text-2xl font-bold font-display text-white">{result.suggestedItem}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 border ${
                      result.isProfitable
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                        : 'bg-red-500/15 border-red-400/40 text-red-300'
                    }`}>
                      {result.isProfitable
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <MinusCircle className="h-3.5 w-3.5" />}
                      {result.isProfitable ? 'Profitable' : 'Not Profitable'}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-cyan-300" />
                      <p className="text-xs font-semibold text-cyan-300/80 uppercase tracking-wider">Est. Profit</p>
                    </div>
                    <p className="text-2xl font-bold font-display text-white">
                      {result.estimatedProfit}
                      <span className="text-sm font-semibold text-cyan-300/70 ml-1">SUI</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-4 w-4 text-indigo-300" />
                      <p className="text-xs font-semibold text-indigo-300/80 uppercase tracking-wider">Action</p>
                    </div>
                    <p className="text-2xl font-bold font-display text-white">Mint & Sell</p>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">AI Reasoning</p>
                  <p className="text-sm leading-relaxed text-white/70">{result.reasoning}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
