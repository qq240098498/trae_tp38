import { ShoppingCart, TrendingUp, Package, Calendar } from 'lucide-react';
import { usePurchaseStore } from '@/store/usePurchaseStore';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}

function StatCard({ title, value, subtitle, icon, gradient, delay }: StatCardProps) {
  return (
    <div
      className={`stat-card bg-gradient-to-br ${gradient} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 -mt-8 -mr-8">
        <div className="w-full h-full rounded-full bg-white blur-2xl" />
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <h3 className="text-3xl font-bold mb-1">{value}</h3>
        <p className="text-white/80 font-medium">{title}</p>
        {subtitle && (
          <p className="text-white/60 text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function StatsOverview() {
  const records = usePurchaseStore(state => state.records);
  const getTotalStats = usePurchaseStore(state => state.getTotalStats);
  const stats = getTotalStats();

  const statCards: Omit<StatCardProps, 'delay'>[] = [
    {
      title: '商品种类',
      value: stats.totalProducts,
      subtitle: '种不同商品',
      icon: <Package className="w-6 h-6 text-white" />,
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      title: '累计采购',
      value: stats.totalRecords,
      subtitle: '次记录',
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      gradient: 'from-secondary-500 to-secondary-600',
    },
    {
      title: '本月采购',
      value: stats.thisMonthRecords,
      subtitle: '次',
      icon: <Calendar className="w-6 h-6 text-white" />,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: '累计支出',
      value: `¥${stats.totalSpent.toFixed(2)}`,
      subtitle: '元',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <StatCard
          key={card.title}
          {...card}
          delay={index * 100}
        />
      ))}
    </div>
  );
}
