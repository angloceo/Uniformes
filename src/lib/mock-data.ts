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
  category: 'Camiseta Polo' | 'Falda' | 'Camiseta Deporte' | 'Sudadera' | 'Chaqueta'; // More specific categories
  imageUrl?: string; 
  sizes: UniformSize[];
}

export const initialUniforms: Uniform[] = [
  {
    id: 'polo-unisex', // Changed ID
    name: 'Camiseta Polo', // Changed name
    category: 'Camiseta Polo',
    imageUrl: 'https://picsum.photos/seed/polounisex/200/200', // Changed image seed
    sizes: [ // Merged sizes from (Hombre) and (Mujer), taking higher stock for overlaps
      { size: '2', price: 36000, cost: 25000, stock: 20, lowStockThreshold: 5 }, // Max stock was 20
      { size: '4', price: 36000, cost: 25000, stock: 25, lowStockThreshold: 5 }, // Max stock was 25
      { size: '6', price: 36000, cost: 25000, stock: 20, lowStockThreshold: 5 }, // Max stock was 20
      { size: '8', price: 36000, cost: 25000, stock: 20, lowStockThreshold: 5 }, // Max stock was 20
      { size: '10', price: 36000, cost: 25000, stock: 20, lowStockThreshold: 5 }, // Max stock was 20
      { size: '12', price: 36000, cost: 25000, stock: 20, lowStockThreshold: 5 }, // Max stock was 20
      { size: '14', price: 36000, cost: 25000, stock: 20, lowStockThreshold: 5 }, // Max stock was 20
      { size: '16', price: 36000, cost: 25000, stock: 20, lowStockThreshold: 5 }, // Max stock was 20
      { size: 'S', price: 38000, cost: 26000, stock: 18, lowStockThreshold: 3 }, // Max stock was 18
      { size: 'M', price: 38000, cost: 26000, stock: 13, lowStockThreshold: 3 }, // Max stock was 13
      { size: 'L', price: 38000, cost: 26000, stock: 9, lowStockThreshold: 3 },  // Max stock was 9
      { size: 'XL', price: 38000, cost: 26000, stock: 9, lowStockThreshold: 3 }, // Max stock was 9
      { size: 'XXL', price: 38000, cost: 26000, stock: 9, lowStockThreshold: 2 },// Max stock was 9 (from Mujer)
    ],
  },
  // Camiseta Polo (Mujer) is removed as it's merged into Camiseta Polo (Unisex)
  {
    id: 'falda',
    name: 'Falda Escolar',
    category: 'Falda',
    imageUrl: 'https://picsum.photos/seed/faldaescolar/200/200',
    sizes: [
      { size: '2', price: 36000, cost: 24000, stock: 15, lowStockThreshold: 4 },
      { size: '4', price: 36000, cost: 24000, stock: 12, lowStockThreshold: 4 },
      { size: '6', price: 36000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '8', price: 36000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '10', price: 36000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '12', price: 36000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '14', price: 36000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: '16', price: 36000, cost: 24000, stock: 10, lowStockThreshold: 3 },
      { size: 'S', price: 38000, cost: 25500, stock: 7, lowStockThreshold: 2 },
      { size: 'M', price: 38000, cost: 25500, stock: 6, lowStockThreshold: 2 },
      { size: 'L', price: 38000, cost: 25500, stock: 6, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'camiseta-deporte',
    name: 'Camiseta Deporte',
    category: 'Camiseta Deporte',
    imageUrl: 'https://picsum.photos/seed/camisetadeporte/200/200',
    sizes: [
      { size: '2', price: 32000, cost: 22000, stock: 30, lowStockThreshold: 8 },
      { size: '4', price: 32000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '6', price: 32000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '8', price: 32000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '10', price: 32000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '12', price: 32000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '14', price: 32000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: '16', price: 32000, cost: 22000, stock: 28, lowStockThreshold: 8 },
      { size: 'S', price: 34000, cost: 23500, stock: 20, lowStockThreshold: 5 },
      { size: 'M', price: 34000, cost: 23500, stock: 22, lowStockThreshold: 5 },
      { size: 'L', price: 34000, cost: 23500, stock: 15, lowStockThreshold: 5 },
      { size: 'XL', price: 34000, cost: 23500, stock: 10, lowStockThreshold: 3 },
    ],
  },
  {
    id: 'sudadera',
    name: 'Sudadera',
    category: 'Sudadera',
    imageUrl: 'https://picsum.photos/seed/sudadera/200/200',
    sizes: [
      { size: '2', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '4', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '6', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '8', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '10', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '12', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '14', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: '16', price: 60000, cost: 42000, stock: 10, lowStockThreshold: 3 },
      { size: 'S', price: 62000, cost: 43000, stock: 8, lowStockThreshold: 3 },
      { size: 'M', price: 62000, cost: 43000, stock: 6, lowStockThreshold: 2 },
      { size: 'L', price: 62000, cost: 43000, stock: 4, lowStockThreshold: 2 },
      { size: 'XL', price: 62000, cost: 43000, stock: 4, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'chaqueta',
    name: 'Chaqueta',
    category: 'Chaqueta',
    imageUrl: 'https://picsum.photos/seed/chaquetauniforme/200/200',
    sizes: [
      { size: '2', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '4', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '6', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '8', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '10', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '12', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '14', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: '16', price: 75000, cost: 52000, stock: 7, lowStockThreshold: 2 },
      { size: 'S', price: 78000, cost: 54000, stock: 9, lowStockThreshold: 2 },
      { size: 'M', price: 78000, cost: 54000, stock: 5, lowStockThreshold: 2 },
      { size: 'L', price: 78000, cost: 54000, stock: 3, lowStockThreshold: 1 },
      { size: 'XL', price: 78000, cost: 54000, stock: 3, lowStockThreshold: 1 },
    ],
  },
];

export interface SaleItem {
  uniformId: string;
  uniformName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // Added unitCost for profit calculation
  totalPrice: number;
  totalCost: number; // Added totalCost for profit calculation
}

export type PaymentMethod = 'efectivo' | 'transferencia';

export interface Sale {
  id: string;
  date: string; // ISO string
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  totalCostAmount: number; // Total cost of goods sold
  totalProfit: number; // Total profit from the sale
  paymentMethod: PaymentMethod;
  paymentProofFileName?: string; // Store filename for mock
  generatedBy: string; // 'admin' | 'secretary'
}

// Mock sales data
export let mockSales: Sale[] = [ // Changed to let for potential updates
  {
    id: 'sale001',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    customerName: 'Ana Pérez',
    items: [
      { uniformId: 'polo-unisex', uniformName: 'Camiseta Polo', size: 'M', quantity: 1, unitPrice: 38000, unitCost: 26000, totalPrice: 38000, totalCost: 26000 },
      { uniformId: 'falda', uniformName: 'Falda Escolar', size: 'S', quantity: 1, unitPrice: 38000, unitCost: 25500, totalPrice: 38000, totalCost: 25500 },
    ],
    totalAmount: 76000,
    totalCostAmount: 51500,
    totalProfit: 24500,
    paymentMethod: 'efectivo',
    generatedBy: 'admin',
  },
  {
    id: 'sale002',
    date: new Date().toISOString(), // Today
    customerName: 'Carlos López',
    items: [
      { uniformId: 'camiseta-deporte', uniformName: 'Camiseta Deporte', size: '10', quantity: 2, unitPrice: 32000, unitCost: 22000, totalPrice: 64000, totalCost: 44000 },
    ],
    totalAmount: 64000,
    totalCostAmount: 44000,
    totalProfit: 20000,
    paymentMethod: 'transferencia',
    paymentProofFileName: 'comprobante_clopez.pdf',
    generatedBy: 'secretary',
  }
];
// Function to update mock sales if needed, for example, from localStorage
export const setMockSales = (newSales: Sale[]) => {
  mockSales = newSales;
};
