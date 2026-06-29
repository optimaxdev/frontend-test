import { describe, it, expect } from 'vitest';
import type { CartState } from '../store/cartSlice';
import cartReducer, {
  addItem,
  changeCartItemQuantity,
  deleteCartItem,
  fetchCartItems,
} from '../store/cartSlice';
import type { CartItem } from '../types/cart';

const mockItem: CartItem = { id: '1', name: 'Widget', price: 10, quantity: 2 };

const stateWithItem: CartState = {
  items: [mockItem],
  loading: false,
  error: null,
  updatingItemIds: [],
  deletingItemIds: [],
};

describe('cartSlice reducer', () => {
  it('returns the initial state', () => {
    const state = cartReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({
      items: [],
      loading: false,
      error: null,
      updatingItemIds: [],
      deletingItemIds: [],
    });
  });

  describe('addItem', () => {
    it('prepends a new item to the list', () => {
      const existing: CartItem = { id: 'x', name: 'Existing', price: 5, quantity: 1 };
      const start: CartState = {
        items: [existing],
        loading: false,
        error: null,
        updatingItemIds: [],
        deletingItemIds: [],
      };
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

  describe('changeCartItemQuantity async thunk', () => {
    it('tracks pending state while quantity is updating', () => {
      const state = cartReducer(
        stateWithItem,
        changeCartItemQuantity.pending('', { id: '1', quantity: 5 })
      );
      expect(state.updatingItemIds).toEqual(['1']);
    });

    it('updates quantity and clears pending state on fulfilled', () => {
      const start: CartState = { ...stateWithItem, updatingItemIds: ['1'] };
      const state = cartReducer(
        start,
        changeCartItemQuantity.fulfilled({ id: '1', quantity: 5 }, '', {
          id: '1',
          quantity: 5,
        })
      );
      expect(state.items[0].quantity).toBe(5);
      expect(state.updatingItemIds).toEqual([]);
    });

    it('clears pending state and stores error on rejected', () => {
      const start: CartState = { ...stateWithItem, updatingItemIds: ['1'] };
      const state = cartReducer(
        start,
        changeCartItemQuantity.rejected(new Error('Network error'), '', {
          id: '1',
          quantity: 5,
        })
      );
      expect(state.updatingItemIds).toEqual([]);
      expect(state.error).toBe('Network error');
    });
  });

  describe('deleteCartItem async thunk', () => {
    it('tracks pending state while deleting', () => {
      const state = cartReducer(stateWithItem, deleteCartItem.pending('', '1'));
      expect(state.deletingItemIds).toEqual(['1']);
    });

    it('removes item and clears pending state on fulfilled', () => {
      const start: CartState = { ...stateWithItem, deletingItemIds: ['1'] };
      const state = cartReducer(start, deleteCartItem.fulfilled('1', '', '1'));
      expect(state.items).toHaveLength(0);
      expect(state.deletingItemIds).toEqual([]);
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
