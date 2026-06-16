import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PurchaseRecord, Product, PurchaseFormData, PriceStats, AlertThreshold, ShoppingList, ShoppingListItem, ShoppingListItemForm } from '@/types';
import { generateId, calculateStandardPrice, calculatePriceStats, getTodayDateString, estimateAllChannels } from '@/utils/priceCalculator';
import type { ChannelPriceEstimate } from '@/types';
import { mockProducts, mockPurchaseRecords } from '@/data/mockData';
import { COMMON_LOCATIONS } from '@/types';

interface PurchaseState {
  records: PurchaseRecord[];
  products: Product[];
  alertThresholds: AlertThreshold[];
  shoppingLists: ShoppingList[];
  activeShoppingListId: string | null;
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
  addAlertThreshold: (productName: string, thresholdPrice: number, standardUnitLabel: string) => void;
  removeAlertThreshold: (id: string) => void;
  toggleAlertThreshold: (id: string) => void;
  getAlertThresholds: () => AlertThreshold[];
  getAlertThresholdByProduct: (productName: string) => AlertThreshold | undefined;
  
  createShoppingList: (name: string) => ShoppingList;
  deleteShoppingList: (id: string) => void;
  setActiveShoppingList: (id: string | null) => void;
  addShoppingListItem: (listId: string, itemForm: ShoppingListItemForm) => void;
  removeShoppingListItem: (listId: string, itemId: string) => void;
  updateShoppingListItem: (listId: string, itemId: string, updates: Partial<ShoppingListItem>) => void;
  setItemManualPrice: (listId: string, itemId: string, location: string, price: number) => void;
  toggleShoppingListItem: (listId: string, itemId: string) => void;
  getShoppingListPriceEstimates: (listId: string) => ChannelPriceEstimate[];
  getActiveShoppingList: () => ShoppingList | null;
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
      alertThresholds: [],
      shoppingLists: [],
      activeShoppingListId: null,
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
          category: formData.category,
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

      addAlertThreshold: (productName: string, thresholdPrice: number, standardUnitLabel: string) => {
        const state = get();
        const existingThreshold = state.alertThresholds.find(t => t.productName === productName);
        
        if (existingThreshold) {
          set({
            alertThresholds: state.alertThresholds.map(t =>
              t.productName === productName
                ? { ...t, thresholdPrice, standardUnitLabel, enabled: true }
                : t
            ),
          });
        } else {
          const newThreshold: AlertThreshold = {
            id: generateId(),
            productName,
            thresholdPrice,
            standardUnitLabel,
            createdAt: new Date().toISOString(),
            enabled: true,
          };
          set({ alertThresholds: [...state.alertThresholds, newThreshold] });
        }
      },

      removeAlertThreshold: (id: string) => {
        const state = get();
        set({ alertThresholds: state.alertThresholds.filter(t => t.id !== id) });
      },

      toggleAlertThreshold: (id: string) => {
        const state = get();
        set({
          alertThresholds: state.alertThresholds.map(t =>
            t.id === id ? { ...t, enabled: !t.enabled } : t
          ),
        });
      },

      getAlertThresholds: () => {
        return get().alertThresholds;
      },

      getAlertThresholdByProduct: (productName: string) => {
        return get().alertThresholds.find(t => t.productName === productName);
      },

      createShoppingList: (name: string) => {
        const state = get();
        const newList: ShoppingList = {
          id: generateId(),
          name,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({
          shoppingLists: [...state.shoppingLists, newList],
          activeShoppingListId: newList.id,
        });
        return newList;
      },

      deleteShoppingList: (id: string) => {
        const state = get();
        const updatedLists = state.shoppingLists.filter(l => l.id !== id);
        const newActiveId = state.activeShoppingListId === id 
          ? (updatedLists.length > 0 ? updatedLists[0].id : null)
          : state.activeShoppingListId;
        set({
          shoppingLists: updatedLists,
          activeShoppingListId: newActiveId,
        });
      },

      setActiveShoppingList: (id: string | null) => {
        set({ activeShoppingListId: id });
      },

      addShoppingListItem: (listId: string, itemForm: ShoppingListItemForm) => {
        const state = get();
        const existingProduct = state.products.find(p => p.name === itemForm.productName);
        const productId = existingProduct?.id || null;
        const category = existingProduct?.category || itemForm.category;
        const unit = existingProduct?.defaultUnit || itemForm.unit;
        const newItem: ShoppingListItem = {
          id: generateId(),
          productId,
          productName: itemForm.productName,
          quantity: itemForm.quantity,
          unit,
          category,
          manualPrices: {},
          checked: false,
        };
        set({
          shoppingLists: state.shoppingLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: [...list.items, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        });
      },

      removeShoppingListItem: (listId: string, itemId: string) => {
        const state = get();
        set({
          shoppingLists: state.shoppingLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.filter(item => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        });
      },

      updateShoppingListItem: (listId: string, itemId: string, updates: Partial<ShoppingListItem>) => {
        const state = get();
        set({
          shoppingLists: state.shoppingLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map(item =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        });
      },

      setItemManualPrice: (listId: string, itemId: string, location: string, price: number) => {
        const state = get();
        set({
          shoppingLists: state.shoppingLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map(item =>
                    item.id === itemId
                      ? {
                          ...item,
                          manualPrices: {
                            ...item.manualPrices,
                            [location]: price,
                          },
                        }
                      : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        });
      },

      toggleShoppingListItem: (listId: string, itemId: string) => {
        const state = get();
        set({
          shoppingLists: state.shoppingLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map(item =>
                    item.id === itemId ? { ...item, checked: !item.checked } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        });
      },

      getShoppingListPriceEstimates: (listId: string) => {
        const state = get();
        const list = state.shoppingLists.find(l => l.id === listId);
        if (!list || list.items.length === 0) return [];
        return estimateAllChannels(state.records, list.items, COMMON_LOCATIONS);
      },

      getActiveShoppingList: () => {
        const state = get();
        if (!state.activeShoppingListId) return null;
        return state.shoppingLists.find(l => l.id === state.activeShoppingListId) || null;
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
