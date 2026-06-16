import { useState, useMemo } from 'react';
import { Plus, X, ShoppingCart, Trash2, CheckCircle2, Circle, Edit3, ChevronDown, ChevronUp, Store, Tag, TrendingDown, Info } from 'lucide-react';
import { usePurchaseStore } from '@/store/usePurchaseStore';
import { CATEGORIES, UNIT_TYPES, COMMON_LOCATIONS, CATEGORY_ICONS, ShoppingListItemForm } from '@/types';
import { suggestUnitForCategory, getLatestPriceAnyLocation } from '@/utils/priceCalculator';

const initialItemForm: ShoppingListItemForm = {
  productName: '',
  quantity: 1,
  unit: '个',
  category: '食品',
};

export function ShoppingList() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [itemForm, setItemForm] = useState<ShoppingListItemForm>(initialItemForm);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedEstimate, setExpandedEstimate] = useState<string | null>(null);

  const shoppingLists = usePurchaseStore(state => state.shoppingLists);
  const activeShoppingListId = usePurchaseStore(state => state.activeShoppingListId);
  const records = usePurchaseStore(state => state.records);
  const createShoppingList = usePurchaseStore(state => state.createShoppingList);
  const deleteShoppingList = usePurchaseStore(state => state.deleteShoppingList);
  const setActiveShoppingList = usePurchaseStore(state => state.setActiveShoppingList);
  const addShoppingListItem = usePurchaseStore(state => state.addShoppingListItem);
  const removeShoppingListItem = usePurchaseStore(state => state.removeShoppingListItem);
  const updateShoppingListItem = usePurchaseStore(state => state.updateShoppingListItem);
  const setItemManualPrice = usePurchaseStore(state => state.setItemManualPrice);
  const toggleShoppingListItem = usePurchaseStore(state => state.toggleShoppingListItem);
  const getShoppingListPriceEstimates = usePurchaseStore(state => state.getShoppingListPriceEstimates);
  const getActiveShoppingList = usePurchaseStore(state => state.getActiveShoppingList);
  const searchProducts = usePurchaseStore(state => state.searchProducts);

  const activeList = getActiveShoppingList();
  const priceEstimates = useMemo(() => {
    if (!activeShoppingListId) return [];
    return getShoppingListPriceEstimates(activeShoppingListId);
  }, [activeShoppingListId, getShoppingListPriceEstimates]);

  const bestDeal = priceEstimates[0];

  const productSuggestions = useMemo(() => {
    if (!itemForm.productName.trim()) return [];
    return searchProducts(itemForm.productName).slice(0, 5);
  }, [itemForm.productName, searchProducts]);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createShoppingList(newListName.trim());
    setNewListName('');
    setShowNewListForm(false);
  };

  const handleAddItem = () => {
    if (!activeShoppingListId || !itemForm.productName.trim() || itemForm.quantity <= 0) return;
    addShoppingListItem(activeShoppingListId, itemForm);
    setItemForm({ ...initialItemForm, category: itemForm.category });
  };

  const handleItemFormChange = (field: keyof ShoppingListItemForm, value: string | number) => {
    setItemForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'category' && typeof value === 'string') {
        updated.unit = suggestUnitForCategory(value);
      }
      return updated;
    });
  };

  const handleSelectSuggestion = (productName: string) => {
    const existingRecord = records.find(r => r.productName === productName);
    setItemForm(prev => ({
      ...prev,
      productName,
      category: existingRecord?.category || prev.category,
      unit: existingRecord?.unit || suggestUnitForCategory(existingRecord?.category || prev.category),
    }));
  };

  const getPriceSourceLabel = (source: 'history' | 'manual' | 'estimated', estimatedFrom?: string) => {
    switch (source) {
      case 'manual': return { label: '手动录入', color: 'text-secondary-600 bg-secondary-50' };
      case 'history': return { label: '历史价格', color: 'text-primary-600 bg-primary-50' };
      case 'estimated': return { label: `参考${estimatedFrom}`, color: 'text-amber-600 bg-amber-50' };
    }
  };

  if (!isExpanded) {
    return (
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full card flex items-center justify-center gap-3 py-6
                     border-2 border-dashed border-secondary-300 hover:border-secondary-500
                     text-secondary-600 hover:text-secondary-700 transition-all duration-300"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-lg font-semibold">购物清单比价</span>
          {activeList && activeList.items.length > 0 && (
            <span className="ml-2 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
              {activeList.items.length}件商品
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-warmGray-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-secondary-500" />
            购物清单比价
          </h2>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-2 text-warmGray-400 hover:text-warmGray-600 hover:bg-warmGray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {shoppingLists.map(list => (
              <div key={list.id} className="flex items-center">
                <button
                  onClick={() => setActiveShoppingList(list.id)}
                  className={`px-4 py-2 rounded-l-lg font-medium transition-all ${
                    activeShoppingListId === list.id
                      ? 'bg-secondary-500 text-white shadow-md'
                      : 'bg-warmGray-100 text-warmGray-600 hover:bg-warmGray-200'
                  }`}
                >
                  {list.name}
                  <span className="ml-2 text-sm opacity-80">({list.items.length})</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定删除清单"${list.name}"吗？`)) {
                      deleteShoppingList(list.id);
                    }
                  }}
                  className={`px-3 py-2 rounded-r-lg transition-all ${
                    activeShoppingListId === list.id
                      ? 'bg-secondary-600 text-white hover:bg-red-500'
                      : 'bg-warmGray-200 text-warmGray-500 hover:bg-red-100 hover:text-red-500'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {!showNewListForm ? (
              <button
                onClick={() => setShowNewListForm(true)}
                className="px-4 py-2 border-2 border-dashed border-warmGray-300 rounded-lg
                           text-warmGray-500 hover:border-secondary-400 hover:text-secondary-500
                           transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建清单
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="清单名称，如：周末采购"
                  className="input-field w-48"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                />
                <button
                  onClick={handleCreateList}
                  className="btn-primary px-4"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowNewListForm(false)}
                  className="btn-outline px-4"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {shoppingLists.length === 0 && !showNewListForm && (
            <div className="text-center py-8 text-warmGray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>还没有购物清单，点击上方"新建清单"开始创建</p>
            </div>
          )}
        </div>

        {activeList && (
          <>
            <div className="mb-6 p-4 bg-warmGray-50 rounded-xl">
              <h3 className="font-semibold text-warmGray-700 mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-500" />
                添加商品到清单
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2 relative">
                  <input
                    type="text"
                    value={itemForm.productName}
                    onChange={(e) => handleItemFormChange('productName', e.target.value)}
                    placeholder="商品名称，如：牛奶、大米"
                    className="input-field"
                  />
                  {productSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-warmGray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {productSuggestions.map(name => (
                        <button
                          key={name}
                          onClick={() => handleSelectSuggestion(name)}
                          className="w-full px-4 py-2 text-left hover:bg-warmGray-50 transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <select
                    value={itemForm.category}
                    onChange={(e) => handleItemFormChange('category', e.target.value)}
                    className="input-field"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]} {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={itemForm.quantity || ''}
                    onChange={(e) => handleItemFormChange('quantity', Number(e.target.value) || 0)}
                    placeholder="数量"
                    min="0"
                    step="0.01"
                    className="input-field flex-1"
                  />
                  <select
                    value={itemForm.unit}
                    onChange={(e) => handleItemFormChange('unit', e.target.value)}
                    className="input-field w-24"
                  >
                    {UNIT_TYPES.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddItem}
                  disabled={!itemForm.productName.trim() || itemForm.quantity <= 0}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  添加
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-warmGray-700 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-500" />
                商品清单
                <span className="text-sm font-normal text-warmGray-500">
                  ({activeList.items.filter(i => i.checked).length}/{activeList.items.length} 已购)
                </span>
              </h3>

              {activeList.items.length === 0 ? (
                <div className="text-center py-8 text-warmGray-400 border-2 border-dashed border-warmGray-200 rounded-xl">
                  <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>清单还是空的，添加一些商品吧</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeList.items.map(item => {
                    const latestPrice = getLatestPriceAnyLocation(records, item.productName);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          item.checked ? 'bg-green-50 opacity-60' : 'bg-white border border-warmGray-200 hover:shadow-md'
                        }`}
                      >
                        <button
                          onClick={() => toggleShoppingListItem(activeList.id, item.id)}
                          className="flex-shrink-0"
                        >
                          {item.checked ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-warmGray-300 hover:text-secondary-400 transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${item.checked ? 'line-through text-warmGray-400' : 'text-warmGray-800'}`}>
                            {CATEGORY_ICONS[item.category]} {item.productName}
                          </div>
                          <div className="text-sm text-warmGray-500">
                            {item.quantity} {item.unit}
                            {latestPrice && (
                              <span className="ml-2">
                                · 参考价 ¥{latestPrice.unitPrice}/{item.unit}
                              </span>
                            )}
                          </div>
                        </div>

                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={item.quantity || ''}
                              onChange={(e) => updateShoppingListItem(activeList.id, item.id, { quantity: Number(e.target.value) || 0 })}
                              className="input-field w-20 py-1 text-sm"
                              min="0"
                              step="0.01"
                            />
                            <select
                              value={item.unit}
                              onChange={(e) => updateShoppingListItem(activeList.id, item.id, { unit: e.target.value as any })}
                              className="input-field w-20 py-1 text-sm"
                            >
                              {UNIT_TYPES.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingItemId(item.id)}
                              className="p-2 text-warmGray-400 hover:text-warmGray-600 hover:bg-warmGray-100 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeShoppingListItem(activeList.id, item.id)}
                              className="p-2 text-warmGray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {activeList.items.length > 0 && priceEstimates.length > 0 && (
              <div>
                <h3 className="font-semibold text-warmGray-700 mb-3 flex items-center gap-2">
                  <Store className="w-5 h-5 text-secondary-500" />
                  各渠道比价
                  {bestDeal && (
                    <span className="ml-2 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-normal">
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                      最划算: {bestDeal.location} ¥{bestDeal.totalPrice}
                    </span>
                  )}
                </h3>

                <div className="grid gap-4">
                  {priceEstimates.map((estimate, index) => (
                    <div
                      key={estimate.location}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        index === 0
                          ? 'border-secondary-400 bg-secondary-50 shadow-lg shadow-secondary-100'
                          : 'border-warmGray-200 bg-white'
                      }`}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedEstimate(expandedEstimate === estimate.location ? null : estimate.location)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                            index === 0 ? 'bg-secondary-500 text-white' : 'bg-warmGray-100 text-warmGray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-warmGray-800 flex items-center gap-2">
                              {estimate.location}
                              {index === 0 && (
                                <span className="px-2 py-0.5 bg-secondary-500 text-white text-xs rounded-full">
                                  推荐
                                </span>
                              )}
                              {!estimate.isComplete && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  部分商品无价格
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-warmGray-500">
                              {estimate.itemBreakdown.length}件商品可估算
                              {estimate.missingItems.length > 0 && ` · ${estimate.missingItems.length}件待录入`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${index === 0 ? 'text-secondary-600' : 'text-warmGray-700'}`}>
                              ¥{estimate.totalPrice.toFixed(2)}
                            </div>
                            {index > 0 && bestDeal && (
                              <div className="text-sm text-warmGray-500">
                                贵 ¥{(estimate.totalPrice - bestDeal.totalPrice).toFixed(2)}
                              </div>
                            )}
                          </div>
                          {expandedEstimate === estimate.location ? (
                            <ChevronUp className="w-5 h-5 text-warmGray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-warmGray-400" />
                          )}
                        </div>
                      </div>

                      {expandedEstimate === estimate.location && (
                        <div className="mt-4 pt-4 border-t border-warmGray-200">
                          <div className="space-y-2 mb-4">
                            {estimate.itemBreakdown.map((item, idx) => {
                              const sourceInfo = getPriceSourceLabel(item.source, item.estimatedFrom);
                              return (
                                <div key={idx} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-warmGray-700">{item.productName}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${sourceInfo.color}`}>
                                      {sourceInfo.label}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-warmGray-800">
                                      ¥{item.unitPrice.toFixed(2)} × {item.quantity} = ¥{item.totalPrice.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {estimate.missingItems.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-warmGray-600 mb-2">需要手动录入价格的商品:</h4>
                              <div className="flex flex-wrap gap-2">
                                {estimate.missingItems.map(name => (
                                  <span key={name} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium text-warmGray-600 mb-2">
                              手动录入{estimate.location}当前价格:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeList.items.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                  <span className="flex-1 text-sm text-warmGray-700 truncate">
                                    {item.productName} ({item.quantity}{item.unit})
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-warmGray-500 text-sm">¥</span>
                                    <input
                                      type="number"
                                      value={item.manualPrices[estimate.location] || ''}
                                      onChange={(e) => setItemManualPrice(
                                        activeList.id,
                                        item.id,
                                        estimate.location,
                                        Number(e.target.value) || 0
                                      )}
                                      placeholder="单价"
                                      min="0"
                                      step="0.01"
                                      className="input-field w-24 py-1 text-sm"
                                    />
                                    <span className="text-warmGray-500 text-sm">/{item.unit}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {priceEstimates.length >= 2 && bestDeal && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl border border-secondary-200">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-6 h-6 text-secondary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-secondary-800">
                          🎯 推荐去 <span className="text-lg">{bestDeal.location}</span> 购买
                        </p>
                        <p className="text-secondary-700 text-sm mt-1">
                          预计总花费 <span className="font-bold text-lg">¥{bestDeal.totalPrice.toFixed(2)}</span>
                          {priceEstimates[1] && (
                            <>
                              ，比第二便宜的 {priceEstimates[1].location} 节省 
                              <span className="font-bold text-secondary-600">
                                ¥{(priceEstimates[1].totalPrice - bestDeal.totalPrice).toFixed(2)}
                              </span>
                            </>
                          )}
                        </p>
                        {!bestDeal.isComplete && (
                          <p className="text-amber-600 text-sm mt-2 flex items-center gap-1">
                            <Info className="w-4 h-4" />
                            还有 {bestDeal.missingItems.length} 件商品无历史价格，建议手动录入当前价格以获得更准确的估算
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PackageOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}
