export interface UniformSize {
  size: string;
  price: number;
  stock: number;
  lowStockThreshold: number; // Threshold to trigger low stock alert
}

export interface Uniform {
  id: string;
  name: string; // e.g., "Polo de gala (Hombre)"
  category: string; // e.g., "Polo de gala", "Falda de gala"
  imageUrl?: string; // Optional, for placeholder image
  sizes: UniformSize[];
}

export const initialUniforms: Uniform[] = [
  {
    id: 'polo-gala-h',
    name: 'Polo de gala (Hombre)',
    category: 'Prenda Superior',
    imageUrl: 'https://picsum.photos/seed/pologalah/200/200',
    sizes: [
      { size: '2', price: 250, stock: 18, lowStockThreshold: 5 },
      { size: '4', price: 250, stock: 22, lowStockThreshold: 5 },
      { size: '6', price: 260, stock: 15, lowStockThreshold: 5 },
      { size: 'S', price: 280, stock: 12, lowStockThreshold: 3 },
      { size: 'M', price: 280, stock: 3, lowStockThreshold: 3 }, // Low stock example
      { size: 'L', price: 280, stock: 8, lowStockThreshold: 3 },
      { size: 'XL', price: 300, stock: 7, lowStockThreshold: 2 },
      { size: 'XXL', price: 300, stock: 0, lowStockThreshold: 2 }, // Out of stock example
      { size: 'XXXL', price: 320, stock: 4, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'polo-gala-m',
    name: 'Polo de gala (Mujer)',
    category: 'Prenda Superior',
    imageUrl: 'https://picsum.photos/seed/pologalam/200/200',
    sizes: [
      { size: '2', price: 250, stock: 20, lowStockThreshold: 5 },
      { size: '4', price: 250, stock: 25, lowStockThreshold: 5 },
      { size: 'S', price: 280, stock: 18, lowStockThreshold: 3 },
      { size: 'M', price: 280, stock: 13, lowStockThreshold: 3 },
      { size: 'L', price: 280, stock: 9, lowStockThreshold: 3 },
    ],
  },
  {
    id: 'falda-gala',
    name: 'Falda de gala (Mujer)',
    category: 'Prenda Inferior',
    imageUrl: 'https://picsum.photos/seed/faldagala/200/200',
    sizes: [
      { size: '4', price: 300, stock: 15, lowStockThreshold: 4 },
      { size: '6', price: 300, stock: 12, lowStockThreshold: 4 },
      { size: '8', price: 320, stock: 10, lowStockThreshold: 3 },
      { size: 'S', price: 350, stock: 7, lowStockThreshold: 2 },
      { size: 'M', price: 350, stock: 6, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'camiseta-deportiva',
    name: 'Camiseta deportiva',
    category: 'Deportivo',
    imageUrl: 'https://picsum.photos/seed/camisetadep/200/200',
    sizes: [
      { size: '2', price: 180, stock: 30, lowStockThreshold: 8 },
      { size: '4', price: 180, stock: 28, lowStockThreshold: 8 },
      { size: 'S', price: 200, stock: 20, lowStockThreshold: 5 },
      { size: 'M', price: 200, stock: 22, lowStockThreshold: 5 },
      { size: 'L', price: 200, stock: 15, lowStockThreshold: 5 },
      { size: 'XL', price: 220, stock: 10, lowStockThreshold: 3 },
    ],
  },
  {
    id: 'sudadera-deportiva',
    name: 'Sudadera deportiva',
    category: 'Deportivo',
    imageUrl: 'https://picsum.photos/seed/sudaderadep/200/200',
    sizes: [
      { size: 'S', price: 450, stock: 10, lowStockThreshold: 3 },
      { size: 'M', price: 450, stock: 8, lowStockThreshold: 3 },
      { size: 'L', price: 450, stock: 6, lowStockThreshold: 2 },
      { size: 'XL', price: 480, stock: 4, lowStockThreshold: 2 },
    ],
  },
  {
    id: 'chaqueta',
    name: 'Chaqueta',
    category: 'Abrigo',
    imageUrl: 'https://picsum.photos/seed/chaqueta/200/200',
    sizes: [
      { size: 'S', price: 550, stock: 7, lowStockThreshold: 2 },
      { size: 'M', price: 550, stock: 9, lowStockThreshold: 2 },
      { size: 'L', price: 550, stock: 5, lowStockThreshold: 2 },
      { size: 'XL', price: 580, stock: 3, lowStockThreshold: 1 },
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

export interface Sale {
  id: string;
  date: string; // ISO string
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  generatedBy: string; // 'admin' | 'secretary'
}

// Mock sales data
export const mockSales: Sale[] = [
  {
    id: 'sale001',
    date: new Date().toISOString(),
    customerName: 'Ana Pérez',
    items: [
      { uniformId: 'polo-gala-h', uniformName: 'Polo de gala (Hombre)', size: 'M', quantity: 1, unitPrice: 280, totalPrice: 280 },
      { uniformId: 'falda-gala', uniformName: 'Falda de gala (Mujer)', size: 'S', quantity: 1, unitPrice: 350, totalPrice: 350 },
    ],
    totalAmount: 630,
    generatedBy: 'admin',
  }
];
