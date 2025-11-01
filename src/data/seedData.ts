import { User, Product, Customer, Invoice } from '../types';

// Usuario administrador por defecto
export const defaultAdmin: User = {
  id: 'admin-001',
  email: 'admin@elventolero.com',
  name: 'Administrador',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Categorías iniciales
export const initialCategories = [
  { id: 'cat-001', name: 'Abarrotes', description: 'Productos básicos de despensa' },
  { id: 'cat-002', name: 'Bebidas', description: 'Bebidas refrescantes y jugos' },
  { id: 'cat-003', name: 'Lácteos', description: 'Productos lácteos y derivados' },
  { id: 'cat-004', name: 'Carnes', description: 'Carnes frescas y embutidos' },
  { id: 'cat-005', name: 'Frutas y Verduras', description: 'Productos frescos del campo' },
  { id: 'cat-006', name: 'Panadería', description: 'Pan fresco y productos de panadería' },
  { id: 'cat-007', name: 'Limpieza', description: 'Productos de limpieza para el hogar' },
  { id: 'cat-008', name: 'Cuidado Personal', description: 'Productos de higiene personal' },
  { id: 'cat-009', name: 'Snacks', description: 'Bocadillos y golosinas' },
  { id: 'cat-010', name: 'Otros', description: 'Productos varios' }
];

// Productos de ejemplo
export const sampleProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Arroz Tío Pelón 1kg',
    description: 'Arroz blanco de primera calidad',
    price: 1500,
    cost: 1000,
    stock: 50,
    minStock: 10,
    category: 'Abarrotes',
    categoryId: 'cat-001',
    barcode: '7441234567890',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    name: 'Coca Cola 3L',
    description: 'Bebida gaseosa sabor cola 3 litros',
    price: 2500,
    cost: 1800,
    stock: 30,
    minStock: 5,
    category: 'Bebidas',
    categoryId: 'cat-002',
    barcode: '7501234567891',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    name: 'Leche Dos Pinos 1L',
    description: 'Leche entera pasteurizada 1 litro',
    price: 1200,
    cost: 900,
    stock: 25,
    minStock: 8,
    category: 'Lácteos',
    categoryId: 'cat-003',
    barcode: '7441234567892',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    name: 'Pan Baguette',
    description: 'Pan baguette fresco del día',
    price: 800,
    cost: 400,
    stock: 15,
    minStock: 5,
    category: 'Panadería',
    categoryId: 'cat-006',
    barcode: '7441234567893',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    name: 'Pollo por kg',
    description: 'Pollo fresco por kilogramo',
    price: 3500,
    cost: 2800,
    stock: 0,
    minStock: 0,
    category: 'Carnes',
    categoryId: 'cat-004',
    barcode: '7441234567894',
    unit: 'kg' as const,
    isActive: true,
    isPorPeso: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-006',
    name: 'Leche Condensada Nestlé',
    description: 'Leche condensada azucarada 397g',
    price: 1800,
    cost: 1300,
    stock: 20,
    minStock: 5,
    category: 'Lácteos',
    categoryId: 'cat-003',
    barcode: '7613034626844',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-007',
    name: 'Leche en Polvo Klim',
    description: 'Leche en polvo entera fortificada 400g',
    price: 3200,
    cost: 2400,
    stock: 15,
    minStock: 3,
    category: 'Lácteos',
    categoryId: 'cat-003',
    barcode: '7702008123456',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-008',
    name: 'Queso Turrialba',
    description: 'Queso fresco de leche de vaca 500g',
    price: 2800,
    cost: 2000,
    stock: 12,
    minStock: 4,
    category: 'Lácteos',
    categoryId: 'cat-003',
    barcode: '7441234567898',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-009',
    name: 'Yogurt Dos Pinos Fresa',
    description: 'Yogurt de leche con sabor a fresa 200ml',
    price: 650,
    cost: 400,
    stock: 30,
    minStock: 10,
    category: 'Lácteos',
    categoryId: 'cat-003',
    barcode: '7441234567899',
    unit: 'unidad' as const,
    isActive: true,
    isPorPeso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-010',
    name: 'Salchichón por kg',
    description: 'Salchichón fresco por kilogramo',
    price: 4200,
    cost: 3200,
    stock: 0,
    minStock: 0,
    category: 'Carnes',
    categoryId: 'cat-004',
    barcode: '7441234567810',
    unit: 'kg' as const,
    isActive: true,
    isPorPeso: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-011',
    name: 'Tomates por kg',
    description: 'Tomates frescos por kilogramo',
    price: 1800,
    cost: 1200,
    stock: 0,
    minStock: 0,
    category: 'Frutas y Verduras',
    categoryId: 'cat-005',
    barcode: '7441234567811',
    unit: 'kg' as const,
    isActive: true,
    isPorPeso: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-012',
    name: 'Plátanos por kg',
    description: 'Plátanos maduros por kilogramo',
    price: 1200,
    cost: 800,
    stock: 0,
    minStock: 0,
    category: 'Frutas y Verduras',
    categoryId: 'cat-005',
    barcode: '7441234567812',
    unit: 'kg' as const,
    isActive: true,
    isPorPeso: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-013',
    name: 'Cebolla por kg',
    description: 'Cebolla blanca fresca por kilogramo',
    price: 1500,
    cost: 1000,
    stock: 0,
    minStock: 0,
    category: 'Frutas y Verduras',
    categoryId: 'cat-005',
    barcode: '7441234567813',
    unit: 'kg' as const,
    isActive: true,
    isPorPeso: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-014',
    name: 'Queso Fresco por kg',
    description: 'Queso fresco artesanal por kilogramo',
    price: 5600,
    cost: 4200,
    stock: 0,
    minStock: 0,
    category: 'Lácteos',
    categoryId: 'cat-003',
    barcode: '7441234567814',
    unit: 'kg' as const,
    isActive: true,
    isPorPeso: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Clientes de ejemplo con saldos
export const sampleCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: 'María González',
    phone: '8888-1234',
    email: 'maria.gonzalez@email.com',
    balance: 15000,
    lastPurchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cust-002',
    name: 'Carlos Rodríguez',
    phone: '8888-5678',
    email: 'carlos.rodriguez@email.com',
    balance: 8500,
    lastPurchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 días atrás
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cust-003',
    name: 'Ana Jiménez',
    phone: '8888-9012',
    email: 'ana.jimenez@email.com',
    balance: 0,
    lastPurchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días atrás
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cust-004',
    name: 'Luis Morales',
    phone: '8888-3456',
    email: 'luis.morales@email.com',
    balance: 25000,
    lastPurchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 días atrás
    updatedAt: new Date().toISOString()
  }
];

