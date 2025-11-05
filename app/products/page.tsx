'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ui/product-card';

export default function ProductsPage() {
  const { products, setProducts } = useStore();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await api.getProducts();
      setProducts(data);
    };

    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, setProducts]);

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Residential Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
