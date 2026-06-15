import { MapPin, Calendar, Tag, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { PurchaseRecord } from '@/types';
import { getDaysAgo } from '@/utils/priceCalculator';

interface PurchaseHistoryProps {
  records: PurchaseRecord[];
  onDelete?: (id: string) => void;
}

export function PurchaseHistory({ records, onDelete }: PurchaseHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-warmGray-500">还没有采购记录</p>
      </div>
    );
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );

  const minPrice = Math.min(...records.map(r => r.unitPriceStandard));

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-warmGray-800 mb-4">采购历史</h3>
      {sortedRecords.map((record, index) => {
        const isMinPrice = record.unitPriceStandard === minPrice;
        const prevRecord = sortedRecords[index + 1];
        const priceDiff = prevRecord 
          ? record.unitPriceStandard - prevRecord.unitPriceStandard 
          : 0;

        return (
          <div
            key={record.id}
            className={`bg-white rounded-2xl p-5 border-2 transition-all duration-300 hover:shadow-card ${
              isMinPrice 
                ? 'border-secondary-300 bg-gradient-to-r from-secondary-50 to-white' 
                : 'border-warmGray-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold text-warmGray-800">
                    ¥{record.unitPriceStandard.toFixed(2)}
                  </span>
                  <span className="text-sm text-warmGray-500">
                    {record.standardUnitLabel}
                  </span>
                  {isMinPrice && (
                    <span className="badge badge-success flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      历史最低
                    </span>
                  )}
                  {!isMinPrice && priceDiff !== 0 && (
                    <span className={`badge flex items-center gap-1 ${
                      priceDiff < 0 ? 'badge-success' : 'badge-warning'
                    }`}>
                      {priceDiff < 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      {priceDiff < 0 ? '' : '+'}
                      {priceDiff.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-warmGray-600">
                    <Calendar className="w-4 h-4 text-warmGray-400" />
                    <span>{record.purchaseDate}</span>
                    <span className="text-warmGray-400">({getDaysAgo(record.purchaseDate)})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-warmGray-600">
                    <MapPin className="w-4 h-4 text-warmGray-400" />
                    <span>{record.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-warmGray-600">
                    <Tag className="w-4 h-4 text-warmGray-400" />
                    <span>{record.brand} {record.specification}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-warmGray-600">
                    <span className="font-medium">总价：</span>
                    <span className="font-semibold text-primary-600">¥{record.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {record.notes && (
                  <p className="mt-3 text-sm text-warmGray-500 bg-warmGray-50 rounded-lg px-3 py-2">
                    💬 {record.notes}
                  </p>
                )}
              </div>

              {onDelete && (
                <button
                  onClick={() => onDelete(record.id)}
                  className="p-2 text-warmGray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-4"
                  title="删除记录"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
