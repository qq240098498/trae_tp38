import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PurchaseRecord, PriceStats } from '@/types';

interface PriceChartProps {
  records: PurchaseRecord[];
  stats: PriceStats | null;
}

export function PriceChart({ records, stats }: PriceChartProps) {
  const chartData = [...records]
    .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime())
    .map(record => ({
      date: record.purchaseDate.slice(5),
      price: record.unitPriceStandard,
      location: record.location,
      brand: record.brand,
      specification: record.specification,
      totalPrice: record.totalPrice,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-warmGray-200">
          <p className="font-semibold text-warmGray-800 mb-1">{data.date}</p>
          <p className="text-primary-600 font-bold text-lg">
            ¥{data.price.toFixed(2)}
            <span className="text-sm font-normal text-warmGray-500 ml-1">
              {records[0]?.standardUnitLabel}
            </span>
          </p>
          <p className="text-sm text-warmGray-600 mt-1">
            {data.brand} · {data.location}
          </p>
          <p className="text-xs text-warmGray-500">
            {data.specification} · ¥{data.totalPrice.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length < 2) {
    return (
      <div className="bg-warmGray-50 rounded-2xl p-8 text-center">
        <p className="text-warmGray-500">
          至少需要2条采购记录才能显示价格趋势
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-warmGray-100">
      <h3 className="text-lg font-bold text-warmGray-800 mb-4">价格走势</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9C8E79" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9C8E79" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {stats && (
              <>
                <ReferenceLine 
                  y={stats.minPrice} 
                  stroke="#2EC4B6" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `最低价 ¥${stats.minPrice}`, 
                    position: 'right', 
                    fill: '#2EC4B6',
                    fontSize: 11 
                  }}
                />
                <ReferenceLine 
                  y={stats.avgPrice} 
                  stroke="#9C8E79" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `均价 ¥${stats.avgPrice}`, 
                    position: 'insideTopRight', 
                    fill: '#9C8E79',
                    fontSize: 11 
                  }}
                />
              </>
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#FF6B35"
              strokeWidth={3}
              dot={{ 
                fill: '#FF6B35', 
                strokeWidth: 2, 
                stroke: '#fff',
                r: 6 
              }}
              activeDot={{ 
                r: 8, 
                fill: '#FF6B35',
                strokeWidth: 3,
                stroke: '#FFE2D4'
              }}
              fill="url(#colorPrice)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
