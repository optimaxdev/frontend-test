import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import './CartSummary.css';

/**
 * Displays the cart totals (item count, total price) and a Checkout button.
 * The checkout button shows a confirmation message when clicked.
 */
const CartSummary: React.FC = () => {
  const items = useAppSelector((state) => state.cart.items);
  const [checkedOut, setCheckedOut] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setCheckedOut(true);
  };

  return (
    <section className="cart-summary" aria-label="Order summary">
      <h2 className="cart-summary__title">Summary</h2>

      <dl className="cart-summary__list">
        <div className="cart-summary__row">
          <dt>Items</dt>
          <dd>{totalItems}</dd>
        </div>
        <div className="cart-summary__row cart-summary__row--total">
          <dt>Total</dt>
          <dd aria-label={`Total: $${totalPrice.toFixed(2)}`}>${totalPrice.toFixed(2)}</dd>
        </div>
      </dl>

      {checkedOut ? (
        <p className="cart-summary__success" role="status" aria-live="polite">
          ✅ Order placed successfully!
        </p>
      ) : (
        <button
          className="cart-summary__checkout"
          onClick={handleCheckout}
          disabled={items.length === 0}
          aria-disabled={items.length === 0}
        >
          Checkout
        </button>
      )}
    </section>
  );
};

export default CartSummary;
