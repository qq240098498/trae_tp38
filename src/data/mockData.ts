import { PurchaseRecord, Product, Category } from '@/types';
import { generateId, calculateStandardPrice } from '@/utils/priceCalculator';

function createMockRecord(
  productName: string,
  category: Category,
  purchaseDate: string,
  location: string,
  brand: string,
  specification: string,
  quantity: number,
  unit: any,
  totalPrice: number,
  unitPrice: number
): PurchaseRecord {
  const productId = `product-${productName}`;
  const { price: standardPrice, label } = calculateStandardPrice(totalPrice, quantity, unit);
  
  return {
    id: generateId(),
    productId,
    productName,
    purchaseDate,
    location,
    brand,
    specification,
    quantity,
    unit,
    unitPrice,
    totalPrice,
    unitPriceStandard: standardPrice,
    standardUnitLabel: label,
    createdAt: new Date().toISOString(),
  };
}

export const mockProducts: Product[] = [
  {
    id: 'product-牛奶',
    name: '牛奶',
    category: '饮品',
    defaultUnit: 'ml',
    standardAmount: 100,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'product-大米',
    name: '大米',
    category: '粮油',
    defaultUnit: 'kg',
    standardAmount: 1,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'product-洗衣液',
    name: '洗衣液',
    category: '日用品',
    defaultUnit: 'kg',
    standardAmount: 1,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'product-抽纸',
    name: '抽纸',
    category: '日用品',
    defaultUnit: '抽',
    standardAmount: 100,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
];

export const mockPurchaseRecords: PurchaseRecord[] = [
  createMockRecord(
    '牛奶', '饮品', '2026-06-01', '沃尔玛', '伊利',
    '250ml*12盒', 3000, 'ml', 36.00, 3.00
  ),
  createMockRecord(
    '牛奶', '饮品', '2026-06-10', '京东', '蒙牛',
    '250ml*16盒', 4000, 'ml', 42.00, 2.63
  ),
  createMockRecord(
    '大米', '粮油', '2026-05-20', '永辉超市', '福临门',
    '5kg/袋', 5, 'kg', 39.90, 7.98
  ),
  createMockRecord(
    '大米', '粮油', '2026-06-05', '天猫', '金龙鱼',
    '10kg/袋', 10, 'kg', 75.00, 7.50
  ),
  createMockRecord(
    '洗衣液', '日用品', '2026-05-15', '家乐福', '蓝月亮',
    '3kg/瓶', 3, 'kg', 49.90, 16.63
  ),
  createMockRecord(
    '洗衣液', '日用品', '2026-06-08', '拼多多', '立白',
    '2kg*2瓶', 4, 'kg', 59.90, 14.98
  ),
  createMockRecord(
    '抽纸', '日用品', '2026-05-28', '京东', '维达',
    '130抽*24包', 3120, '抽', 39.90, 1.66
  ),
  createMockRecord(
    '抽纸', '日用品', '2026-06-12', '沃尔玛', '清风',
    '150抽*20包', 3000, '抽', 35.90, 1.80
  ),
];
