import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, UpdateQuantityPayload } from '../types/cart';
import {
  deleteCartItemApi,
  fetchCartItemsApi,
  updateCartItemQuantityApi,
} from './mockCartApi';

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  updatingItemIds: string[];
  deletingItemIds: string[];
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  updatingItemIds: [],
  deletingItemIds: [],
};

/**
 * Async thunk to load cart items from a static JSON file.
 * Simulates an XHR request on page load.
 */
export const fetchCartItems = createAsyncThunk<CartItem[]>(
  'cart/fetchItems',
  async () => fetchCartItemsApi()
);

export const changeCartItemQuantity = createAsyncThunk<
  UpdateQuantityPayload,
  UpdateQuantityPayload
>('cart/changeItemQuantity', async ({ id, quantity }) => {
  return updateCartItemQuantityApi(id, quantity);
});

export const deleteCartItem = createAsyncThunk<string, string>(
  'cart/deleteItem',
  async (id) => deleteCartItemApi(id)
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Prepends a new item to the cart list.
     * If an item with the same name already exists its quantity is incremented instead.
     */
    addItem(state, action: PayloadAction<Omit<CartItem, 'id'>>) {
      const id = crypto.randomUUID();
      state.items.unshift({ id, ...action.payload });
    },

    /** Resets cart-level errors shown in the list UI */
    clearCartError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(changeCartItemQuantity.pending, (state, action) => {
        state.error = null;
        if (!state.updatingItemIds.includes(action.meta.arg.id)) {
          state.updatingItemIds.push(action.meta.arg.id);
        }
      })
      .addCase(changeCartItemQuantity.fulfilled, (state, action) => {
        state.updatingItemIds = state.updatingItemIds.filter(
          (id) => id !== action.payload.id
        );
        const item = state.items.find((i) => i.id === action.payload.id);
        if (item) {
          item.quantity = Math.max(1, action.payload.quantity);
        }
      })
      .addCase(changeCartItemQuantity.rejected, (state, action) => {
        state.updatingItemIds = state.updatingItemIds.filter(
          (id) => id !== action.meta.arg.id
        );
        state.error = action.error.message ?? 'Failed to update quantity';
      })
      .addCase(deleteCartItem.pending, (state, action) => {
        state.error = null;
        if (!state.deletingItemIds.includes(action.meta.arg)) {
          state.deletingItemIds.push(action.meta.arg);
        }
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.deletingItemIds = state.deletingItemIds.filter(
          (id) => id !== action.payload
        );
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.deletingItemIds = state.deletingItemIds.filter(
          (id) => id !== action.meta.arg
        );
        state.error = action.error.message ?? 'Failed to delete cart item';
      });
  },
});

export const { addItem, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
