import { useRouteContext } from '/:core.jsx';
import CartIcon from '../icons/CartIcon';
import { useState } from 'react';

function CartList({ cart }) {
  const { state, actions } = useRouteContext();
  const empty = cart.length === 0;

  const removeFromCart = (item) => () => {
    actions.removeFromCart(state, item);
  };

  if (empty) {
    return <p className="text-dark-grey">No items in cart</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {cart.map((item) => {
        return (
          <div className="flex justify-between items-center">
            <div className="flex gap-4 w-3/4">
              <p className="text-dark-grey w-1/2 overflow-x-hidden overflow-ellipsis">
                {item.name}
              </p>
              <p className="pl-4">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumSignificantDigits: 1,
                }).format(item.price)}
              </p>
              <p>x</p>
              <p className="">{item.quantity}</p>
            </div>
            <button className="text-heroku-red" onClick={removeFromCart(item)}>
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function Cart() {
  const { snapshot } = useRouteContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex">
      <div className="relative flex">
        <button onClick={() => setOpen((prev) => !prev)}>
          <CartIcon />
          {snapshot.cart?.length > 0 && (
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 h-2.5 w-2.5 bg-heroku-red rounded-full"></div>
          )}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 -translate-x-[75%] translate-y-1/2 bg-lightest-grey p-5 border-dark-gray border-2 text-nowrap w-[33vw]">
          <CartList cart={snapshot.cart} />
        </div>
      )}
    </div>
  );
}
