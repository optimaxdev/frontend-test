import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, UpdateQuantityPayload } from '../types/cart';

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Async thunk to load cart items from a static JSON file.
 * Simulates an XHR request on page load.
 */
export const fetchCartItems = createAsyncThunk<CartItem[]>(
  'cart/fetchItems',
  async () => {
    const response = await fetch('/cart-items.json');
    if (!response.ok) {
      throw new Error('Failed to load cart items');
    }
    return response.json() as Promise<CartItem[]>;
  }
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

    /** Removes an item from the cart by id */
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    /**
     * Updates the quantity of an existing cart item.
     * The quantity is clamped to a minimum of 1.
     */
    updateQuantity(state, action: PayloadAction<UpdateQuantityPayload>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
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
      });
  },
});

export const { addItem, removeItem, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
