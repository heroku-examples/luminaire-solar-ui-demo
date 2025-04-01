import { useEffect, useState } from 'react';
import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { Cart } from '@/components/ui/Cart.jsx';
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

  useEffect(() => {
    async function fetchProduct() {
      await actions.getProductById(state, productId);
    }
    fetchProduct();
  }, []);

  if (!snapshot || snapshot.product == null) {
    return <div>No products found</div>;
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
        <div className="p-10 w-2/5 bg-white border-[1px] border-light-grey rounded-[4px]">
          <img src={snapshot.product.imageUrl} className="" />
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
            className="text-white bg-primary-color rounded-full text-semibold py-2.5 px-5 cursor-pointer max-w-min text-nowrap disabled:cursor-not-allowed disabled:opacity-20"
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
