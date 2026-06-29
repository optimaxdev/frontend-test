import { describe, it, expect } from 'vitest';
import type { CartState } from '../store/cartSlice';
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  fetchCartItems,
} from '../store/cartSlice';
import type { CartItem } from '../types/cart';

const mockItem: CartItem = { id: '1', name: 'Widget', price: 10, quantity: 2 };

const stateWithItem: CartState = {
  items: [mockItem],
  loading: false,
  error: null,
};

describe('cartSlice reducer', () => {
  it('returns the initial state', () => {
    const state = cartReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ items: [], loading: false, error: null });
  });

  describe('addItem', () => {
    it('prepends a new item to the list', () => {
      const existing: CartItem = { id: 'x', name: 'Existing', price: 5, quantity: 1 };
      const start: CartState = { items: [existing], loading: false, error: null };
      const state = cartReducer(start, addItem({ name: 'New', price: 20, quantity: 3 }));
      expect(state.items).toHaveLength(2);
      expect(state.items[0].name).toBe('New');
      expect(state.items[0].price).toBe(20);
      expect(state.items[0].quantity).toBe(3);
      expect(state.items[1]).toEqual(existing);
    });

    it('assigns a unique id to the new item', () => {
      const state1 = cartReducer(undefined, addItem({ name: 'A', price: 1, quantity: 1 }));
      const state2 = cartReducer(state1, addItem({ name: 'B', price: 2, quantity: 1 }));
      const ids = state2.items.map((i) => i.id);
      expect(new Set(ids).size).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('removes the item with the given id', () => {
      const state = cartReducer(stateWithItem, removeItem('1'));
      expect(state.items).toHaveLength(0);
    });

    it('does nothing when the id does not exist', () => {
      const state = cartReducer(stateWithItem, removeItem('nonexistent'));
      expect(state.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates the quantity of the specified item', () => {
      const state = cartReducer(stateWithItem, updateQuantity({ id: '1', quantity: 5 }));
      expect(state.items[0].quantity).toBe(5);
    });

    it('clamps quantity to a minimum of 1', () => {
      const state = cartReducer(stateWithItem, updateQuantity({ id: '1', quantity: 0 }));
      expect(state.items[0].quantity).toBe(1);
    });

    it('does nothing when the id does not exist', () => {
      const state = cartReducer(stateWithItem, updateQuantity({ id: 'missing', quantity: 99 }));
      expect(state.items[0].quantity).toBe(2);
    });
  });

  describe('fetchCartItems async thunk', () => {
    it('sets loading to true while pending', () => {
      const state = cartReducer(undefined, fetchCartItems.pending('', undefined));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('stores items and clears loading on fulfilled', () => {
      const items: CartItem[] = [{ id: '2', name: 'Gadget', price: 15, quantity: 1 }];
      const state = cartReducer(undefined, fetchCartItems.fulfilled(items, '', undefined));
      expect(state.loading).toBe(false);
      expect(state.items).toEqual(items);
    });

    it('stores error message and clears loading on rejected', () => {
      const action = fetchCartItems.rejected(
        new Error('Network error'),
        '',
        undefined,
        'Network error'
      );
      const state = cartReducer(undefined, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });
});
