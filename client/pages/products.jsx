import { useEffect } from 'react';
import { SimpleGrid } from '@mantine/core';
import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { Product } from '@/components/ui/Product.jsx';
import { Cart } from '@/components/ui/Cart.jsx';

export function getMeta() {
  return {
    title: `${title} - Products`,
  };
}

export default function Products() {
  const { snapshot, state, actions } = useRouteContext();

  useEffect(() => {
    async function fetchProducts() {
      await actions.getProducts(state);
    }
    fetchProducts();
  }, []);

  if (
    !snapshot ||
    snapshot.products == null ||
    snapshot.products.length === 0
  ) {
    return <div>No products found</div>;
  }

  return (
    <SimpleGrid cols={4}>
      {snapshot.products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </SimpleGrid>
  );
}
