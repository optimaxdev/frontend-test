import React, { useState } from 'react';
import { addItem } from '../../store/cartSlice';
import { useAppDispatch } from '../../store/hooks';
import './AddItemForm.css';

/**
 * Form component for adding a new item to the cart.
 * On submit the new item is prepended to the top of the cart list.
 */
const AddItemForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required.';
    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      next.price = 'Price must be a positive number.';
    }
    const parsedQty = parseInt(quantity, 10);
    if (!quantity || isNaN(parsedQty) || parsedQty < 1) {
      next.quantity = 'Quantity must be at least 1.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(
      addItem({
        name: name.trim(),
        price: parseFloat(parseFloat(price).toFixed(2)),
        quantity: parseInt(quantity, 10),
      })
    );
    setName('');
    setPrice('');
    setQuantity('1');
    setErrors({});
  };

  return (
    <form className="add-item-form" onSubmit={handleSubmit} noValidate aria-label="Add item to cart">
      <h2 className="add-item-form__title">Add Item</h2>

      <div className="add-item-form__field">
        <label htmlFor="item-name" className="add-item-form__label">
          Name
        </label>
        <input
          id="item-name"
          type="text"
          className={`add-item-form__input${errors.name ? ' add-item-form__input--error' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
          aria-describedby={errors.name ? 'item-name-error' : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <span id="item-name-error" className="add-item-form__error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="add-item-form__field">
        <label htmlFor="item-price" className="add-item-form__label">
          Price ($)
        </label>
        <input
          id="item-price"
          type="number"
          min="0.01"
          step="0.01"
          className={`add-item-form__input${errors.price ? ' add-item-form__input--error' : ''}`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          aria-describedby={errors.price ? 'item-price-error' : undefined}
          aria-invalid={!!errors.price}
        />
        {errors.price && (
          <span id="item-price-error" className="add-item-form__error" role="alert">
            {errors.price}
          </span>
        )}
      </div>

      <div className="add-item-form__field">
        <label htmlFor="item-quantity" className="add-item-form__label">
          Quantity
        </label>
        <input
          id="item-quantity"
          type="number"
          min="1"
          step="1"
          className={`add-item-form__input${errors.quantity ? ' add-item-form__input--error' : ''}`}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-describedby={errors.quantity ? 'item-quantity-error' : undefined}
          aria-invalid={!!errors.quantity}
        />
        {errors.quantity && (
          <span id="item-quantity-error" className="add-item-form__error" role="alert">
            {errors.quantity}
          </span>
        )}
      </div>

      <button type="submit" className="add-item-form__submit">
        Add to Cart
      </button>
    </form>
  );
};

export default AddItemForm;
