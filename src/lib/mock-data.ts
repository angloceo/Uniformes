
export interface UniformSize {
  size: string;
  price: number; // Prices in COP
  cost: number; // Cost in COP
  stock: number;
  lowStockThreshold: number; // Threshold to trigger low stock alert
}

export interface Uniform {
  id: string;
  name: string; 
  category: 'Camiseta Polo' | 'Falda' | 'Camiseta Deporte' | 'Sudadera' | 'Chaqueta';
  imageUrl?: string; 
  sizes: UniformSize[];
}

export const initialUniforms: Uniform[] = [
  {
    id: 'polo-unisex',
    name: 'Camiseta Polo', 
    category: 'Camiseta Polo',
    imageUrl: 'https://picsum.photos/seed/polounisex/200/200', 
    sizes: [ 
      { size: '2', price: 38000, cost: 25000, stock: 20, lowStockThreshold: 5 },
      { size: '4', price: 38000, cost: 25000, stock: 25, lowStockThreshold: 5 },
      { size: '6', price: 38000, cost: 25000, stock: 20, lowStockThreshold: 5 },
      { size: '8', price: 38000, cost: 25000, stock: 20, lowStockThreshold: 5 },
      { size: '10', price: 38000, cost: 25000, stock: 20, lowStockThreshold: 5 },
      { size: '12', price: 38000, cost: 25000, stock: 20, lowStockThreshold: 5 },
      { size: '14', price: 38000, cost: 25000, stock: 20, lowStockThreshold: 5 },
      { size: '16', price: 38000, cost: 25000, stock: 20, lowStockThreshold: 5 },
      { size: 'S', price: 40000, cost: 26000, stock: 18, lowStockThreshold: 3 },
      { size: 'M', price: 40000, cost: 26000, stock: 13, lowStockThreshold: 3 },
      { size: 'L', price: 40000, cost: 26000, stock: 9, lowStockThreshold: 3 },
      { size: 'XL', price: 40000, cost: 26000, stock: 9, lowStockThreshold: 3 },
      { size: 'XXL', price: 42000, cost: 27000, stock: 7, lowStockThreshold: 2 },
      { size: 'XXXL', price: 42000, cost: 27000, stock: 5, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'falda',
    name: 'Falda Escolar',
    category: 'Falda',
    imageUrl: 'https://picsum.photos/seed/faldaescolar/200/200',
    sizes: [
      { size: '2', price: 38000, cost: 24000, stock: 15, lowStockThreshold: 4 },
      { size: '4', price: 38000, cost: 24000, stock: 12, lowStockThreshold: 4 },
      { size: '6', price: 38000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '8', price: 38000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '10', price: 38000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '12', price: 38000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '14', price: 38000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '16', price: 38000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: 'S', price: 40000, cost: 25500, stock: 7, lowStockThreshold: 2 },
      { size: 'M', price: 40000, cost: 25500, stock: 6, lowStockThreshold: 2 },
      { size: 'L', price: 40000, cost: 25500, stock: 6, lowStockThreshold: 2 },
      { size: 'XL', price: 42000, cost: 26500, stock: 5, lowStockThreshold: 2 },
      { size: 'XXL', price: 42000, cost: 26500, stock: 4, lowStockThreshold: 1 },
    ],
  },
  {
    id: 'camiseta-deporte',
    name: 'Camiseta Deporte',
    category: 'Camiseta Deporte',
    imageUrl: 'https://picsum.photos/seed/camisetadeporte/200/200',
    sizes: [
      { size: '2', price: 34000, cost: 22000, stock: 30, lowStockThreshold: 8 },
      { size: '4', price: 34000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '6', price: 34000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '8', price: 34000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '10', price: 34000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '12', price: 34000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '14', price: 34000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '16', price: 34000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: 'S', price: 36000, cost: 23500, stock: 20, lowStockThreshold: 5 },
      { size: 'M', price: 36000, cost: 23500, stock: 22, lowStockThreshold: 5 },
      { size: 'L', price: 36000, cost: 23500, stock: 15, lowStockThreshold: 5 },
      { size: 'XL', price: 36000, cost: 23500, stock: 10, lowStockThreshold: 3 },
      { size: 'XXL', price: 38000, cost: 24500, stock: 8, lowStockThreshold: 2 },
      { size: 'XXXL', price: 38000, cost: 24500, stock: 6, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'sudadera',
    name: 'Sudadera',
    category: 'Sudadera',
    imageUrl: 'https://picsum.photos/seed/sudadera/200/200',
    sizes: [
      { size: '2', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '4', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '6', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '8', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '10', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '12', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '14', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '16', price: 62000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: 'S', price: 64000, cost: 43000, stock: 8, lowStockThreshold: 3 },
      { size: 'M', price: 64000, cost: 43000, stock: 6, lowStockThreshold: 2 },
      { size: 'L', price: 64000, cost: 43000, stock: 4, lowStockThreshold: 2 },
      { size: 'XL', price: 64000, cost: 43000, stock: 4, lowStockThreshold: 2 },
      { size: 'XXL', price: 66000, cost: 44000, stock: 3, lowStockThreshold: 1 },
      { size: 'XXXL', price: 66000, cost: 44000, stock: 2, lowStockThreshold: 1 },
    ],
  },
  {
    id: 'chaqueta',
    name: 'Chaqueta',
    category: 'Chaqueta',
    imageUrl: 'https://picsum.photos/seed/chaquetauniforme/200/200',
    sizes: [
      { size: '2', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '4', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '6', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '8', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '10', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '12', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '14', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '16', price: 78000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: 'S', price: 80000, cost: 54000, stock: 9, lowStockThreshold: 2 },
      { size: 'M', price: 80000, cost: 54000, stock: 5, lowStockThreshold: 2 },
      { size: 'L', price: 80000, cost: 54000, stock: 3, lowStockThreshold: 1 },
      { size: 'XL', price: 80000, cost: 54000, stock: 3, lowStockThreshold: 1 },
      { size: 'XXL', price: 82000, cost: 55000, stock: 2, lowStockThreshold: 1 },
      { size: 'XXXL', price: 82000, cost: 55000, stock: 2, lowStockThreshold: 1 },
    ],
  },
];

export interface SaleItem {
  uniformId: string;
  uniformName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  totalCost: number;
}

export type PaymentMethod = 'efectivo' | 'transferencia';

export interface Sale {
  id: string; 
  date: string; 
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  totalCostAmount: number;
  totalProfit: number;
  paymentMethod: PaymentMethod;
  paymentProofFileName?: string;
  generatedBy: string; 
  generatedByRole?: 'admin' | 'secretary'; 
}

export let mockSales: Sale[] = []; 

export const setMockSales = (newSales: Sale[]) => {
  mockSales = newSales;
};

export interface StockEntryItemDetails {
  uniformId: string;
  uniformName: string;
  category: Uniform['category'];
  size: string;
  quantityAdded: number;
}

export interface StockEntry {
  id: string; 
  date: string; 
  recordedAt: string; 
  enteredBy: string; 
  enteredByRole?: 'admin' | 'secretary';
  items: StockEntryItemDetails[];
  totalQuantityAdded: number;
  notes?: string;
}

export let mockStockEntries: StockEntry[] = [];

export const setMockStockEntries = (newEntries: StockEntry[]) => {
  mockStockEntries = newEntries;
};


export const deleteSaleFromStorage = (saleIdToDelete: string): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Update Sales
  const storedSalesRaw = localStorage.getItem('mockSales');
  let currentSales: Sale[] = storedSalesRaw ? JSON.parse(storedSalesRaw) : [];
  const saleToDeleteDetails = currentSales.find(s => s.id === saleIdToDelete);

  if (!saleToDeleteDetails) {
    console.error("Sale to delete not found in localStorage.");
    return false;
  }

  currentSales = currentSales.filter(s => s.id !== saleIdToDelete);
  localStorage.setItem('mockSales', JSON.stringify(currentSales));
  setMockSales(currentSales); // Update in-memory mock if used elsewhere

  // 2. Update Uniform Stock
  const storedUniformsRaw = localStorage.getItem('updatedUniformsData');
  let currentUniformsData: Uniform[] = storedUniformsRaw ? JSON.parse(storedUniformsRaw) : JSON.parse(JSON.stringify(initialUniforms)); // Fallback to initial if not found

  saleToDeleteDetails.items.forEach(soldItem => {
    currentUniformsData = currentUniformsData.map(uni => {
      if (uni.id === soldItem.uniformId) {
        return {
          ...uni,
          sizes: uni.sizes.map(s => {
            if (s.size === soldItem.size) {
              // Ensure stock does not go below zero from multiple deletions or errors.
              const newStock = (s.stock || 0) + soldItem.quantity;
              return { ...s, stock: newStock < 0 ? 0 : newStock }; // Add back stock
            }
            return s;
          })
        };
      }
      return uni;
    });
  });
  localStorage.setItem('updatedUniformsData', JSON.stringify(currentUniformsData));
  return true;
};


// Initialize data from localStorage if available
if (typeof window !== 'undefined') {
  const storedSales = localStorage.getItem('mockSales');
  if (storedSales) {
    try {
      mockSales = JSON.parse(storedSales);
    } catch (e) {
      console.error("Failed to parse mockSales from localStorage", e);
      localStorage.setItem('mockSales', JSON.stringify([])); // Reset if corrupt
      mockSales = [];
    }
  } else {
    localStorage.setItem('mockSales', JSON.stringify([])); // Initialize if not present
  }

  const storedUniforms = localStorage.getItem('updatedUniformsData');
  if (!storedUniforms) {
      localStorage.setItem('updatedUniformsData', JSON.stringify(initialUniforms));
  }

  const storedStockEntries = localStorage.getItem('stockEntryHistory');
  if (storedStockEntries) {
    try {
      mockStockEntries = JSON.parse(storedStockEntries);
    } catch (e) {
      console.error("Failed to parse stockEntryHistory from localStorage", e);
      localStorage.setItem('stockEntryHistory', JSON.stringify([])); // Reset if corrupt
      mockStockEntries = [];
    }
  } else {
     localStorage.setItem('stockEntryHistory', JSON.stringify([])); // Initialize if not present
  }
}
