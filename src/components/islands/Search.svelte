<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { actions } from 'astro:actions';
  import { formatPrice } from '@utils/formatting';

  // 1. Estados Reactivos (Svelte 5 Runes)
  let query = $state('');
  let results = $state<any[]>([]); // Array de productos
  let loading = $state(false);
  let showResults = $state(false);
  let searchContainer: HTMLElement; // Referencia para detectar clics fuera

  let debounceTimer: ReturnType<typeof setTimeout>;

  // 2. Lógica de Búsqueda (Debounce)
  function handleInput() {
    // Limpiamos el timer anterior (reiniciamos la cuenta regresiva)
    clearTimeout(debounceTimer);
    
    // Si borró el texto, limpiamos todo
    if (query.length < 2) {
      results = [];
      showResults = false;
      return;
    }

    loading = true;
    showResults = true;

    // Esperamos 300ms antes de llamar al servidor
    debounceTimer = setTimeout(async () => {
      // Llamada a la Astro Action definida en src/actions/index.ts
      const { data, error } = await actions.searchProducts({ query });
      
      loading = false;
      
      if (!error && data) {
        results = data;
      } else {
        results = []; // Manejo silencioso de error por UX
      }
    }, 300);
  }

  // 3. Cerrar al hacer clic fuera
  function handleClickOutside(event: MouseEvent) {
    if (searchContainer && !searchContainer.contains(event.target as Node)) {
      showResults = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div 
  bind:this={searchContainer}
  class="relative w-full max-w-xs md:max-w-sm"
>
  <div class="relative">
    <input
      type="search"
      placeholder="Buscar libros, autores..."
      bind:value={query}
      oninput={handleInput}
      onfocus={() => query.length >= 2 && (showResults = true)}
      class="w-full bg-paper-base border border-brand-ink/20 text-brand-ink rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-brand-ink/40"
    />
    
    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40 pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    </div>

    {#if loading}
      <div class="absolute right-3 top-1/2 -translate-y-1/2" transition:fade>
        <div class="animate-spin h-4 w-4 border-2 border-brand-ink/20 border-t-accent-gold rounded-full"></div>
      </div>
    {/if}
  </div>

  {#if showResults && query.length >= 2}
    <div 
      class="absolute top-full mt-2 left-0 w-full md:w-[150%] md:-left-[25%] bg-paper-base rounded-sm shadow-xl border border-brand-ink/10 overflow-hidden z-50"
      transition:slide={{ duration: 200 }}
    >
      {#if loading}
        <div class="p-4 text-center text-xs text-brand-ink/50">Buscando...</div>
      
      {:else if results.length > 0}
        <ul class="divide-y divide-brand-ink/5">
          {#each results as book}
            <li>
              <a 
                href={`/libros/${book.slug}`}
                class="flex items-center gap-3 p-3 hover:bg-brand-ink/5 transition-colors group"
                onclick={() => showResults = false}
              >
                <div class="w-10 h-14 bg-gray-200 rounded-sm overflow-hidden shrink-0 shadow-sm">
                  <img 
                    src={book.cover_image} 
                    alt={book.title} 
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-bold text-brand-ink truncate group-hover:text-ink-deep">
                    {book.title}
                  </h4>
                  <p class="text-xs text-brand-ink/60 truncate">{book.author}</p>
                </div>

                <span class="text-xs font-bold text-accent-gold whitespace-nowrap">
                  {formatPrice(book.price)}
                </span>
              </a>
            </li>
          {/each}
        </ul>
        
        <div class="bg-paper-surface p-2 text-center border-t border-brand-ink/5">
            <span class="text-[10px] text-brand-ink/40 uppercase tracking-widest">
                {results.length} resultados encontrados
            </span>
        </div>

      {:else}
        <div class="p-6 text-center">
            <p class="text-sm font-medium text-brand-ink/60">No encontramos libros.</p>
            <p class="text-xs text-brand-ink/40 mt-1">Intenta con otro título o autor.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
