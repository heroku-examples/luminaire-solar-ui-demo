'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronRight, ShoppingCart } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { product, setProduct, addToCart } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await api.getProductById(productId);
      setProduct(data);
    };

    if (!product || product.id !== productId) {
      fetchProduct();
    }
  }, [productId, product, setProduct]);

  if (!product || product.id !== productId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading product...</div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (!price) return 'Call for price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumSignificantDigits: 1,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium mb-8">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-primary"
        >
          Residential Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative">
          {product.imageUrl && (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-8 hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-lg text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="text-2xl font-semibold text-gray-700">
            {formatPrice(product.price)}
          </div>

          <Button
            onClick={() => addToCart(product)}
            disabled={!product.price}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to cart
          </Button>

          {/* Additional Product Details */}
          {product.specifications && (
            <div className="pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
