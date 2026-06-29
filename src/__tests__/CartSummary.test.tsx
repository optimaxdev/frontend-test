import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CartSummary from '../components/CartSummary/CartSummary';
import cartReducer from '../store/cartSlice';
import type { CartItem } from '../types/cart';

const makeStore = (items: CartItem[]) =>
  configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items, loading: false, error: null } },
  });

describe('CartSummary component', () => {
  it('shows correct totals for multiple items', () => {
    const items: CartItem[] = [
      { id: '1', name: 'A', price: 10, quantity: 2 },
      { id: '2', name: 'B', price: 5, quantity: 3 },
    ];
    render(
      <Provider store={makeStore(items)}>
        <CartSummary />
      </Provider>
    );
    // Total items: 2 + 3 = 5
    expect(screen.getByText('5')).toBeInTheDocument();
    // Total price: 10*2 + 5*3 = 35.00
    expect(screen.getByText('$35.00')).toBeInTheDocument();
  });

  it('disables checkout button when cart is empty', () => {
    render(
      <Provider store={makeStore([])}>
        <CartSummary />
      </Provider>
    );
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
  });

  it('shows success message after checkout', async () => {
    const items: CartItem[] = [{ id: '1', name: 'A', price: 5, quantity: 1 }];
    render(
      <Provider store={makeStore(items)}>
        <CartSummary />
      </Provider>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(screen.getByText(/Order placed successfully/i)).toBeInTheDocument();
  });
});
