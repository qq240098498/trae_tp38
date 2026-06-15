export type Category = '食品' | '日用品' | '饮品' | '粮油' | '个护' | '其他';

export type UnitType = 'ml' | 'l' | 'g' | 'kg' | '斤' | '个' | '盒' | '包' | '卷' | '抽' | '其他';

export interface Product {
  id: string;
  name: string;
  category: Category;
  defaultUnit: UnitType;
  standardAmount: number;
  createdAt: string;
}

export interface PurchaseRecord {
  id: string;
  productId: string;
  productName: string;
  purchaseDate: string;
  location: string;
  brand: string;
  specification: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
  totalPrice: number;
  unitPriceStandard: number;
  standardUnitLabel: string;
  notes?: string;
  createdAt: string;
}

export interface PriceStats {
  productId: string;
  productName: string;
  minPrice: number;
  minPriceDate: string;
  minPriceLocation: string;
  avgPrice: number;
  latestPrice: number;
  latestPriceDate: string;
  purchaseCount: number;
  totalSpent: number;
  standardUnitLabel: string;
}

export interface PurchaseFormData {
  productName: string;
  category: Category;
  purchaseDate: string;
  location: string;
  brand: string;
  specification: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface PriceComparison {
  isNewLow: boolean;
  minPrice: number;
  minPriceDate: string;
  minPriceLocation: string;
  currentPrice: number;
  difference: number;
  differencePercent: number;
}

export interface PriceCyclePattern {
  productName: string;
  averageCycleDays: number;
  cycleDescription: string;
  lowPricePattern: string;
  nextExpectedLowDate: string;
}

export interface StockAdvice {
  productName: string;
  isGoodPrice: boolean;
  discountPercent: number;
  suggestedQuantity: number;
  suggestedUnit: string;
  reason: string;
  standardUnitLabel: string;
}

export interface AlertThreshold {
  id: string;
  productName: string;
  thresholdPrice: number;
  standardUnitLabel: string;
  createdAt: string;
  enabled: boolean;
}

export const CATEGORIES: Category[] = ['食品', '日用品', '饮品', '粮油', '个护', '其他'];

export const UNIT_TYPES: UnitType[] = ['ml', 'l', 'g', 'kg', '斤', '个', '盒', '包', '卷', '抽', '其他'];

export const COMMON_LOCATIONS = [
  '沃尔玛', '永辉超市', '家乐福', '大润发', '盒马鲜生',
  '京东', '天猫', '淘宝', '拼多多', '美团优选',
  '叮咚买菜', '朴朴超市', '其他'
];

export const CATEGORY_ICONS: Record<Category, string> = {
  '食品': '🍎',
  '日用品': '🧴',
  '饮品': '🥤',
  '粮油': '🍚',
  '个护': '🧼',
  '其他': '📦',
};