// Facturas de ejemplo para historial
export const sampleInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'FAC-001',
    customerId: 'cust-001',
    customerName: 'María González',
    items: [
      {
        id: 'prod-001',
        name: 'Arroz Tío Pelón 1kg',
        price: 1500,
        quantity: 2,
        total: 3000,
        unit: 'unidad'
      }
    ],
    subtotal: 3000,
    tax: 390,
    discount: 0,
    total: 3390,
    paymentMethod: 'credito',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inv-002',
    invoiceNumber: 'FAC-002',
    customerId: 'cust-002',
    customerName: 'Carlos Rodríguez',
    items: [
      {
        id: 'prod-002',
        name: 'Coca Cola 3L',
        price: 2500,
        quantity: 1,
        total: 2500,
        unit: 'unidad'
      }
    ],
    subtotal: 2500,
    tax: 325,
    discount: 0,
    total: 2825,
    paymentMethod: 'credito',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Función para inicializar datos
export const initializeData = () => {
  // Verificar si ya existen datos en localStorage
  const existingProducts = localStorage.getItem('products');
  const existingCategories = localStorage.getItem('categories');
  const existingUsers = localStorage.getItem('users');
  const existingCustomers = localStorage.getItem('customers');
  const existingInvoices = localStorage.getItem('invoices');

  // Inicializar productos si no existen
  if (!existingProducts) {
    localStorage.setItem('products', JSON.stringify(sampleProducts));
    console.log('✅ Productos de ejemplo inicializados');
  }

  // Inicializar categorías si no existen
  if (!existingCategories) {
    localStorage.setItem('categories', JSON.stringify(initialCategories));
    console.log('✅ Categorías iniciales creadas');
  }

  // Inicializar usuario admin si no existe
  if (!existingUsers) {
    localStorage.setItem('users', JSON.stringify([defaultAdmin]));
    console.log('✅ Usuario administrador creado');
  }

  // Inicializar clientes si no existen
  if (!existingCustomers) {
    localStorage.setItem('customers', JSON.stringify(sampleCustomers));
    console.log('✅ Clientes de ejemplo inicializados');
  }

  // Inicializar facturas si no existen
  if (!existingInvoices) {
    localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
    console.log('✅ Facturas de ejemplo inicializadas');
  }

  // Inicializar contadores si no existen
  const existingInvoiceCounter = localStorage.getItem('invoiceCounter');
  if (!existingInvoiceCounter) {
    localStorage.setItem('invoiceCounter', '1');
    console.log('✅ Contador de facturas inicializado');
  }

  // Inicializar configuración del sistema
  const systemConfig = {
    maxDiscount: 50, // Máximo descuento permitido en %
    maxCashDifference: 5000, // Diferencia máxima sin nota en ₡
    taxRate: 13, // IVA en %
    storeName: 'El Ventolero',
    storeAddress: 'Dirección de la tienda',
    storePhone: '2222-2222',
    storeEmail: 'info@elventolero.com'
  };

  const existingConfig = localStorage.getItem('systemConfig');
  if (!existingConfig) {
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
    console.log('✅ Configuración del sistema inicializada');
  }

  console.log('🎉 Datos iniciales del sistema cargados correctamente');
};

// Función para limpiar todos los datos de ejemplo
export const clearAllSampleData = () => {
  // Limpiar clientes de ejemplo
  localStorage.setItem('customers', JSON.stringify([]));
  console.log('🗑️ Clientes de ejemplo eliminados');

  // Limpiar facturas de ejemplo
  localStorage.setItem('invoices', JSON.stringify([]));
  console.log('🗑️ Facturas de ejemplo eliminadas');

  // Limpiar productos de ejemplo (opcional - mantener categorías)
  localStorage.setItem('products', JSON.stringify([]));
  console.log('🗑️ Productos de ejemplo eliminados');

  // Reiniciar contador de facturas
  localStorage.setItem('invoiceCounter', '1');
  console.log('🔄 Contador de facturas reiniciado');

  console.log('✅ Todos los datos de ejemplo han sido eliminados');
  console.log('💡 Recarga la página para ver los cambios');
};

export const reinitializeProducts = () => {
  localStorage.setItem('products', JSON.stringify(sampleProducts));
  console.log('✅ Productos reinicializados');
};