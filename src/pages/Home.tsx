import { ShoppingCart, TrendingUp, Settings, RefreshCw } from 'lucide-react';
import { StatsOverview } from '@/components/StatsOverview';
import { PurchaseForm } from '@/components/PurchaseForm';
import { ProductList } from '@/components/ProductList';
import { GoodDealsBanner } from '@/components/GoodDealsBanner';
import { ShoppingList } from '@/components/ShoppingList';
import { usePurchaseStore } from '@/store/usePurchaseStore';
import { useState } from 'react';

export default function Home() {
  const clearAllData = usePurchaseStore(state => state.clearAllData);
  const initializeWithMockData = usePurchaseStore(state => state.initializeWithMockData);
  const [showSettings, setShowSettings] = useState(false);

  const handleResetData = () => {
    if (confirm('确定要清除所有数据吗？此操作无法撤销。')) {
      clearAllData();
      initializeWithMockData();
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-warmGray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-warmGray-800">家庭采购比价</h1>
                <p className="text-sm text-warmGray-500 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-secondary-500" />
                  精明消费，每一分钱都花在刀刃上
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 text-warmGray-500 hover:text-warmGray-700 hover:bg-warmGray-100 rounded-xl transition-all"
                title="设置"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 p-4 bg-warmGray-50 rounded-xl animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-warmGray-800">数据管理</h3>
                  <p className="text-sm text-warmGray-500">重置数据会清除所有记录并恢复示例数据</p>
                </div>
                <button
                  onClick={handleResetData}
                  className="btn-outline flex items-center gap-2 text-sm py-2 px-4"
                >
                  <RefreshCw className="w-4 h-4" />
                  重置为示例数据
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <StatsOverview />
        <GoodDealsBanner />
        <ShoppingList />
        <PurchaseForm />
        <ProductList />
      </main>

      <footer className="border-t border-warmGray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-warmGray-500 text-sm">
          <p>家庭采购比价工具 · 本地数据安全存储 · 无需联网</p>
          <p className="mt-2">所有数据保存在您的浏览器 localStorage 中</p>
        </div>
      </footer>
    </div>
  );
}
