import { useEffect } from 'react';
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
    <div className="pb-12">
      <h1 className="text-h3 font-semibold py-7">Residential Products</h1>
      <div className="flex flex-row gap-x-5 gap-y-12 flex-wrap ">
        {snapshot.products.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
