<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import BookCard from './ui/BookCard.svelte';
  import { formatPrice } from '@utils/formatting';

  // 1. Recibimos los datos "crudos" de la base de datos
  let { products, categories } = $props();

  // 2. Extraemos datos únicos para poblar los filtros dinámicamente
  const allAuthors = [...new Set(products.map((p: any) => p.author))].sort();
  const maxPriceInCatalog = Math.max(...products.map((p: any) => p.price));
  
  // 3. ESTADO (Los inputs del usuario)
  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let selectedAuthor = $state('all');
  let selectedLanguage = $state('all');
  let maxPrice = $state(maxPriceInCatalog);
  let showMobileFilters = $state(false);

  // 4. LÓGICA DERIVADA (El corazón del filtro)
  let filteredProducts = $derived(products.filter((product: any) => {
    // Filtro Texto
    const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro Categoría
    const matchCategory = selectedCategory === 'all' || product.category_id === Number(selectedCategory);
    
    // Filtro Autor
    const matchAuthor = selectedAuthor === 'all' || product.author === selectedAuthor;

    // Filtro Idioma
    const matchLanguage = selectedLanguage === 'all' || product.language === selectedLanguage;

    // Filtro Precio
    const matchPrice = product.price <= maxPrice;

    return matchSearch && matchCategory && matchAuthor && matchLanguage && matchPrice;
  }));

  // Función para resetear
  function resetFilters() {
    searchQuery = '';
    selectedCategory = 'all';
    selectedAuthor = 'all';
    selectedLanguage = 'all';
    maxPrice = maxPriceInCatalog;
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
  
  <aside class="lg:col-span-1 space-y-6">
    
    <div class="lg:hidden flex justify-between items-center bg-white p-4 rounded-sm border border-brand-ink/10">
      <span class="font-serif font-bold text-brand-ink">Filtros</span>
      <button onclick={() => showMobileFilters = !showMobileFilters} class="text-accent-gold font-bold text-sm">
        {showMobileFilters ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>

    <div class="{showMobileFilters ? 'block' : 'hidden'} lg:block space-y-8 bg-paper-surface/50 p-6 rounded-sm border border-brand-ink/5">
      
      <div>
        <label class="block text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">Buscar</label>
        <div class="relative">
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Título o autor..." 
                class="w-full bg-white border border-brand-ink/20 rounded-sm py-2 pl-3 pr-8 text-sm focus:border-accent-gold outline-none transition-colors"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-end mb-2">
            <label class="block text-xs font-bold text-brand-ink uppercase tracking-wider">Precio Máximo</label>
            <span class="text-sm font-mono text-brand-ink">{formatPrice(maxPrice)}</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max={maxPriceInCatalog} 
            step="5000"
            bind:value={maxPrice}
            class="w-full h-1 bg-brand-ink/20 rounded-lg appearance-none cursor-pointer accent-brand-ink"
        />
        <div class="flex justify-between text-[10px] text-brand-ink/40 mt-1">
            <span>0</span>
            <span>{formatPrice(maxPriceInCatalog)}</span>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">Categoría</label>
        <select bind:value={selectedCategory} class="w-full bg-white border border-brand-ink/20 rounded-sm py-2 px-3 text-sm focus:border-accent-gold outline-none cursor-pointer">
            <option value="all">Todas las categorías</option>
            {#each categories as cat}
                <option value={cat.id}>{cat.name}</option>
            {/each}
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">Idioma</label>
        <div class="flex gap-2">
            {#each ['all', 'es', 'en', 'pt'] as lang}
                <button 
                    onclick={() => selectedLanguage = lang}
                    class="flex-1 py-1.5 text-xs font-bold uppercase rounded-sm border transition-all
                    {selectedLanguage === lang 
                        ? 'bg-brand-ink text-white border-brand-ink' 
                        : 'bg-white text-brand-ink/60 border-brand-ink/10 hover:border-brand-ink/30'}"
                >
                    {lang === 'all' ? 'Todos' : lang}
                </button>
            {/each}
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">Autor</label>
        <select bind:value={selectedAuthor} class="w-full bg-white border border-brand-ink/20 rounded-sm py-2 px-3 text-sm focus:border-accent-gold outline-none cursor-pointer">
            <option value="all">Todos los autores</option>
            {#each allAuthors as author}
                <option value={author}>{author}</option>
            {/each}
        </select>
      </div>

      <button 
        onclick={resetFilters}
        class="w-full py-2 text-xs font-bold text-brand-ink/50 hover:text-red-500 border border-transparent hover:border-red-200 rounded-sm transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12"/></svg>
        Limpiar Filtros
      </button>

    </div>
  </aside>

  <main class="lg:col-span-3">
    
    <div class="mb-6 flex justify-between items-center border-b border-brand-ink/10 pb-4">
        <h2 class="font-serif text-xl font-bold text-brand-ink">
            Catálogo 
            <span class="text-base font-sans font-normal text-brand-ink/50 ml-2">
                ({filteredProducts.length} libros)
            </span>
        </h2>
    </div>

    {#if filteredProducts.length > 0}
        <div class="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12">
            {#each filteredProducts as product (product.id)}
                <div in:fade={{ duration: 200 }}>
                    <BookCard {product} />
                </div>
            {/each}
        </div>
    {:else}
        <div class="text-center py-20 bg-gray-50 rounded-sm border-2 border-dashed border-gray-200" in:fade>
            <div class="text-4xl mb-4">🔍</div>
            <h3 class="font-serif font-bold text-lg text-brand-ink">No encontramos coincidencias</h3>
            <p class="text-brand-ink/60 text-sm mt-2 max-w-xs mx-auto">
                Prueba ajustando los filtros o buscando por otro término.
            </p>
            <button onclick={resetFilters} class="mt-6 text-accent-gold font-bold text-sm hover:underline">
                Limpiar todo y ver catálogo
            </button>
        </div>
    {/if}

  </main>

</div>
