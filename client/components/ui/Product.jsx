import {
  Card,
  Image,
  Text,
  Group,
  Center,
  Button,
  NumberFormatter,
} from '@mantine/core';
import { useRouteContext } from '/:core.jsx';
import classes from '@/components/ui/Product.module.css';
import { Link } from 'react-router-dom';

export function Product({ product, className }) {
  const { state, actions } = useRouteContext();

  const loggedIn = state.user && state.user.username != null;

  const addToCart = (product) => () => {
    actions.addToCart(state, product);
  };

  return (
    <div
      className={`w-80 bg-white p-10 flex flex-col border-light-grey border-[1px] rounded-xl shadow-md shadow-black/10 ${className}`}
    >
      <div className="flex flex-col">
        <p className="text-h4 font-semibold text-nowrap overflow-x-clip text-ellipsis">
          {product.name}
        </p>
        <p className="pt-3 text-lg text-dark-grey">
          {product.price
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumSignificantDigits: 1,
              }).format(product.price)
            : 'Call for price'}
        </p>
        <img src={product.imageUrl} className="w-40 mx-auto pt-2" />
      </div>
      <hr className="-mx-10 mt-6" />
      <div className="flex flex-col pt-6">
        <p className="line-clamp-3 text-dark-grey">{product.description}</p>
        <div className="flex pt-14 items-center">
          <Link to={`/products/${product.id}`}>
            <p className="text-primary-color font-semibold underline underline-offset-4 cursor-pointer">
              Learn more
            </p>
          </Link>
          <button
            className="ml-7 text-white bg-primary-color rounded-full text-semibold py-2.5 px-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-20"
            onClick={addToCart(product)}
            disabled={!product.price}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
