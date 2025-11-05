import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { Product } from '@/components/ui/Product.jsx';

export function getMeta() {
  return {
    title: `${title} - Products`,
  };
}

export default function Products() {
  const { snapshot, state, actions } = useRouteContext();

  const needsProducts = !snapshot?.products || snapshot.products.length === 0;

  if (needsProducts && actions && !state._loadingProducts) {
    state._loadingProducts = true;
    async function fetchProducts() {
      await actions.getProducts(state);
      state._loadingProducts = false;
    }
    fetchProducts();
  }

  if (needsProducts) {
    return <div>Loading products...</div>;
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
