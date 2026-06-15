import { useState } from 'react';
import { Bell, BellOff, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePurchaseStore } from '@/store/usePurchaseStore';
import { AlertThreshold, PriceStats } from '@/types';

interface AlertThresholdManagerProps {
  productName?: string;
  stats?: PriceStats;
  compact?: boolean;
}

export function AlertThresholdManager({ productName, stats, compact = false }: AlertThresholdManagerProps) {
  const alertThresholds = usePurchaseStore(state => state.getAlertThresholds());
  const addAlertThreshold = usePurchaseStore(state => state.addAlertThreshold);
  const removeAlertThreshold = usePurchaseStore(state => state.removeAlertThreshold);
  const toggleAlertThreshold = usePurchaseStore(state => state.toggleAlertThreshold);
  const products = usePurchaseStore(state => state.products);
  const getProductStats = usePurchaseStore(state => state.getProductStats);

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(productName || '');
  const [thresholdPrice, setThresholdPrice] = useState('');
  const [expanded, setExpanded] = useState(!compact);

  const productNames = products.map(p => p.name);
  const displayThresholds = productName
    ? alertThresholds.filter(t => t.productName === productName)
    : alertThresholds;

  const handleAddThreshold = () => {
    if (!selectedProduct || !thresholdPrice) return;

    const productStats = stats || getProductStats(selectedProduct);
    const standardUnitLabel = productStats?.standardUnitLabel || '元/单位';

    addAlertThreshold(selectedProduct, parseFloat(thresholdPrice), standardUnitLabel);
    setThresholdPrice('');
    setShowForm(false);
  };

  const quickFillPrice = () => {
    if (productName && stats) {
      setThresholdPrice(stats.minPrice.toFixed(2));
    } else if (selectedProduct) {
      const productStats = getProductStats(selectedProduct);
      if (productStats) {
        setThresholdPrice(productStats.minPrice.toFixed(2));
      }
    }
  };

  if (compact) {
    return (
      <div className="card">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-warmGray-800">价格提醒</h3>
              <p className="text-sm text-warmGray-500">
                {displayThresholds.length > 0
                  ? `已设置 ${displayThresholds.length} 条提醒`
                  : '设置低价提醒，不错过好价'}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-warmGray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warmGray-400" />
          )}
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-warmGray-100">
            <ThresholdList
              thresholds={displayThresholds}
              onToggle={toggleAlertThreshold}
              onRemove={removeAlertThreshold}
            />

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 w-full btn-outline flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {productName ? '设置价格警戒线' : '添加价格提醒'}
              </button>
            ) : (
              <ThresholdForm
                productName={productName}
                productNames={productNames}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                thresholdPrice={thresholdPrice}
                setThresholdPrice={setThresholdPrice}
                onQuickFill={quickFillPrice}
                onSubmit={handleAddThreshold}
                onCancel={() => setShowForm(false)}
                stats={stats}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-warmGray-800">价格警戒线</h3>
          <p className="text-sm text-warmGray-500">设置目标价格，降价时及时提醒</p>
        </div>
      </div>

      <ThresholdList
        thresholds={displayThresholds}
        onToggle={toggleAlertThreshold}
        onRemove={removeAlertThreshold}
      />

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {productName ? '设置价格警戒线' : '添加价格提醒'}
        </button>
      ) : (
        <ThresholdForm
          productName={productName}
          productNames={productNames}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          thresholdPrice={thresholdPrice}
          setThresholdPrice={setThresholdPrice}
          onQuickFill={quickFillPrice}
          onSubmit={handleAddThreshold}
          onCancel={() => setShowForm(false)}
          stats={stats}
        />
      )}
    </div>
  );
}

function ThresholdList({
  thresholds,
  onToggle,
  onRemove,
}: {
  thresholds: AlertThreshold[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (thresholds.length === 0) {
    return (
      <div className="text-center py-6 text-warmGray-400">
        <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>暂未设置价格提醒</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {thresholds.map(threshold => (
        <div
          key={threshold.id}
          className={`p-4 rounded-xl border transition-all ${
            threshold.enabled
              ? 'bg-rose-50 border-rose-200'
              : 'bg-warmGray-50 border-warmGray-200 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-warmGray-800">{threshold.productName}</span>
                <span className={`badge ${threshold.enabled ? 'badge-success' : 'badge-muted'}`}>
                  {threshold.enabled ? '已开启' : '已关闭'}
                </span>
              </div>
              <p className="text-rose-600 font-bold">
                低于 ¥{threshold.thresholdPrice.toFixed(2)} {threshold.standardUnitLabel} 时提醒
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle(threshold.id)}
                className={`p-2 rounded-lg transition-colors ${
                  threshold.enabled
                    ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                    : 'bg-warmGray-200 text-warmGray-500 hover:bg-warmGray-300'
                }`}
                title={threshold.enabled ? '关闭提醒' : '开启提醒'}
              >
                {threshold.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onRemove(threshold.id)}
                className="p-2 rounded-lg bg-warmGray-100 text-warmGray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ThresholdForm({
  productName,
  productNames,
  selectedProduct,
  setSelectedProduct,
  thresholdPrice,
  setThresholdPrice,
  onQuickFill,
  onSubmit,
  onCancel,
  stats,
}: {
  productName?: string;
  productNames: string[];
  selectedProduct: string;
  setSelectedProduct: (v: string) => void;
  thresholdPrice: string;
  setThresholdPrice: (v: string) => void;
  onQuickFill: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  stats?: PriceStats;
}) {
  return (
    <div className="mt-4 p-4 bg-warmGray-50 rounded-xl">
      <h4 className="font-semibold text-warmGray-800 mb-4">
        {productName ? `为「${productName}」设置警戒线` : '设置价格提醒'}
      </h4>

      {!productName && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-warmGray-700 mb-2">
            选择商品
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="input"
          >
            <option value="">请选择商品</option>
            {productNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-warmGray-700 mb-2">
          目标价格 ({stats?.standardUnitLabel || '元/单位'})
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={thresholdPrice}
            onChange={(e) => setThresholdPrice(e.target.value)}
            placeholder="例如：5.00"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={onQuickFill}
            className="btn-outline text-sm whitespace-nowrap"
          >
            参考历史最低价
          </button>
        </div>
        {stats && (
          <p className="text-xs text-warmGray-500 mt-2">
            历史最低 ¥{stats.minPrice.toFixed(2)} · 均价 ¥{stats.avgPrice.toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn-outline flex-1"
        >
          取消
        </button>
        <button
          onClick={onSubmit}
          disabled={!thresholdPrice || (!productName && !selectedProduct)}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存设置
        </button>
      </div>
    </div>
  );
}
