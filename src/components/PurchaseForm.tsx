import { useState, useMemo } from 'react';
import { Plus, X, Calculator, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { PurchaseFormData, CATEGORIES, UNIT_TYPES, COMMON_LOCATIONS } from '@/types';
import { usePurchaseStore } from '@/store/usePurchaseStore';
import { calculateStandardPrice, comparePrice, getTodayDateString, suggestUnitForCategory } from '@/utils/priceCalculator';

interface PurchaseFormProps {
  onSuccess?: () => void;
}

const initialFormData: PurchaseFormData = {
  productName: '',
  category: '食品',
  purchaseDate: getTodayDateString(),
  location: '',
  brand: '',
  specification: '',
  quantity: 0,
  unit: '个',
  unitPrice: 0,
  totalPrice: 0,
  notes: '',
};

export function PurchaseForm({ onSuccess }: PurchaseFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<PurchaseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addRecord = usePurchaseStore(state => state.addRecord);
  const getRecordsByProduct = usePurchaseStore(state => state.getRecordsByProduct);

  const existingRecords = useMemo(() => {
    if (!formData.productName.trim()) return [];
    return getRecordsByProduct(formData.productName.trim());
  }, [formData.productName, getRecordsByProduct]);

  const calculatedPrice = useMemo(() => {
    if (formData.quantity <= 0 || formData.totalPrice <= 0) return null;
    return calculateStandardPrice(formData.totalPrice, formData.quantity, formData.unit);
  }, [formData.totalPrice, formData.quantity, formData.unit]);

  const priceComparison = useMemo(() => {
    if (!calculatedPrice || existingRecords.length === 0) return null;
    return comparePrice(calculatedPrice.price, existingRecords);
  }, [calculatedPrice, existingRecords]);

  const handleInputChange = (field: keyof PurchaseFormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'category' && typeof value === 'string') {
        updated.unit = suggestUnitForCategory(value);
      }
      
      if (field === 'unitPrice' && typeof value === 'number' && updated.quantity > 0) {
        updated.totalPrice = Number((value * updated.quantity).toFixed(2));
      }
      
      if (field === 'totalPrice' && typeof value === 'number' && updated.quantity > 0) {
        updated.unitPrice = Number((value / updated.quantity).toFixed(2));
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || !formData.location.trim() || 
        formData.quantity <= 0 || formData.totalPrice <= 0) {
      return;
    }

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addRecord(formData);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    setFormData({
      ...initialFormData,
      category: formData.category,
      location: formData.location,
      purchaseDate: getTodayDateString(),
    });
    
    setIsSubmitting(false);
    onSuccess?.();
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className="mb-8 animate-fade-in-up">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full card flex items-center justify-center gap-3 py-6
                     border-2 border-dashed border-primary-300 hover:border-primary-500
                     text-primary-600 hover:text-primary-700 transition-all duration-300"
        >
          <Plus className="w-6 h-6" />
          <span className="text-lg font-semibold">添加采购记录</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-fade-in-up">
      <form onSubmit={handleSubmit} className="card relative">
        {showSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 
                          flex items-center justify-center rounded-2xl animate-bounce-in">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-secondary-500 mx-auto mb-2" />
              <p className="text-xl font-semibold text-warmGray-800">记录已保存！</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-warmGray-800 flex items-center gap-2">
            <Plus className="w-6 h-6 text-primary-500" />
            添加采购记录
          </h2>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-warmGray-400 hover:text-warmGray-600 hover:bg-warmGray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              商品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              placeholder="如：牛奶、大米、洗衣液"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="input-field"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              购买日期
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              购买地点 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="input-field"
              required
            >
              <option value="">请选择或输入</option>
              {COMMON_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="或手动输入地点"
              className="input-field mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              品牌
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="如：伊利、金龙鱼"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              规格
            </label>
            <input
              type="text"
              value={formData.specification}
              onChange={(e) => handleInputChange('specification', e.target.value)}
              placeholder="如：250ml*12盒"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="0.01"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              单位
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="input-field"
            >
              {UNIT_TYPES.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              单价 (元)
            </label>
            <input
              type="number"
              value={formData.unitPrice || ''}
              onChange={(e) => handleInputChange('unitPrice', Number(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              总价 (元) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.totalPrice || ''}
              onChange={(e) => handleInputChange('totalPrice', Number(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input-field"
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-warmGray-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="添加备注信息..."
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>

        {calculatedPrice && (
          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-primary-800">自动计算结果</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-warmGray-600 text-sm">标准单价：</span>
                <span className="text-2xl font-bold text-primary-600">
                  ¥{calculatedPrice.price.toFixed(2)}
                </span>
                <span className="text-warmGray-600 ml-1">{calculatedPrice.label}</span>
              </div>
            </div>
          </div>
        )}

        {priceComparison && (
          <div className={`mt-4 p-4 rounded-xl border ${
            priceComparison.isNewLow 
              ? 'bg-secondary-50 border-secondary-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              {priceComparison.isNewLow ? (
                <TrendingDown className="w-6 h-6 text-secondary-600 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                {priceComparison.isNewLow ? (
                  <>
                    <p className="font-semibold text-secondary-800 animate-pulse-glow">
                      🎉 新低价！比历史最低价还便宜
                    </p>
                    <p className="text-secondary-700 text-sm mt-1">
                      历史最低价：¥{priceComparison.minPrice.toFixed(2)} ({priceComparison.minPriceDate} {priceComparison.minPriceLocation})
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      价格高于历史最低价
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      当前价格：¥{priceComparison.currentPrice.toFixed(2)}，
                      历史最低价：¥{priceComparison.minPrice.toFixed(2)} 
                      ({priceComparison.minPriceDate} {priceComparison.minPriceLocation})
                    </p>
                    <p className="text-amber-600 text-sm mt-1">
                      差价：¥{priceComparison.difference.toFixed(2)} ({priceComparison.differencePercent}%)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="btn-outline"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.productName.trim() || !formData.location.trim() || formData.quantity <= 0 || formData.totalPrice <= 0}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                保存记录
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
