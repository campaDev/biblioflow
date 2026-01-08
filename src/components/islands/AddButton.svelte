<script lang="ts">
  // Usamos los alias nuevos
  import { addCartItem } from '@lib/stores';
  
  // Props en Svelte 5 (Runes mode)
  // Definimos qué datos necesita el botón para funcionar
  let { product } = $props<{ 
    product: {
      id: number;
      slug: string;
      title: string;
      price: number;
      cover_image: string;
      stock_qty: number;
    }
  }>();

  // Estado local para animación de feedback (opcional)
  let isAdding = $state(false);

  function handleClick() {
    isAdding = true;
    
    addCartItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      cover_image: product.cover_image,
      max_stock: product.stock_qty
    });

    setTimeout(() => {
      isAdding = false;
    }, 500);
  }
</script>

<button
  onclick={handleClick}
  class="flex-1 bg-brand-ink text-white font-bold py-4 px-8 rounded-sm hover:bg-ink-deep transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={product.stock_qty === 0}
>
  {#if isAdding}
    <span class="animate-pulse">¡Agregado!</span>
  {:else}
    {product.stock_qty > 0 ? 'Agregar al Carrito' : 'Agotado'}
  {/if}
</button>
