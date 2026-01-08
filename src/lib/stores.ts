import { atom, map } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

// 1. Tipos de Datos (TypeScript Strict)
export interface CartItem {
  id: number;
  slug: string;
  title: string;
  price: number;
  cover_image: string;
  quantity: number;
  max_stock: number; // Para evitar vender más de lo que existe
}

// 2. Estado de la UI (No persiste, se reinicia al recargar)
// Controla si el Drawer del carrito o el Buscador están abiertos
export const isCartOpen = atom(false);
export const isSearchOpen = atom(false);

// 3. Estado del Carrito (Persistente en LocalStorage)
// 'cart-v1' es la clave que verás en Application > Local Storage
export const cartItems = persistentAtom<CartItem[]>("cart-v1", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// 4. Acciones (Lógica de Negocio)

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe.
 */
export function addCartItem(item: Omit<CartItem, "quantity">) {
  const currentItems = cartItems.get();
  const existingItem = currentItems.find((i) => i.id === item.id);

  if (existingItem) {
    // Si ya existe, validamos stock y aumentamos cantidad
    if (existingItem.quantity < item.max_stock) {
      cartItems.set(
        currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
      // Feedback visual: Abrir carrito automáticamente al agregar
      isCartOpen.set(true);
    } else {
      alert("¡No tenemos más stock de este libro por el momento!");
    }
  } else {
    // Si es nuevo, lo agregamos con cantidad 1
    cartItems.set([...currentItems, { ...item, quantity: 1 }]);
    isCartOpen.set(true);
  }
}

/**
 * Elimina un producto completamente del carrito.
 */
export function removeCartItem(id: number) {
  const currentItems = cartItems.get();
  cartItems.set(currentItems.filter((i) => i.id !== id));
}

/**
 * Aumenta o disminuye la cantidad manualmente (+ / -).
 */
export function updateItemQuantity(id: number, newQuantity: number) {
  const currentItems = cartItems.get();
  const item = currentItems.find((i) => i.id === id);

  if (!item) return;

  if (newQuantity <= 0) {
    removeCartItem(id); // Si baja a 0, se borra
  } else if (newQuantity <= item.max_stock) {
    cartItems.set(
      currentItems.map((i) =>
        i.id === id ? { ...i, quantity: newQuantity } : i,
      ),
    );
  } else {
    // Opcional: Toast de "Stock máximo alcanzado"
  }
}
