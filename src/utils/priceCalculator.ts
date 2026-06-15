import { UnitType, PurchaseRecord, PriceStats, PriceComparison } from '@/types';

interface UnitConversion {
  toStandard: number;
  standardUnit: string;
}

export const UNIT_CONVERSIONS: Record<UnitType, UnitConversion> = {
  'ml': { toStandard: 0.01, standardUnit: '100ml' },
  'l': { toStandard: 10, standardUnit: '100ml' },
  'g': { toStandard: 0.002, standardUnit: '斤' },
  'kg': { toStandard: 2, standardUnit: '斤' },
  '斤': { toStandard: 1, standardUnit: '斤' },
  '个': { toStandard: 1, standardUnit: '个' },
  '盒': { toStandard: 1, standardUnit: '盒' },
  '包': { toStandard: 1, standardUnit: '包' },
  '卷': { toStandard: 1, standardUnit: '卷' },
  '抽': { toStandard: 0.01, standardUnit: '100抽' },
  '其他': { toStandard: 1, standardUnit: '单位' },
};

export function calculateStandardPrice(
  totalPrice: number,
  quantity: number,
  unit: UnitType
): { price: number; label: string } {
  if (quantity <= 0 || totalPrice < 0) {
    return { price: 0, label: `元/${UNIT_CONVERSIONS[unit].standardUnit}` };
  }
  
  const conversion = UNIT_CONVERSIONS[unit];
  const standardQuantity = quantity * conversion.toStandard;
  const standardPrice = totalPrice / standardQuantity;
  
  return {
    price: Number(standardPrice.toFixed(2)),
    label: `元/${conversion.standardUnit}`,
  };
}

export function calculatePriceStats(records: PurchaseRecord[]): PriceStats | null {
  if (records.length === 0) return null;

  const sortedByDate = [...records].sort((a, b) => 
    new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
  );
  
  const minRecord = sortedByDate.reduce((min, curr) => 
    curr.unitPriceStandard < min.unitPriceStandard ? curr : min
  );
  
  const latestRecord = sortedByDate[sortedByDate.length - 1];
  const avgPrice = records.reduce((sum, r) => sum + r.unitPriceStandard, 0) / records.length;
  const totalSpent = records.reduce((sum, r) => sum + r.totalPrice, 0);

  return {
    productId: records[0].productId,
    productName: records[0].productName,
    minPrice: minRecord.unitPriceStandard,
    minPriceDate: minRecord.purchaseDate,
    minPriceLocation: minRecord.location,
    avgPrice: Number(avgPrice.toFixed(2)),
    latestPrice: latestRecord.unitPriceStandard,
    latestPriceDate: latestRecord.purchaseDate,
    purchaseCount: records.length,
    totalSpent: Number(totalSpent.toFixed(2)),
    standardUnitLabel: records[0].standardUnitLabel,
  };
}

export function comparePrice(
  currentStandardPrice: number,
  records: PurchaseRecord[]
): PriceComparison | null {
  if (records.length === 0) return null;

  const stats = calculatePriceStats(records);
  if (!stats) return null;

  const difference = currentStandardPrice - stats.minPrice;
  const differencePercent = stats.minPrice > 0 
    ? Number(((difference / stats.minPrice) * 100).toFixed(1))
    : 0;

  return {
    isNewLow: currentStandardPrice < stats.minPrice,
    minPrice: stats.minPrice,
    minPriceDate: stats.minPriceDate,
    minPriceLocation: stats.minPriceLocation,
    currentPrice: currentStandardPrice,
    difference: Number(Math.abs(difference).toFixed(2)),
    differencePercent: Math.abs(differencePercent),
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatDate(new Date().toISOString().split('T')[0]);
}

export function getDaysAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function suggestUnitForCategory(category: string): UnitType {
  const suggestions: Record<string, UnitType> = {
    '饮品': 'ml',
    '粮油': 'kg',
    '食品': 'g',
    '日用品': 'ml',
    '个护': 'ml',
  };
  return suggestions[category] || '个';
}
