import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, Minus, ArrowRight, MapPin } from 'lucide-react';
import { PriceStats } from '@/types';
import { getDaysAgo } from '@/utils/priceCalculator';

interface ProductCardProps {
  stats: PriceStats;
  delay?: number;
}

export function ProductCard({ stats, delay = 0 }: ProductCardProps) {
  const priceDiff = stats.latestPrice - stats.minPrice;
  const priceDiffPercent = stats.minPrice > 0 
    ? Math.round((priceDiff / stats.minPrice) * 100) 
    : 0;

  return (
    <Link
      to={`/product/${stats.productId}`}
      className="card group animate-fade-in-up cursor-pointer block"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-warmGray-800 group-hover:text-primary-600 transition-colors">
            {stats.productName}
          </h3>
          <div className="flex items-center gap-1 text-warmGray-500 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>最低价：{stats.minPriceLocation}</span>
          </div>
        </div>
        <div className="p-2 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
          <ArrowRight className="w-5 h-5 text-primary-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-secondary-50 rounded-xl p-3 text-center">
          <p className="text-xs text-secondary-600 mb-1">历史最低</p>
          <p className="text-xl font-bold text-secondary-600">
            ¥{stats.minPrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-warmGray-100 rounded-xl p-3 text-center">
          <p className="text-xs text-warmGray-600 mb-1">平均价</p>
          <p className="text-xl font-bold text-warmGray-700">
            ¥{stats.avgPrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-primary-50 rounded-xl p-3 text-center">
          <p className="text-xs text-primary-600 mb-1">最新价</p>
          <p className="text-xl font-bold text-primary-600">
            ¥{stats.latestPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          {priceDiff < 0 ? (
            <div className="flex items-center gap-1 text-secondary-600">
              <TrendingDown className="w-4 h-4" />
              <span className="font-medium">新低</span>
            </div>
          ) : priceDiff > 0 ? (
            <div className="flex items-center gap-1 text-amber-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+{priceDiffPercent}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-warmGray-500">
              <Minus className="w-4 h-4" />
              <span className="font-medium">持平</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-warmGray-500">
          <span>{stats.standardUnitLabel}</span>
          <span className="text-warmGray-300">|</span>
          <span>{stats.purchaseCount}次采购</span>
          <span className="text-warmGray-300">|</span>
          <span>{getDaysAgo(stats.latestPriceDate)}</span>
        </div>
      </div>
    </Link>
  );
}
