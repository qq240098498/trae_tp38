import { useState, useMemo } from 'react';
import { Search, Filter, PackageOpen } from 'lucide-react';
import { usePurchaseStore } from '@/store/usePurchaseStore';
import { ProductCard } from './ProductCard';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';

export function ProductList() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const records = usePurchaseStore(state => state.records);
  const products = usePurchaseStore(state => state.products);
  const getAllProductStats = usePurchaseStore(state => state.getAllProductStats);
  const allStats = getAllProductStats();

  const filteredStats = useMemo(() => {
    return allStats.filter(stats => {
      const matchesSearch = stats.productName
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        allStats.some(s => {
          const product = products.find(p => p.id === stats.productId);
          return product?.category === selectedCategory;
        });
      
      return matchesSearch && matchesCategory;
    });
  }, [allStats, searchKeyword, selectedCategory, products]);

  const productCategories = useMemo(() => {
    const categories = new Set<string>();
    allStats.forEach(stats => {
      const product = products.find(p => p.id === stats.productId);
      if (product) categories.add(product.category);
    });
    return Array.from(categories);
  }, [allStats, products]);

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-warmGray-800 flex items-center gap-2">
          <PackageOpen className="w-6 h-6 text-primary-500" />
          我的商品
          <span className="text-sm font-normal text-warmGray-500">({filteredStats.length}种)</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warmGray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索商品..."
              className="input-field pl-10 pr-4 py-2.5 w-full sm:w-64"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warmGray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-10 pr-4 py-2.5 appearance-none bg-white w-full sm:w-40"
            >
              <option value="all">全部分类</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]} {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {productCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-warmGray-600 hover:bg-warmGray-100 border border-warmGray-200'
            }`}
          >
            全部
          </button>
          {CATEGORIES.filter(cat => productCategories.includes(cat)).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-warmGray-600 hover:bg-warmGray-100 border border-warmGray-200'
              }`}
            >
              {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]} {cat}
            </button>
          ))}
        </div>
      )}

      {filteredStats.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-warmGray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-10 h-10 text-warmGray-400" />
          </div>
          <h3 className="text-lg font-semibold text-warmGray-700 mb-2">
            {searchKeyword ? '没有找到相关商品' : '还没有添加商品'}
          </h3>
          <p className="text-warmGray-500">
            {searchKeyword 
              ? '试试其他关键词' 
              : '点击上方"添加采购记录"开始记录吧！'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStats.map((stats, index) => (
            <ProductCard
              key={stats.productId}
              stats={stats}
              delay={index * 50}
            />
          ))}
        </div>
      )}
    </div>
  );
}
