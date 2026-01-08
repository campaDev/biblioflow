<script lang="ts">
  import { isCartOpen, cartItems } from '@lib/stores';

  // Solo necesitamos saber cuántos items hay para el globito rojo
  let totalItems = $derived(
    $cartItems.reduce((acc, item) => acc + item.quantity, 0)
  );
</script>

<button 
  class="relative p-2 text-brand-ink hover:text-accent-gold transition-colors group"
  onclick={() => isCartOpen.set(true)}
  aria-label="Abrir carrito"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
  
  {#if totalItems > 0}
    <span class="absolute -top-1 -right-1 bg-accent-gold text-ink-deep text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm animate-bounce-short">
      {totalItems}
    </span>
  {/if}
</button>

<style>
    @keyframes bounce-short {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-25%); }
    }
    .animate-bounce-short {
        animation: bounce-short 0.3s ease-in-out;
    }
</style>
