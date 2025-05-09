export interface UniformSize {
  size: string;
  price: number; // Prices in COP
  stock: number;
  lowStockThreshold: number; // Threshold to trigger low stock alert
}

export interface Uniform {
  id: string;
  name: string; 
  category: string; 
  imageUrl?: string; 
  sizes: UniformSize[];
}

export const initialUniforms: Uniform[] = [
  {
    id: 'polo-h',
    name: 'Camiseta Polo (Hombre)',
    category: 'Prenda Superior',
    imageUrl: 'https://picsum.photos/seed/polohombre/200/200',
    sizes: [
      { size: '2', price: 36000, stock: 18, lowStockThreshold: 5 },
      { size: '4', price: 36000, stock: 22, lowStockThreshold: 5 },
      { size: '6', price: 36000, stock: 15, lowStockThreshold: 5 },
      { size: '8', price: 36000, stock: 15, lowStockThreshold: 5 },
      { size: '10', price: 36000, stock: 15, lowStockThreshold: 5 },
      { size: '12', price: 36000, stock: 15, lowStockThreshold: 5 },
      { size: '14', price: 36000, stock: 15, lowStockThreshold: 5 },
      { size: '16', price: 36000, stock: 15, lowStockThreshold: 5 },
      { size: 'S', price: 38000, stock: 12, lowStockThreshold: 3 },
      { size: 'M', price: 38000, stock: 3, lowStockThreshold: 3 },
      { size: 'L', price: 38000, stock: 8, lowStockThreshold: 3 },
      { size: 'XL', price: 38000, stock: 7, lowStockThreshold: 2 },
      { size: 'XXL', price: 38000, stock: 0, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'polo-m',
    name: 'Camiseta Polo (Mujer)',
    category: 'Prenda Superior',
    imageUrl: 'https://picsum.photos/seed/polomujer/200/200',
    sizes: [
      { size: '2', price: 36000, stock: 20, lowStockThreshold: 5 },
      { size: '4', price: 36000, stock: 25, lowStockThreshold: 5 },
      { size: '6', price: 36000, stock: 20, lowStockThreshold: 5 },
      { size: '8', price: 36000, stock: 20, lowStockThreshold: 5 },
      { size: '10', price: 36000, stock: 20, lowStockThreshold: 5 },
      { size: '12', price: 36000, stock: 20, lowStockThreshold: 5 },
      { size: '14', price: 36000, stock: 20, lowStockThreshold: 5 },
      { size: '16', price: 36000, stock: 20, lowStockThreshold: 5 },
      { size: 'S', price: 38000, stock: 18, lowStockThreshold: 3 },
      { size: 'M', price: 38000, stock: 13, lowStockThreshold: 3 },
      { size: 'L', price: 38000, stock: 9, lowStockThreshold: 3 },
      { size: 'XL', price: 38000, stock: 9, lowStockThreshold: 3 },
      { size: 'XXL', price: 38000, stock: 9, lowStockThreshold: 3 },
    ],
  },
  {
    id: 'falda',
    name: 'Falda Escolar',
    category: 'Prenda Inferior',
    imageUrl: 'https://picsum.photos/seed/faldaescolar/200/200',
    sizes: [
      { size: '2', price: 36000, stock: 15, lowStockThreshold: 4 },
      { size: '4', price: 36000, stock: 12, lowStockThreshold: 4 },
      { size: '6', price: 36000, stock: 10, lowStockThreshold: 3 },
      { size: '8', price: 36000, stock: 10, lowStockThreshold: 3 },
      { size: '10', price: 36000, stock: 10, lowStockThreshold: 3 },
      { size: '12', price: 36000, stock: 10, lowStockThreshold: 3 },
      { size: '14', price: 36000, stock: 10, lowStockThreshold: 3 },
      { size: '16', price: 36000, stock: 10, lowStockThreshold: 3 },
      { size: 'S', price: 38000, stock: 7, lowStockThreshold: 2 },
      { size: 'M', price: 38000, stock: 6, lowStockThreshold: 2 },
      { size: 'L', price: 38000, stock: 6, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'camiseta-deporte',
    name: 'Camiseta Deporte',
    category: 'Deportivo',
    imageUrl: 'https://picsum.photos/seed/camisetadeporte/200/200',
    sizes: [
      { size: '2', price: 32000, stock: 30, lowStockThreshold: 8 },
      { size: '4', price: 32000, stock: 28, lowStockThreshold: 8 },
      { size: '6', price: 32000, stock: 28, lowStockThreshold: 8 },
      { size: '8', price: 32000, stock: 28, lowStockThreshold: 8 },
      { size: '10', price: 32000, stock: 28, lowStockThreshold: 8 },
      { size: '12', price: 32000, stock: 28, lowStockThreshold: 8 },
      { size: '14', price: 32000, stock: 28, lowStockThreshold: 8 },
      { size: '16', price: 32000, stock: 28, lowStockThreshold: 8 },
      { size: 'S', price: 34000, stock: 20, lowStockThreshold: 5 },
      { size: 'M', price: 34000, stock: 22, lowStockThreshold: 5 },
      { size: 'L', price: 34000, stock: 15, lowStockThreshold: 5 },
      { size: 'XL', price: 34000, stock: 10, lowStockThreshold: 3 },
    ],
  },
  {
    id: 'sudadera',
    name: 'Sudadera',
    category: 'Deportivo',
    imageUrl: 'https://picsum.photos/seed/sudadera/200/200',
    sizes: [
      { size: '2', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: '4', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: '6', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: '8', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: '10', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: '12', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: '14', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: '16', price: 60000, stock: 10, lowStockThreshold: 3 },
      { size: 'S', price: 62000, stock: 8, lowStockThreshold: 3 },
      { size: 'M', price: 62000, stock: 6, lowStockThreshold: 2 },
      { size: 'L', price: 62000, stock: 4, lowStockThreshold: 2 },
      { size: 'XL', price: 62000, stock: 4, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'chaqueta',
    name: 'Chaqueta',
    category: 'Abrigo',
    imageUrl: 'https://picsum.photos/seed/chaquetauniforme/200/200',
    sizes: [
      { size: '2', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: '4', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: '6', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: '8', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: '10', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: '12', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: '14', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: '16', price: 75000, stock: 7, lowStockThreshold: 2 },
      { size: 'S', price: 78000, stock: 9, lowStockThreshold: 2 },
      { size: 'M', price: 78000, stock: 5, lowStockThreshold: 2 },
      { size: 'L', price: 78000, stock: 3, lowStockThreshold: 1 },
      { size: 'XL', price: 78000, stock: 3, lowStockThreshold: 1 },
    ],
  },
];

export interface SaleItem {
  uniformId: string;
  uniformName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'efectivo' | 'transferencia';

export interface Sale {
  id: string;
  date: string; // ISO string
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentProofFileName?: string; // Store filename for mock
  generatedBy: string; // 'admin' | 'secretary'
}

// Mock sales data
export const mockSales: Sale[] = [
  {
    id: 'sale001',
    date: new Date().toISOString(),
    customerName: 'Ana Pérez',
    items: [
      { uniformId: 'polo-h', uniformName: 'Camiseta Polo (Hombre)', size: 'M', quantity: 1, unitPrice: 38000, totalPrice: 38000 },
      { uniformId: 'falda', uniformName: 'Falda Escolar', size: 'S', quantity: 1, unitPrice: 38000, totalPrice: 38000 },
    ],
    totalAmount: 76000,
    paymentMethod: 'efectivo',
    generatedBy: 'admin',
  }
];
