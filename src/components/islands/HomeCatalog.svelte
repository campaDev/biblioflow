<script lang="ts">
  import { fade } from 'svelte/transition';
  import BookCard from './ui/BookCard.svelte';

  // Recibimos datos completos desde el servidor (Astro)
  let { products, categories } = $props();

  // Estado local
  let activeCategory = $state('all');

  // Lógica de filtrado reactiva ($derived)
  let filteredProducts = $derived(
    activeCategory === 'all' 
      ? products 
      : products.filter((p: any) => p.category_id === activeCategory)
  );
</script>

<div class="space-y-8">
  
  <div class="flex flex-wrap justify-center gap-2 pb-2">
    <button
      onclick={() => activeCategory = 'all'}
      class="px-4 py-2 rounded-full text-sm font-bold transition-all border
      {activeCategory === 'all' 
        ? 'bg-brand-ink text-white border-brand-ink shadow-md' 
        : 'bg-white text-brand-ink/60 border-brand-ink/10 hover:border-brand-ink/30 hover:text-brand-ink'}"
    >
      Todos
    </button>

    {#each categories as cat}
      <button
        onclick={() => activeCategory = cat.id}
        class="px-4 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap
        {activeCategory === cat.id 
          ? 'bg-brand-ink text-white border-brand-ink shadow-md' 
          : 'bg-white text-brand-ink/60 border-brand-ink/10 hover:border-brand-ink/30 hover:text-brand-ink'}"
      >
        {cat.name}
      </button>
    {/each}
  </div>

  {#if filteredProducts.length > 0}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 min-h-[400px]">
      {#each filteredProducts as product (product.id)}
        <div in:fade={{ duration: 300 }}>
          <BookCard {product} />
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-20 border-2 border-dashed border-brand-ink/5 rounded-sm" in:fade>
      <p class="text-brand-ink/40">No hay libros en esta categoría por el momento.</p>
      <button onclick={() => activeCategory = 'all'} class="text-accent-gold font-bold text-sm mt-2 hover:underline">
        Ver todos los libros
      </button>
    </div>
  {/if}

</div>
