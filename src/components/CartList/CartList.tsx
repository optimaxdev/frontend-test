import React from 'react';
import { useAppSelector } from '../../store/hooks';
import CartItemComponent from '../CartItem/CartItem';
import './CartList.css';

/**
 * Renders the full list of items currently in the cart.
 * Displays a message when the cart is empty.
 */
const CartList: React.FC = () => {
  const { items, loading, error } = useAppSelector((state) => state.cart);

  if (loading) {
    return <p className="cart-list__status" aria-live="polite">Loading cart…</p>;
  }

  if (error) {
    return (
      <p className="cart-list__status cart-list__status--error" role="alert">
        Error: {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="cart-list__status" aria-live="polite">
        Your cart is empty. Add some items above!
      </p>
    );
  }

  return (
    <ul className="cart-list" aria-label="Cart items">
      {items.map((item) => (
        <CartItemComponent key={item.id} item={item} />
      ))}
    </ul>
  );
};

export default CartList;
