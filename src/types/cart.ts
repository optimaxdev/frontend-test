/** Represents a single item in the shopping cart */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/** Payload for updating the quantity of an existing cart item */
export interface UpdateQuantityPayload {
  id: string;
  quantity: number;
}
