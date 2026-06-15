import { Package, TrendingDown, Calendar, AlertTriangle, ShoppingBag } from 'lucide-react';
import { StockAdvice, PriceCyclePattern, AlertThreshold } from '@/types';
import { checkPriceAlert } from '@/utils/priceCalculator';

interface StockAdviceCardProps {
  advice: StockAdvice;
  cyclePattern?: PriceCyclePattern | null;
  alertThreshold?: AlertThreshold;
}

export function StockAdviceCard({ advice, cyclePattern, alertThreshold }: StockAdviceCardProps) {
  const priceAlert = alertThreshold && alertThreshold.enabled
    ? checkPriceAlert(advice.discountPercent > 0 ? 0 : 0, alertThreshold.thresholdPrice)
    : null;

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-warmGray-800">囤货建议</h3>
          <p className="text-sm text-warmGray-500">智能分析价格波动，帮你省钱</p>
        </div>
      </div>

      {alertThreshold && alertThreshold.enabled && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-700">
                已设置价格警戒线：¥{alertThreshold.thresholdPrice.toFixed(2)} {alertThreshold.standardUnitLabel}
              </p>
              <p className="text-sm text-rose-600 mt-1">
                当价格低于此值时会提醒您
              </p>
            </div>
          </div>
        </div>
      )}

      {advice.isGoodPrice ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-secondary-50 to-emerald-50 border border-secondary-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-secondary-700 text-lg">🎉 好价可囤</p>
              <p className="text-sm text-secondary-600">
                当前价格比历史均价低 {advice.discountPercent}%
              </p>
            </div>
          </div>
        </div>
      ) : advice.discountPercent >= 0 ? (
        <div className="mb-4 p-4 bg-warmGray-50 border border-warmGray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warmGray-400 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-warmGray-700">价格平稳</p>
              <p className="text-sm text-warmGray-500">
                接近历史均价，优惠不明显
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-amber-700">价格偏高</p>
              <p className="text-sm text-amber-600">
                比均价高出 {Math.abs(advice.discountPercent)}%，建议观望
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl">
          <p className="text-sm text-primary-600 mb-1">囤货量建议</p>
          <p className="text-2xl font-bold text-primary-700">
            {advice.suggestedQuantity > 0 ? (
              <>
                {advice.suggestedQuantity} <span className="text-base font-medium">{advice.suggestedUnit}</span>
              </>
            ) : (
              <span className="text-lg">暂不建议囤货</span>
            )}
          </p>
        </div>

        {cyclePattern && (
          <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
            <p className="text-sm text-violet-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              价格规律
            </p>
            <p className="text-lg font-bold text-violet-700">{cyclePattern.cycleDescription}</p>
            {cyclePattern.nextExpectedLowDate && (
              <p className="text-xs text-violet-500 mt-1">
                下次预计低价：{cyclePattern.nextExpectedLowDate}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-warmGray-50 rounded-xl">
        <p className="text-sm text-warmGray-600 flex items-start gap-2">
          <span className="text-warmGray-400">💡</span>
          <span>{advice.reason}</span>
        </p>
        {cyclePattern && cyclePattern.lowPricePattern && (
          <p className="text-sm text-warmGray-500 mt-2 flex items-start gap-2">
            <span className="text-warmGray-400">📍</span>
            <span>{cyclePattern.lowPricePattern}</span>
          </p>
        )}
      </div>
    </div>
  );
}
