<script lang="ts">
  import { formatPrice } from '@utils/formatting';

  // Props usando Runes ($props)
  let { product } = $props();

  // Generamos el view-transition-name dinámico igual que en Astro
  const transitionName = `book-${product.slug}`;
</script>

<a href={`/libros/${product.slug}`} class="group block space-y-3">
  <div 
    class="shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 rounded-sm bg-gray-100 relative aspect-2/3 overflow-hidden"
  >
    <div style:view-transition-name={transitionName} class="w-full h-full">
      {#if product.cover_image}
        <img 
          src={product.cover_image} 
          alt={product.title}
          class="w-full h-full object-cover"
          loading="lazy" 
        />
      {:else}
        <div class="w-full h-full flex items-center justify-center bg-brand-ink/5 p-4 text-center">
            <span class="font-serif text-brand-ink/40 text-xs uppercase tracking-widest">{product.title}</span>
        </div>
      {/if}
    </div>
  </div>

  <div>
    <h3 class="font-bold text-brand-ink leading-tight group-hover:text-brand-ink/80 transition-colors line-clamp-2">
      {product.title}
    </h3>
    <p class="text-xs text-brand-ink/60 mt-1">{product.author}</p>
    
    <div class="flex items-baseline gap-2 mt-1">
      <p class="text-sm font-bold text-brand-ink">
        {formatPrice(product.price)}
      </p>
      {#if product.promotional_price}
        <span class="text-xs text-accent-gold line-through opacity-70">
            {formatPrice(product.promotional_price)}
        </span>
      {/if}
    </div>
  </div>
</a>
