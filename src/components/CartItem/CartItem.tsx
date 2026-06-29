import React from 'react';
import type { CartItem as CartItemType } from '../../types/cart';
import { changeCartItemQuantity, deleteCartItem } from '../../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
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
  const isUpdating = useAppSelector((state) =>
    state.cart.updatingItemIds.includes(item.id)
  );
  const isDeleting = useAppSelector((state) =>
    state.cart.deletingItemIds.includes(item.id)
  );
  const isBusy = isUpdating || isDeleting;

  const handleDecrement = () => {
    if (item.quantity > 1) {
      dispatch(changeCartItemQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  const handleIncrement = () => {
    dispatch(changeCartItemQuantity({ id: item.id, quantity: item.quantity + 1 }));
  };

  const handleRemove = () => {
    dispatch(deleteCartItem(item.id));
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
            disabled={item.quantity <= 1 || isBusy}
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
            disabled={isBusy}
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
          disabled={isBusy}
          aria-label={`Remove ${item.name} from cart`}
        >
          {isDeleting ? 'Removing...' : 'Remove'}
        </button>
      </div>

      {isUpdating && (
        <p className="cart-item__status" role="status" aria-live="polite">
          Saving quantity...
        </p>
      )}
    </li>
  );
};

export default CartItem;
