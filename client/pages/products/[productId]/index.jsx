import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function getMeta() {
  return {
    title: `${title} - Product`,
  };
}

export default function Product() {
  const { snapshot, state, actions } = useRouteContext();
  const { productId } = useParams();

  const addToCart = (product) => () => {
    actions.addToCart(state, product);
  };

  const needsProduct =
    !snapshot?.product || String(snapshot.product.id) !== String(productId);

  if (needsProduct && actions && state._loadingProduct !== productId) {
    state._loadingProduct = productId;
    async function fetchProduct() {
      await actions.getProductById(state, productId);
      state._loadingProduct = null;
    }
    fetchProduct();
  }

  if (needsProduct) {
    return <div>Loading product...</div>;
  }

  return (
    <div className="pb-48">
      <div className="flex gap-2 text-h5 pt-6 pb-8 font-semibold">
        <Link to="/products">
          <p className="text-dark-grey">Residential Products</p>
        </Link>
        / <p>{snapshot.product.name}</p>
      </div>
      <div className="flex items-center">
        <div className="p-10 w-2/5 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
          <img
            src={snapshot.product.imageUrl}
            alt={snapshot.product.name}
            className=""
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="w-1/2 pl-28 flex flex-col gap-12">
          <p className="text-h3 font-semibold">{snapshot.product.name}</p>
          <p className="text-md text-dark-grey">
            {snapshot.product.description}
          </p>
          <p className="text-h4 text-dark-grey font-semibold">
            {snapshot.product.price
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumSignificantDigits: 1,
                }).format(snapshot.product.price)
              : 'Call for price'}
          </p>
          <button
            className="text-white bg-purple-40 rounded-full text-semibold py-2.5 px-5 cursor-pointer max-w-min text-nowrap disabled:cursor-not-allowed disabled:opacity-20 shadow-lg shadow-purple-40/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-40/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            onClick={addToCart(snapshot.product)}
            disabled={!snapshot.product.price}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
