import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PurchaseRecord, Product, PurchaseFormData, PriceStats } from '@/types';
import { generateId, calculateStandardPrice, calculatePriceStats, getTodayDateString } from '@/utils/priceCalculator';
import { mockProducts, mockPurchaseRecords } from '@/data/mockData';

interface PurchaseState {
  records: PurchaseRecord[];
  products: Product[];
  isInitialized: boolean;
  
  addRecord: (formData: PurchaseFormData) => { record: PurchaseRecord; isNewProduct: boolean };
  deleteRecord: (id: string) => void;
  getRecordsByProduct: (productName: string) => PurchaseRecord[];
  getProductStats: (productName: string) => PriceStats | null;
  getAllProductStats: () => PriceStats[];
  searchProducts: (keyword: string) => string[];
  initializeWithMockData: () => void;
  clearAllData: () => void;
  getTotalStats: () => {
    totalProducts: number;
    totalRecords: number;
    totalSpent: number;
    thisMonthRecords: number;
  };
}

const STORAGE_KEY = 'purchase-tracker-storage';

function getOrCreateProduct(
  products: Product[],
  productName: string,
  category: PurchaseFormData['category'],
  unit: PurchaseFormData['unit']
): { product: Product; isNew: boolean; updatedProducts: Product[] } {
  const existingProduct = products.find(p => p.name === productName);
  
  if (existingProduct) {
    return { product: existingProduct, isNew: false, updatedProducts: products };
  }
  
  const newProduct: Product = {
    id: `product-${productName}`,
    name: productName,
    category,
    defaultUnit: unit,
    standardAmount: 100,
    createdAt: new Date().toISOString(),
  };
  
  return {
    product: newProduct,
    isNew: true,
    updatedProducts: [...products, newProduct],
  };
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      records: [],
      products: [],
      isInitialized: false,

      addRecord: (formData: PurchaseFormData) => {
        const state = get();
        const { product, isNew: isNewProduct, updatedProducts } = getOrCreateProduct(
          state.products,
          formData.productName,
          formData.category,
          formData.unit
        );
        
        const { price: standardPrice, label } = calculateStandardPrice(
          formData.totalPrice,
          formData.quantity,
          formData.unit
        );

        const newRecord: PurchaseRecord = {
          id: generateId(),
          productId: product.id,
          productName: formData.productName,
          purchaseDate: formData.purchaseDate || getTodayDateString(),
          location: formData.location,
          brand: formData.brand,
          specification: formData.specification,
          quantity: formData.quantity,
          unit: formData.unit,
          unitPrice: formData.unitPrice,
          totalPrice: formData.totalPrice,
          unitPriceStandard: standardPrice,
          standardUnitLabel: label,
          notes: formData.notes,
          createdAt: new Date().toISOString(),
        };

        set({
          records: [newRecord, ...state.records],
          products: updatedProducts,
        });

        return { record: newRecord, isNewProduct };
      },

      deleteRecord: (id: string) => {
        const state = get();
        const updatedRecords = state.records.filter(r => r.id !== id);
        
        const remainingProductIds = new Set(updatedRecords.map(r => r.productId));
        const updatedProducts = state.products.filter(p => remainingProductIds.has(p.id));
        
        set({
          records: updatedRecords,
          products: updatedProducts,
        });
      },

      getRecordsByProduct: (productName: string) => {
        return get().records
          .filter(r => r.productName === productName)
          .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      },

      getProductStats: (productName: string) => {
        const records = get().getRecordsByProduct(productName);
        return calculatePriceStats(records);
      },

      getAllProductStats: () => {
        const state = get();
        const productNames = [...new Set(state.records.map(r => r.productName))];
        return productNames
          .map(name => state.getProductStats(name))
          .filter((stats): stats is PriceStats => stats !== null)
          .sort((a, b) => b.latestPriceDate.localeCompare(a.latestPriceDate));
      },

      searchProducts: (keyword: string) => {
        if (!keyword.trim()) return [];
        const state = get();
        const keywordLower = keyword.toLowerCase();
        return [...new Set(
          state.records
            .filter(r => r.productName.toLowerCase().includes(keywordLower))
            .map(r => r.productName)
        )];
      },

      initializeWithMockData: () => {
        set({
          records: mockPurchaseRecords,
          products: mockProducts,
          isInitialized: true,
        });
      },

      clearAllData: () => {
        set({ records: [], products: [], isInitialized: false });
        localStorage.removeItem(STORAGE_KEY);
      },

      getTotalStats: () => {
        const state = get();
        const today = new Date();
        const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        const thisMonthRecords = state.records.filter(r => r.purchaseDate.startsWith(thisMonth));
        const totalSpent = state.records.reduce((sum, r) => sum + r.totalPrice, 0);
        const uniqueProducts = new Set(state.records.map(r => r.productName));

        return {
          totalProducts: uniqueProducts.size,
          totalRecords: state.records.length,
          totalSpent: Number(totalSpent.toFixed(2)),
          thisMonthRecords: thisMonthRecords.length,
        };
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && !state.isInitialized && state.records.length === 0) {
          state.initializeWithMockData();
        }
      },
    }
  )
);
