import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddItemForm from '../components/AddItemForm/AddItemForm';
import cartReducer from '../store/cartSlice';

const makeStore = () =>
  configureStore({
    reducer: { cart: cartReducer },
    preloadedState: {
      cart: {
        items: [],
        loading: false,
        error: null,
        updatingItemIds: [],
        deletingItemIds: [],
      },
    },
  });

const renderForm = () => {
  const store = makeStore();
  render(
    <Provider store={store}>
      <AddItemForm />
    </Provider>
  );
  return { store };
};

describe('AddItemForm component', () => {
  it('renders all form fields and submit button', () => {
    renderForm();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Price must be a positive number.')).toBeInTheDocument();
  });

  it('dispatches addItem and clears form on valid submission', async () => {
    const { store } = renderForm();

    await userEvent.type(screen.getByLabelText('Name'), 'Super Gadget');
    await userEvent.clear(screen.getByLabelText('Price ($)'));
    await userEvent.type(screen.getByLabelText('Price ($)'), '19.99');
    await userEvent.clear(screen.getByLabelText('Quantity'));
    await userEvent.type(screen.getByLabelText('Quantity'), '3');

    await userEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));

    const items = store.getState().cart.items;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Super Gadget');
    expect(items[0].price).toBe(19.99);
    expect(items[0].quantity).toBe(3);

    // Form should be reset
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('');
  });

  it('does not dispatch when price is negative', async () => {
    const { store } = renderForm();
    await userEvent.type(screen.getByLabelText('Name'), 'Bad Item');
    await userEvent.clear(screen.getByLabelText('Price ($)'));
    await userEvent.type(screen.getByLabelText('Price ($)'), '-5');
    await userEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(store.getState().cart.items).toHaveLength(0);
  });
});
