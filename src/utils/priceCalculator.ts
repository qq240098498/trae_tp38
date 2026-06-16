import { UnitType, PurchaseRecord, PriceStats, PriceComparison, PriceCyclePattern, StockAdvice, ShoppingListItem, ChannelPriceEstimate } from '@/types';

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

export function analyzePriceCycle(records: PurchaseRecord[]): PriceCyclePattern | null {
  if (records.length < 3) return null;

  const sortedByDate = [...records].sort((a, b) =>
    new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
  );

  const avgPrice = sortedByDate.reduce((sum, r) => sum + r.unitPriceStandard, 0) / sortedByDate.length;
  const lowPriceRecords = sortedByDate.filter(r => r.unitPriceStandard <= avgPrice * 0.9);

  if (lowPriceRecords.length < 2) {
    return {
      productName: sortedByDate[0].productName,
      averageCycleDays: 60,
      cycleDescription: '数据不足，暂未发现明显规律',
      lowPricePattern: '建议持续关注价格变化',
      nextExpectedLowDate: '',
    };
  }

  const lowDates = lowPriceRecords.map(r => new Date(r.purchaseDate).getTime());
  const intervals: number[] = [];
  
  for (let i = 1; i < lowDates.length; i++) {
    intervals.push((lowDates[i] - lowDates[i - 1]) / (1000 * 60 * 60 * 24));
  }

  const averageCycleDays = intervals.length > 0
    ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
    : 60;

  let cycleDescription = '';
  if (averageCycleDays <= 30) {
    cycleDescription = '约每月大促一次';
  } else if (averageCycleDays <= 45) {
    cycleDescription = '约每1.5个月大促一次';
  } else if (averageCycleDays <= 75) {
    cycleDescription = '约每2个月大促一次';
  } else if (averageCycleDays <= 105) {
    cycleDescription = '约每3个月大促一次';
  } else {
    cycleDescription = `约每${Math.round(averageCycleDays / 30)}个月大促一次`;
  }

  const categories = [...new Set(records.map(r => r.location))];
  const lowPriceByCategory = lowPriceRecords.reduce((acc, r) => {
    acc[r.location] = (acc[r.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bestLocation = Object.entries(lowPriceByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  const lowPricePattern = bestLocation
    ? `低价多在${bestLocation}出现`
    : '各渠道价格波动相似';

  const lastLowDate = lowDates[lowDates.length - 1];
  const nextExpectedLow = new Date(lastLowDate + averageCycleDays * 24 * 60 * 60 * 1000);
  const nextExpectedLowDate = formatDate(nextExpectedLow.toISOString().split('T')[0]);

  return {
    productName: sortedByDate[0].productName,
    averageCycleDays,
    cycleDescription,
    lowPricePattern,
    nextExpectedLowDate,
  };
}

export function generateStockAdvice(
  records: PurchaseRecord[],
  stats: PriceStats
): StockAdvice {
  const { avgPrice, latestPrice, standardUnitLabel } = stats;
  const discountPercent = avgPrice > 0
    ? Number((((avgPrice - latestPrice) / avgPrice) * 100).toFixed(1))
    : 0;
  const isGoodPrice = discountPercent >= 10;

  let suggestedQuantity = 1;
  let reason = '';

  if (isGoodPrice) {
    const cycle = analyzePriceCycle(records);
    const cycleDays = cycle?.averageCycleDays || 60;

    if (discountPercent >= 30) {
      suggestedQuantity = Math.max(3, Math.ceil(cycleDays / 20));
      reason = `价格低于均价${discountPercent}%，力度很大，建议多囤`;
    } else if (discountPercent >= 20) {
      suggestedQuantity = Math.max(2, Math.ceil(cycleDays / 30));
      reason = `价格低于均价${discountPercent}%，优惠明显，建议适量囤货`;
    } else {
      suggestedQuantity = Math.max(1, Math.ceil(cycleDays / 60));
      reason = `价格低于均价${discountPercent}%，有一定优惠，可考虑囤货`;
    }
  } else if (discountPercent >= 0) {
    reason = `当前价格接近历史均价，优惠不明显`;
    suggestedQuantity = 1;
  } else {
    reason = `当前价格高于均价${Math.abs(discountPercent)}%，不建议囤货`;
    suggestedQuantity = 0;
  }

  const unit = standardUnitLabel.replace('元/', '');

  return {
    productName: stats.productName,
    isGoodPrice,
    discountPercent,
    suggestedQuantity,
    suggestedUnit: unit,
    reason,
    standardUnitLabel,
  };
}

export function checkPriceAlert(
  currentPrice: number,
  thresholdPrice: number
): { triggered: boolean; difference: number } {
  if (thresholdPrice <= 0) return { triggered: false, difference: 0 };
  
  const difference = Number((thresholdPrice - currentPrice).toFixed(2));
  return {
    triggered: currentPrice <= thresholdPrice,
    difference,
  };
}

export function getLatestPriceByLocation(
  records: PurchaseRecord[],
  productName: string,
  location: string
): { unitPrice: number; standardPrice: number; standardUnitLabel: string; date: string; unit: UnitType } | null {
  const productRecords = records
    .filter(r => r.productName === productName && r.location === location)
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

  if (productRecords.length === 0) return null;

  const latest = productRecords[0];
  return {
    unitPrice: latest.unitPrice,
    standardPrice: latest.unitPriceStandard,
    standardUnitLabel: latest.standardUnitLabel,
    date: latest.purchaseDate,
    unit: latest.unit,
  };
}

export function getLatestPriceAnyLocation(
  records: PurchaseRecord[],
  productName: string
): { unitPrice: number; standardPrice: number; standardUnitLabel: string; location: string; date: string; unit: UnitType } | null {
  const productRecords = records
    .filter(r => r.productName === productName)
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

  if (productRecords.length === 0) return null;

  const latest = productRecords[0];
  return {
    unitPrice: latest.unitPrice,
    standardPrice: latest.unitPriceStandard,
    standardUnitLabel: latest.standardUnitLabel,
    location: latest.location,
    date: latest.purchaseDate,
    unit: latest.unit,
  };
}

export function getAvailableLocations(records: PurchaseRecord[]): string[] {
  return [...new Set(records.map(r => r.location))].filter(l => l && l !== '其他');
}

export function estimateChannelPrice(
  records: PurchaseRecord[],
  items: ShoppingListItem[],
  location: string
): ChannelPriceEstimate {
  const breakdown: ChannelPriceEstimate['itemBreakdown'] = [];
  const missingItems: string[] = [];
  let totalPrice = 0;

  for (const item of items) {
    const manualPrice = item.manualPrices[location];
    
    if (manualPrice !== undefined && manualPrice > 0) {
      const itemTotal = Number((manualPrice * item.quantity).toFixed(2));
      const conversion = UNIT_CONVERSIONS[item.unit];
      const standardQty = item.quantity * conversion.toStandard;
      const standardUnitPrice = standardQty > 0 ? Number((itemTotal / standardQty).toFixed(2)) : 0;
      breakdown.push({
        productName: item.productName,
        unitPrice: manualPrice,
        totalPrice: itemTotal,
        quantity: item.quantity,
        unit: item.unit,
        standardUnitPrice,
        standardUnitLabel: `元/${conversion.standardUnit}`,
        source: 'manual',
      });
      totalPrice += itemTotal;
      continue;
    }

    const locationPrice = getLatestPriceByLocation(records, item.productName, location);
    if (locationPrice) {
      const itemTotal = calculateItemTotalFromStandardPrice(
        locationPrice.standardPrice,
        locationPrice.standardUnitLabel,
        item.quantity,
        item.unit
      );
      const itemUnitPrice = item.quantity > 0 ? Number((itemTotal / item.quantity).toFixed(2)) : 0;
      breakdown.push({
        productName: item.productName,
        unitPrice: itemUnitPrice,
        totalPrice: itemTotal,
        quantity: item.quantity,
        unit: item.unit,
        standardUnitPrice: locationPrice.standardPrice,
        standardUnitLabel: locationPrice.standardUnitLabel,
        source: 'history',
      });
      totalPrice += itemTotal;
      continue;
    }

    const anyLocationPrice = getLatestPriceAnyLocation(records, item.productName);
    if (anyLocationPrice) {
      const itemTotal = calculateItemTotalFromStandardPrice(
        anyLocationPrice.standardPrice,
        anyLocationPrice.standardUnitLabel,
        item.quantity,
        item.unit
      );
      const itemUnitPrice = item.quantity > 0 ? Number((itemTotal / item.quantity).toFixed(2)) : 0;
      breakdown.push({
        productName: item.productName,
        unitPrice: itemUnitPrice,
        totalPrice: itemTotal,
        quantity: item.quantity,
        unit: item.unit,
        standardUnitPrice: anyLocationPrice.standardPrice,
        standardUnitLabel: anyLocationPrice.standardUnitLabel,
        source: 'estimated',
        estimatedFrom: anyLocationPrice.location,
      });
      totalPrice += itemTotal;
      continue;
    }

    missingItems.push(item.productName);
  }

  return {
    location,
    totalPrice: Number(totalPrice.toFixed(2)),
    itemBreakdown: breakdown,
    missingItems,
    isComplete: missingItems.length === 0,
  };
}

function calculateItemTotalFromStandardPrice(
  standardPrice: number,
  standardUnitLabel: string,
  itemQuantity: number,
  itemUnit: UnitType
): number {
  const conversion = UNIT_CONVERSIONS[itemUnit];
  const standardQty = itemQuantity * conversion.toStandard;
  return Number((standardPrice * standardQty).toFixed(2));
}

export function estimateAllChannels(
  records: PurchaseRecord[],
  items: ShoppingListItem[],
  commonLocations: string[]
): ChannelPriceEstimate[] {
  const availableLocations = getAvailableLocations(records);
  const allLocations = [...new Set([...commonLocations.filter(l => l !== '其他'), ...availableLocations])];
  
  return allLocations
    .map(location => estimateChannelPrice(records, items, location))
    .filter(estimate => estimate.itemBreakdown.length > 0)
    .sort((a, b) => a.totalPrice - b.totalPrice);
}

export function getShoppingListTotal(
  items: ShoppingListItem[],
  manualPrices?: Record<string, Record<string, number>>
): number {
  let total = 0;
  for (const item of items) {
    if (manualPrices) {
      for (const location of Object.keys(manualPrices)) {
        const price = manualPrices[location][item.id];
        if (price) {
          total += price * item.quantity;
        }
      }
    }
  }
  return Number(total.toFixed(2));
}
