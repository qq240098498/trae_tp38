import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ChevronRight, Sparkles } from 'lucide-react';
import { usePurchaseStore } from '@/store/usePurchaseStore';
import { generateStockAdvice, calculatePriceStats } from '@/utils/priceCalculator';

export function GoodDealsBanner() {
  const records = usePurchaseStore(state => state.records);
  const getAllProductStats = usePurchaseStore(state => state.getAllProductStats);
  const allStats = getAllProductStats();

  const goodDeals = useMemo(() => {
    return allStats
      .map(stats => {
        const productRecords = records
          .filter(r => r.productName === stats.productName)
          .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        const currentStats = calculatePriceStats(productRecords);
        if (!currentStats) return null;
        const advice = generateStockAdvice(productRecords, currentStats);
        return { stats: currentStats, advice };
      })
      .filter((item): item is { stats: NonNullable<ReturnType<typeof calculatePriceStats>>; advice: ReturnType<typeof generateStockAdvice> } =>
        item !== null && item.advice.isGoodPrice
      )
      .sort((a, b) => b.advice.discountPercent - a.advice.discountPercent);
  }, [allStats, records]);

  if (goodDeals.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-500 via-emerald-500 to-teal-500 p-6 shadow-xl shadow-secondary-200">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-white/10 rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">今日好价推荐</h3>
              <p className="text-white/80 text-sm">发现 {goodDeals.length} 款商品价格低于均价10%以上</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {goodDeals.slice(0, 5).map(item => (
              <Link
                key={item.stats.productId}
                to={`/product/${item.stats.productId}`}
                className="group flex items-center gap-3 bg-white/15 backdrop-blur hover:bg-white/25 rounded-xl px-4 py-3 transition-all"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-secondary-600" />
                </div>
                <div>
                  <p className="font-semibold text-white">{item.stats.productName}</p>
                  <p className="text-xs text-white/80">
                    低于均价 {item.advice.discountPercent}% · 建议囤 {item.advice.suggestedQuantity}{item.advice.suggestedUnit}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
            {goodDeals.length > 5 && (
              <div className="flex items-center text-white/80 text-sm px-3">
                还有 {goodDeals.length - 5} 款好价商品...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
