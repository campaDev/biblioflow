<script lang="ts">
  import { fly, fade, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { actions } from 'astro:actions';
  import { isCartOpen, cartItems, removeCartItem, updateItemQuantity } from '@lib/stores';
  import { formatPrice } from '@utils/formatting';
  import { siteInfo } from '@data/site-info';

  // 1. Estados Derivados (Totales)
  let total = $derived(
    $cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  // 2. Estado Local de la UI
  let step = $state<'cart' | 'checkout'>('cart');
  let isSubmitting = $state(false);
  let errorMessage = $state('');
  
  // Estado para Modo Regalo
  let isGift = $state(false);

  // 3. Datos del Formulario
  let formData = $state({
    name: '',
    phone: ''
  });

  // Validar si el formulario está listo
  let isFormValid = $derived(
    formData.name.length >= 2 && formData.phone.length >= 6
  );

  // 4. Lógica Principal: Procesar Pedido
  async function handleProcessOrder() {
    if (!isFormValid) return;

    isSubmitting = true;
    errorMessage = '';

    try {
      const { data, error } = await actions.createOrder({
        customer: formData,
        items: $cartItems.map(i => ({
            id: i.id,
            quantity: i.quantity,
            price: i.price,
            title: i.title
        })),
        total: total,
        is_gift: isGift 
      });

      if (error) {
        console.error(error);
        errorMessage = error.message || "Ocurrió un error al procesar el pedido.";
        isSubmitting = false;
        return;
      }

      const orderId = data?.orderId.slice(0, 8);
      const phone = siteInfo.contact.whatsapp;
      let message = `Hola *${siteInfo.name}*, soy *${formData.name}*.\n`;
      message += `Acabo de registrar el pedido *#${orderId}* en la web:\n\n`;
      
      $cartItems.forEach((item) => {
        message += `- ${item.quantity}x *${item.title}*\n`;
      });
      
      message += `\n *Total: ${formatPrice(total)}*`;

      if (isGift) {
        message += `\n\n🎁 *¡ATENCIÓN! ES PARA REGALO* 🎁`;
        message += `\n(Por favor confirmar opciones de envoltorio)`;
      }

      message += `\n\nMis datos de contacto: ${formData.phone}`;
      message += `\nQuedo a la espera para coordinar el pago.`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      cartItems.set([]); 
      isCartOpen.set(false);
      step = 'cart';
      formData = { name: '', phone: '' };
      isGift = false; 

    } catch (err) {
      errorMessage = "Error de conexión. Intenta nuevamente.";
    } finally {
      isSubmitting = false;
    }
  }

  function closeDrawer() {
    isCartOpen.set(false);
    setTimeout(() => {
        step = 'cart';
        errorMessage = '';
        isGift = false; 
    }, 300);
  }
</script>

{#if $isCartOpen}
  <div 
    role="button"
    tabindex="0"
    class="fixed inset-0 bg-brand-ink/40 backdrop-blur-sm z-100 transition-opacity"
    transition:fade={{ duration: 200 }}
    onclick={closeDrawer}
    onkeydown={(e) => e.key === 'Escape' && closeDrawer()}
    aria-label="Cerrar carrito"
  ></div>

  <div 
    class="fixed top-0 right-0 h-full w-full max-w-md bg-paper-base shadow-2xl z-[101] flex flex-col border-l border-brand-ink/10"
    transition:fly={{ x: 300, duration: 300, easing: cubicOut, opacity: 1 }}
    aria-modal="true"
    role="dialog"
  >
    <header class="p-6 border-b border-brand-ink/10 flex justify-between items-center bg-paper-surface">
      <div class="flex items-center gap-3">
        {#if step === 'checkout'}
            <button 
                onclick={() => step = 'cart'}
                class="p-1 -ml-2 rounded-full hover:bg-brand-ink/10 text-brand-ink transition-colors"
                aria-label="Volver al carrito"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
        {/if}
        <h2 class="font-serif font-bold text-xl text-brand-ink">
            {step === 'cart' ? 'Tu Pedido' : 'Finalizar Compra'}
        </h2>
      </div>
      
      <button 
        onclick={closeDrawer}
        class="text-brand-ink/50 hover:text-red-500 transition-colors"
        aria-label="Cerrar carrito"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </header>

    <div class="flex-1 overflow-y-auto p-6 relative">
      
      {#if step === 'cart'}
        <div in:fade={{ duration: 200 }} class="space-y-6">
            {#if $cartItems.length === 0}
                <div class="h-64 flex flex-col items-center justify-center text-center opacity-60 space-y-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 5h12"/></svg>
                    <p>Tu carrito está vacío.</p>
                    <button onclick={closeDrawer} class="text-accent-gold hover:underline font-medium">
                        Ver libros disponibles
                    </button>
                </div>
            {:else}
                {#each $cartItems as item (item.id)}
                    <div class="flex gap-4 animate-fade-in">
                        <div class="w-16 h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <img src={item.cover_image} alt={item.title} class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 class="font-bold text-brand-ink text-sm line-clamp-2 leading-tight">{item.title}</h3>
                                <p class="text-xs text-brand-ink/60 mt-1">{formatPrice(item.price)}</p>
                            </div>
                            <div class="flex items-center justify-between mt-2">
                                <div class="flex items-center border border-brand-ink/20 rounded-sm">
                                    <button class="px-2 py-1 hover:bg-brand-ink/5 text-brand-ink/70" onclick={() => updateItemQuantity(item.id, item.quantity - 1)} aria-label="Disminuir cantidad">−</button>
                                    <span class="px-2 text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                                    <button class="px-2 py-1 hover:bg-brand-ink/5 text-brand-ink/70" onclick={() => updateItemQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.max_stock} aria-label="Aumentar cantidad">+</button>
                                </div>
                                <button onclick={() => removeCartItem(item.id)} class="text-xs text-red-400 hover:text-red-600 underline">Eliminar</button>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

      {:else if step === 'checkout'}
        <div in:slide={{ axis: 'x', duration: 300 }} class="space-y-6">
            <div class="bg-paper-surface p-4 rounded-sm border border-brand-ink/5 text-sm">
                <p class="text-brand-ink/80 mb-2">Resumen de tu pedido:</p>
                <ul class="list-disc list-inside text-brand-ink/60 space-y-1 pl-1">
                    {#each $cartItems as item}
                        <li class="truncate">{item.quantity}x {item.title}</li>
                    {/each}
                </ul>
                <div class="mt-3 pt-3 border-t border-brand-ink/10 font-bold flex justify-between">
                    <span>Total a pagar:</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label for="c-name" class="block text-sm font-bold text-brand-ink mb-1">Nombre Completo</label>
                    <input 
                        id="c-name"
                        type="text" 
                        bind:value={formData.name}
                        placeholder="Ej: Juan Pérez"
                        class="w-full bg-white border border-brand-ink/20 rounded-sm px-4 py-3 focus:outline-none focus:border-accent-gold transition-colors"
                    />
                </div>
                <div>
                    <label for="c-phone" class="block text-sm font-bold text-brand-ink mb-1">WhatsApp / Teléfono</label>
                    <input 
                        id="c-phone"
                        type="tel" 
                        bind:value={formData.phone}
                        placeholder="Ej: 0981 123 456"
                        class="w-full bg-white border border-brand-ink/20 rounded-sm px-4 py-3 focus:outline-none focus:border-accent-gold transition-colors"
                    />
                    <p class="text-xs text-brand-ink/40 mt-1">Te contactaremos a este número para coordinar.</p>
                </div>
            </div>
            
            <div class="p-3 bg-brand-ink/5 rounded-sm border border-brand-ink/10 flex items-center gap-3">
                <div class="relative flex items-center">
                    <input 
                        type="checkbox" 
                        id="gift-mode" 
                        bind:checked={isGift}
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-brand-ink/30 checked:bg-accent-gold checked:border-accent-gold transition-all"
                    />
                    <svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <label for="gift-mode" class="cursor-pointer select-none">
                    <span class="block font-bold text-brand-ink text-sm">🎁 ¿Es para regalo?</span>
                    <span class="block text-xs text-brand-ink/60">Lo prepararemos con envoltorio especial.</span>
                </label>
            </div>

            {#if errorMessage}
                <div class="p-3 bg-red-50 text-red-600 text-sm rounded-sm border border-red-100 animate-pulse">
                    {errorMessage}
                </div>
            {/if}
        </div>
      {/if}
    </div>

    {#if $cartItems.length > 0}
      <div class="p-6 bg-paper-surface border-t border-brand-ink/10 space-y-3">
        {#if step === 'cart'}
            <div class="flex justify-between items-end mb-2">
                <span class="text-sm text-brand-ink/60 font-medium">Subtotal</span>
                <span class="text-2xl font-bold font-serif text-brand-ink">{formatPrice(total)}</span>
            </div>
            <button 
                onclick={() => step = 'checkout'}
                class="w-full bg-brand-ink text-white font-bold py-4 rounded-sm shadow-md hover:bg-ink-deep transition-all flex items-center justify-center gap-2"
            >
                Continuar Compra
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
        {:else}
            <button 
                onclick={handleProcessOrder}
                disabled={!isFormValid || isSubmitting}
                class="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
                {#if isSubmitting}
                    <div class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    Procesando...
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Confirmar Pedido en WhatsApp
                {/if}
            </button>
            <p class="text-[10px] text-center text-brand-ink/40">
                Al confirmar, se registrará tu pedido y se abrirá WhatsApp.
            </p>
        {/if}
      </div>
    {/if}
  </div>
{/if}
