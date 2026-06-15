import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, MapPin, Calendar, ShoppingBag, AlertTriangle } from 'lucide-react';
import { usePurchaseStore } from '@/store/usePurchaseStore';
import { PriceChart } from '@/components/PriceChart';
import { PurchaseHistory } from '@/components/PurchaseHistory';
import { PurchaseForm } from '@/components/PurchaseForm';
import { StockAdviceCard } from '@/components/StockAdviceCard';
import { AlertThresholdManager } from '@/components/AlertThresholdManager';
import { analyzePriceCycle, generateStockAdvice } from '@/utils/priceCalculator';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const records = usePurchaseStore(state => state.records);
  const alertThresholds = usePurchaseStore(state => state.alertThresholds);
  const deleteRecord = usePurchaseStore(state => state.deleteRecord);
  const products = usePurchaseStore(state => state.products);
  const calculatePriceStatsFn = usePurchaseStore(state => state.getProductStats);

  const product = products.find(p => p.id === id);
  const productRecords = product
    ? records
        .filter(r => r.productName === product.name)
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    : [];
  const stats = product ? calculatePriceStatsFn(product.name) : null;

  const stockAdvice = stats ? generateStockAdvice(productRecords, stats) : null;
  const priceCycle = product ? analyzePriceCycle(productRecords) : null;
  const alertThreshold = product ? alertThresholds.find(t => t.productName === product.name) : undefined;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-16">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-warmGray-800 mb-2">未找到该商品</h2>
          <p className="text-warmGray-500 mb-6">该商品可能已被删除或不存在</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const handleDeleteRecord = (recordId: string) => {
    setShowDeleteConfirm(recordId);
  };

  const confirmDelete = (recordId: string) => {
    deleteRecord(recordId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-warmGray-600 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回商品列表
      </Link>

      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-warmGray-800 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-warmGray-500">
              <span className="badge badge-info">{product.category}</span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                {stats?.purchaseCount || 0} 次采购
              </span>
              <span className="flex items-center gap-1">
                累计支出 ¥{stats?.totalSpent.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 stat-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-6 h-6" />
                <span className="text-white/80 font-medium">历史最低价</span>
              </div>
              <p className="text-3xl font-bold mb-1">¥{stats.minPrice.toFixed(2)}</p>
              <p className="text-white/70 text-sm">{stats.standardUnitLabel}</p>
              <div className="mt-2 pt-2 border-t border-white/20 text-sm text-white/70">
                <MapPin className="w-4 h-4 inline mr-1" />
                {stats.minPriceLocation} · {stats.minPriceDate}
              </div>
            </div>

            <div className="bg-gradient-to-br from-warmGray-500 to-warmGray-600 stat-card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-white/80 font-medium">平均价格</span>
              </div>
              <p className="text-3xl font-bold mb-1">¥{stats.avgPrice.toFixed(2)}</p>
              <p className="text-white/70 text-sm">{stats.standardUnitLabel}</p>
              <div className="mt-2 pt-2 border-t border-white/20 text-sm text-white/70">
                <Calendar className="w-4 h-4 inline mr-1" />
                最新：¥{stats.latestPrice.toFixed(2)} · {stats.latestPriceDate}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-500 to-primary-600 stat-card animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="w-6 h-6" />
                <span className="text-white/80 font-medium">省钱建议</span>
              </div>
              <p className="text-xl font-bold mb-1">
                {stats.latestPrice > stats.minPrice 
                  ? `可省 ¥${(stats.latestPrice - stats.minPrice).toFixed(2)}`
                  : '当前已是最低价'}
              </p>
              <p className="text-white/70 text-sm">
                {stats.latestPrice > stats.minPrice
                  ? `相比最新价，每单位便宜 ${((stats.latestPrice - stats.minPrice) / stats.latestPrice * 100).toFixed(1)}%`
                  : '继续保持，你买得很划算！'}
              </p>
              <div className="mt-2 pt-2 border-t border-white/20 text-sm text-white/70">
                建议在 {stats.minPriceLocation} 购买
              </div>
            </div>
          </div>
        )}

        {stockAdvice && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <StockAdviceCard
              advice={stockAdvice}
              cyclePattern={priceCycle}
              alertThreshold={alertThreshold}
            />
          </div>
        )}

        {stats && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <AlertThresholdManager
              productName={product?.name}
              stats={stats}
              compact
            />
          </div>
        )}

        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '550ms' }}>
          <PriceChart records={productRecords} stats={stats} />
        </div>

        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <PurchaseForm />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '650ms' }}>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-bounce-in">
                <h3 className="text-lg font-bold text-warmGray-800 mb-2">确认删除</h3>
                <p className="text-warmGray-600 mb-6">确定要删除这条采购记录吗？此操作无法撤销。</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="btn-outline"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => confirmDelete(showDeleteConfirm)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </div>
          )}

          <PurchaseHistory records={productRecords} onDelete={handleDeleteRecord} />
        </div>
      </div>
    </div>
  );
}
