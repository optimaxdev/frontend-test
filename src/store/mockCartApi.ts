import type { CartItem } from '../types/cart';

const API_BASE = '/api/cart-items';

async function parseError(response: Response, fallback: string): Promise<never> {
  try {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? fallback);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(fallback);
  }
}

export async function fetchCartItemsApi(): Promise<CartItem[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    return fetch('/cart-items.json').then(async (fallbackResponse) => {
      if (!fallbackResponse.ok) {
        return parseError(response, 'Failed to load cart items');
      }
      return fallbackResponse.json() as Promise<CartItem[]>;
    });
  }
  return response.json() as Promise<CartItem[]>;
}

export async function updateCartItemQuantityApi(
  id: string,
  quantity: number
): Promise<{ id: string; quantity: number }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    return parseError(response, 'Failed to update item quantity');
  }

  return response.json() as Promise<{ id: string; quantity: number }>;
}

export async function deleteCartItemApi(id: string): Promise<string> {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    return parseError(response, 'Failed to delete cart item');
  }
  return id;
}
