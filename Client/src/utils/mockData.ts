import { Product, Category, Brand, Invoice, ProductVariant } from '../types';

const categories: Category[] = [
  { id: '1', name: 'T-Shirts', slug: 't-shirts', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Jeans', slug: 'jeans', createdAt: new Date('2024-01-02') },
  { id: '3', name: 'Shoes', slug: 'shoes', createdAt: new Date('2024-01-03') },
  { id: '4', name: 'Jackets', slug: 'jackets', createdAt: new Date('2024-01-04') },
  { id: '5', name: 'Accessories', slug: 'accessories', createdAt: new Date('2024-01-05') }
];

const brands: Brand[] = [
  { id: '1', name: 'Nike', slug: 'nike', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Adidas', slug: 'adidas', createdAt: new Date('2024-01-02') },
  { id: '3', name: 'Levi\'s', slug: 'levis', createdAt: new Date('2024-01-03') },
  { id: '4', name: 'H&M', slug: 'hm', createdAt: new Date('2024-01-04') },
  { id: '5', name: 'Zara', slug: 'zara', createdAt: new Date('2024-01-05') }
];

const generateBarcode = () => Math.random().toString().slice(2, 15);

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Navy', 'Brown'];

const generateVariants = (productName: string): ProductVariant[] => {
  const variants: ProductVariant[] = [];
  const selectedSizes = sizes.slice(0, Math.floor(Math.random() * 4) + 3);
  const selectedColors = colors.slice(0, Math.floor(Math.random() * 3) + 2);

  selectedSizes.forEach(size => {
    selectedColors.forEach(color => {
      variants.push({
        id: `${Date.now()}-${Math.random()}`,
        size,
        color,
        price: Math.floor(Math.random() * 5000) + 500,
        stock: Math.floor(Math.random() * 100),
        barcode: generateBarcode(),
        sku: `${productName.substring(0, 3).toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`
      });
    });
  });

  return variants;
};

const products: Product[] = [
  {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    categoryId: '1',
    brandId: '1',
    subcategory: 'Casual',
    variants: generateVariants('Classic Cotton T-Shirt'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Slim Fit Jeans',
    categoryId: '2',
    brandId: '3',
    subcategory: 'Denim',
    variants: generateVariants('Slim Fit Jeans'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '3',
    name: 'Running Shoes',
    categoryId: '3',
    brandId: '1',
    subcategory: 'Sports',
    variants: generateVariants('Running Shoes'),
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '4',
    name: 'Winter Jacket',
    categoryId: '4',
    brandId: '2',
    subcategory: 'Outerwear',
    variants: generateVariants('Winter Jacket'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '5',
    name: 'Casual Sneakers',
    categoryId: '3',
    brandId: '2',
    subcategory: 'Casual',
    variants: generateVariants('Casual Sneakers'),
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  }
];

const invoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'John Doe',
    items: [
      {
        id: '1',
        productId: '1',
        variantId: products[0].variants[0].id,
        productName: 'Classic Cotton T-Shirt',
        size: 'M',
        color: 'Black',
        quantity: 2,
        unitPrice: 1500,
        total: 3000
      }
    ],
    subtotal: 3000,
    tax: 540,
    discount: 0,
    total: 3540,
    paymentMode: 'card',
    createdAt: new Date(),
    status: 'paid'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerName: 'Jane Smith',
    items: [
      {
        id: '2',
        productId: '2',
        variantId: products[1].variants[0].id,
        productName: 'Slim Fit Jeans',
        size: 'L',
        color: 'Blue',
        quantity: 1,
        unitPrice: 2500,
        total: 2500
      }
    ],
    subtotal: 2500,
    tax: 450,
    discount: 250,
    total: 2700,
    paymentMode: 'upi',
    createdAt: new Date(Date.now() - 86400000),
    status: 'paid'
  }
];

export const generateMockData = () => ({
  categories,
  brands,
  products,
  invoices
});