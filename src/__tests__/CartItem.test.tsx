import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CartItemComponent from '../components/CartItem/CartItem';
import cartReducer from '../store/cartSlice';
import type { CartItem } from '../types/cart';

const makeStore = (items: CartItem[]) =>
  configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items, loading: false, error: null } },
  });

const renderWithStore = (item: CartItem) => {
  const store = makeStore([item]);
  const result = render(
    <Provider store={store}>
      <ul>
        <CartItemComponent item={item} />
      </ul>
    </Provider>
  );
  return { ...result, store };
};

const sampleItem: CartItem = { id: 'abc', name: 'Gadget', price: 9.99, quantity: 2 };

describe('CartItem component', () => {
  it('renders item name, price and quantity', () => {
    renderWithStore(sampleItem);
    expect(screen.getByText('Gadget')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays the correct subtotal', () => {
    renderWithStore(sampleItem);
    // 9.99 * 2 = 19.98
    expect(screen.getByText('$19.98')).toBeInTheDocument();
  });

  it('increments quantity when + button is clicked', () => {
    const { store } = renderWithStore(sampleItem);
    fireEvent.click(screen.getByLabelText('Increase quantity of Gadget'));
    expect(store.getState().cart.items[0].quantity).toBe(3);
  });

  it('decrements quantity when - button is clicked', () => {
    const { store } = renderWithStore(sampleItem);
    fireEvent.click(screen.getByLabelText('Decrease quantity of Gadget'));
    expect(store.getState().cart.items[0].quantity).toBe(1);
  });

  it('disables the decrement button when quantity is 1', () => {
    const oneItem: CartItem = { ...sampleItem, quantity: 1 };
    renderWithStore(oneItem);
    expect(screen.getByLabelText('Decrease quantity of Gadget')).toBeDisabled();
  });

  it('removes item from store when Remove button is clicked', () => {
    const { store } = renderWithStore(sampleItem);
    fireEvent.click(screen.getByLabelText('Remove Gadget from cart'));
    expect(store.getState().cart.items).toHaveLength(0);
  });
});
