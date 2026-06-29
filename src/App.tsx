import React, { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { fetchCartItems } from './store/cartSlice';
import AddItemForm from './components/AddItemForm/AddItemForm';
import CartList from './components/CartList/CartList';
import CartSummary from './components/CartSummary/CartSummary';
import './App.css';

/**
 * Root application component.
 * Loads cart items on mount and renders the main cart layout.
 */
const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">🛒 Shopping Cart</h1>
      </header>

      <main className="app__main">
        <div className="app__content">
          <section className="app__form-section" aria-labelledby="add-section-heading">
            <h2 id="add-section-heading" className="visually-hidden">Add new item</h2>
            <AddItemForm />
          </section>

          <section className="app__items-section" aria-labelledby="items-section-heading">
            <h2 id="items-section-heading" className="app__section-title">Cart Items</h2>
            <CartList />
          </section>
        </div>

        <aside className="app__sidebar" aria-label="Order summary">
          <CartSummary />
        </aside>
      </main>
    </div>
  );
};

export default App;
