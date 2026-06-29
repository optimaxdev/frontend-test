import React from 'react';
import type { CartItem as CartItemType } from '../../types/cart';
import { removeItem, updateQuantity } from '../../store/cartSlice';
import { useAppDispatch } from '../../store/hooks';
import './CartItem.css';

interface CartItemProps {
  item: CartItemType;
}

/**
 * Renders a single cart item with quantity controls and a remove button.
 * Dispatches Redux actions for quantity updates and item removal.
 */
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();

  const handleDecrement = () => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  const handleIncrement = () => {
    dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
  };

  const handleRemove = () => {
    dispatch(removeItem(item.id));
  };

  const subtotal = (item.price * item.quantity).toFixed(2);

  return (
    <li className="cart-item" aria-label={`Cart item: ${item.name}`}>
      <div className="cart-item__info">
        <span className="cart-item__name">{item.name}</span>
        <span className="cart-item__price">${item.price.toFixed(2)}</span>
      </div>

      <div className="cart-item__controls">
        <div className="cart-item__quantity" role="group" aria-label={`Quantity for ${item.name}`}>
          <button
            className="cart-item__qty-btn"
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.name}`}
          >
            −
          </button>
          <span className="cart-item__qty-value" aria-live="polite" aria-label={`${item.quantity} units`}>
            {item.quantity}
          </span>
          <button
            className="cart-item__qty-btn"
            onClick={handleIncrement}
            aria-label={`Increase quantity of ${item.name}`}
          >
            +
          </button>
        </div>

        <span className="cart-item__subtotal" aria-label={`Subtotal: $${subtotal}`}>
          ${subtotal}
        </span>

        <button
          className="cart-item__remove"
          onClick={handleRemove}
          aria-label={`Remove ${item.name} from cart`}
        >
          Remove
        </button>
      </div>
    </li>
  );
};

export default CartItem;
