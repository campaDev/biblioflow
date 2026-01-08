<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { formatPrice } from '@utils/formatting';
  import { supabase } from '@lib/supabase';
  import { actions } from 'astro:actions';

  // Props recibidas desde el servidor
  interface Props {
    initialOrders: any[];
    initialProducts: any[];
    categories: any[];
  }

  let { initialOrders, initialProducts, categories }: Props = $props();

  // --- ESTADO PRINCIPAL ---
  let activeTab = $state<'orders' | 'inventory'>('orders');
  let orders = $state(initialOrders);
  let products = $state(initialProducts);
  let searchTerm = $state('');

  // --- ESTADO DEL MODAL (Crear/Editar Libro) ---
  let isModalOpen = $state(false);
  let isSubmitting = $state(false);
  let isUploading = $state(false);
  let isEditing = $state(false);

  // --- ESTADO DEL MODAL (Ver Pedido) ---
  let isOrderModalOpen = $state(false);
  let selectedOrder = $state<any>(null);
  let isUpdatingOrder = $state(false);

  // --- CONFIGURACIÓN DE ESTADOS (BADGES) ---
  const statusConfig: Record<string, { label: string, class: string }> = {
    'pending_whatsapp': { label: 'Pendiente', class: 'bg-gray-100 text-gray-600 border border-gray-200' },
    'confirmed': { label: 'Pagado', class: 'bg-green-100 text-green-700 border border-green-200' },
    'pending_shipment': { label: 'Por Enviar', class: 'bg-orange-100 text-orange-700 border border-orange-200' },
    'ready_for_pickup': { label: 'Para Retirar', class: 'bg-purple-100 text-purple-700 border border-purple-200' },
    'completed': { label: 'Entregado', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    'cancelled': { label: 'Cancelado', class: 'bg-red-50 text-red-500 border border-red-100' }
  };

  // Objeto base para resetear el formulario de libros
  interface BookForm {
    id: number;
    title: string;
    author: string;
    price: number;
    promotional_price: number | null;
    stock_qty: number;
    cover_image: string;
    category_id: number;
    isbn: string;
    published_year: number;
    description: string;
    language: 'es' | 'en' | 'pt';
    status: 'active' | 'draft' | 'preorder' | 'archived';
  }

  const emptyBook: BookForm = {
    id: 0, 
    title: '',
    author: '',
    price: 0,
    promotional_price: null,
    stock_qty: 5,
    cover_image: '',
    category_id: categories[0]?.id || 1,
    isbn: '',
    published_year: new Date().getFullYear(),
    description: '',
    language: 'es',
    status: 'active'
  };

  let formData = $state<BookForm>({ ...emptyBook });

  // --- FILTROS ---
  let filteredProducts = $derived(
    products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // --- FUNCIONES DE LIBROS ---

  function openCreateModal() {
    formData = { ...emptyBook };
    isEditing = false;
    isModalOpen = true;
  }

  function openEditModal(product: any) {
    formData = { 
        ...product,
        description: product.description || '',
        isbn: product.isbn || '',
        language: product.language || 'es',
        promotional_price: product.promotional_price || null
    }; 
    isEditing = true;
    isModalOpen = true;
  }

  async function handleSaveBook() {
    isSubmitting = true;
    try {
        if (isEditing) {
            const { data, error } = await actions.updateProduct({
                id: formData.id,
                updates: { ...formData }
            });
            if (error) throw error;
            products = products.map(p => p.id === formData.id ? data : p);
        } else {
            const { data, error } = await actions.createProduct({
                ...formData,
                promotional_price: formData.promotional_price || undefined
            });
            if (error) throw error;
            products = [data, ...products];
        }
        isModalOpen = false;
    } catch (err: any) {
        alert(err.message || "Error al guardar");
        console.error(err);
    } finally {
        isSubmitting = false;
    }
  }

  async function handleDelete(id: number) {
    if(!confirm("¿Estás seguro de eliminar este libro?")) return;
    const { error } = await actions.deleteProduct({ id });
    if (error) alert("No se pudo eliminar. Puede tener pedidos asociados.");
    else products = products.filter(p => p.id !== id);
  }

  async function updateStock(productId: number, newQty: number) {
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) products[index].stock_qty = newQty;
    await supabase.from('products').update({ stock_qty: newQty }).eq('id', productId);
  }

  async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    isUploading = true;
    const { error } = await supabase.storage.from('covers').upload(filePath, file);
    if (error) alert('Error: ' + error.message);
    else {
        const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
        formData.cover_image = data.publicUrl;
    }
    isUploading = false;
  }

  // --- FUNCIONES DE PEDIDOS ---

  function openOrderDetails(order: any) {
    selectedOrder = order;
    isOrderModalOpen = true;
  }

  async function handleChangeStatus(newStatus: string) {
    if (!selectedOrder) return;
    isUpdatingOrder = true;

    try {
        const { data, error } = await actions.updateOrderStatus({
            id: selectedOrder.id,
            status: newStatus as any
        });
        if (error) throw error;

        // Actualizar localmente
        selectedOrder.status = data.status;
        orders = orders.map(o => o.id === selectedOrder.id ? data : o);
    } catch (err: any) {
        alert(err.message || "Error al actualizar estado");
    } finally {
        isUpdatingOrder = false;
    }
  }

  // Función para copiar respuesta al portapapeles
  function copyPaymentResponse() {
    if (!selectedOrder) return;
    
    const text = `Hola *${selectedOrder.customer_name}*! 👋
Recibimos tu pedido *#${selectedOrder.id.slice(0,6)}*.

📚 *Resumen:*
${selectedOrder.cart_snapshot.map((i:any) => `• ${i.quantity}x ${i.title}`).join('\n')}

💰 *Total a pagar: ${formatPrice(selectedOrder.total_amount)}*

💳 *Datos para transferencia:*
Banco: [TU BANCO]
Titular: [TU NOMBRE]
CI/RUC: [TU NUMERO]
Cuenta: [TU CUENTA]

📸 Por favor envíame el comprobante por aquí para preparar tu paquete. ¡Gracias!`;

    navigator.clipboard.writeText(text);
    alert("¡Texto copiado! Pégalo en WhatsApp.");
  }
</script>

<div class="flex flex-col sm:flex-row gap-4 mb-8 border-b border-brand-ink/10 justify-between items-end sm:items-center pb-2">
  <div class="flex gap-4">
    <button 
        class="pb-3 px-2 text-sm font-bold transition-colors border-b-2 {activeTab === 'orders' ? 'border-brand-ink text-brand-ink' : 'border-transparent text-brand-ink/40 hover:text-brand-ink'}"
        onclick={() => activeTab = 'orders'}
    >
        Pedidos Recientes
    </button>
    <button 
        class="pb-3 px-2 text-sm font-bold transition-colors border-b-2 {activeTab === 'inventory' ? 'border-brand-ink text-brand-ink' : 'border-transparent text-brand-ink/40 hover:text-brand-ink'}"
        onclick={() => activeTab = 'inventory'}
    >
        Gestión de Inventario
    </button>
  </div>

  {#if activeTab === 'inventory'}
    <button 
        onclick={openCreateModal} 
        class="mb-2 sm:mb-0 bg-brand-ink text-white text-sm font-bold px-4 py-2 rounded-sm hover:bg-ink-deep transition-colors flex items-center gap-2 shadow-sm"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nuevo Libro
    </button>
  {/if}
</div>

<div class="bg-paper-base rounded-sm shadow-sm border border-brand-ink/5 min-h-[500px] p-6">
  
  {#if activeTab === 'orders'}
    <div in:fade={{ duration: 200 }}>
        <h2 class="font-serif text-xl font-bold text-brand-ink mb-4">Leads de WhatsApp</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-xs text-brand-ink/50 uppercase border-b border-brand-ink/10">
                        <th class="py-3 font-medium">Fecha</th>
                        <th class="py-3 font-medium">Cliente</th>
                        <th class="py-3 font-medium text-center">Estado</th> 
                        <th class="py-3 font-medium text-center">Regalo</th>
                        <th class="py-3 font-medium text-right">Total</th>
                        <th class="py-3 font-medium text-center">Acción</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-ink/5">
                    {#each orders as order (order.id)}
                        {@const statusInfo = statusConfig[order.status] || statusConfig['pending_whatsapp']}
                        
                        <tr class="hover:bg-brand-ink/5 transition-colors cursor-pointer group" onclick={() => openOrderDetails(order)}>
                            <td class="py-3 text-sm text-brand-ink/70">
                                {new Date(order.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                            </td>
                            <td class="py-3 font-bold text-brand-ink text-sm">
                                {order.customer_name}
                                <span class="block text-xs font-normal text-brand-ink/50">{order.customer_contact}</span>
                            </td>
                            
                            <td class="py-3 text-center">
                                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide {statusInfo.class}">
                                    {statusInfo.label}
                                </span>
                            </td>

                            <td class="py-3 text-center">
                                {#if order.is_gift}
                                    <span class="text-lg" title="Es para regalo">🎁</span>
                                {:else}
                                    <span class="text-brand-ink/20">-</span>
                                {/if}
                            </td>
                            <td class="py-3 text-right font-medium text-brand-ink text-sm">
                                {formatPrice(order.total_amount)}
                            </td>
                            <td class="py-3 text-center">
                                <button 
                                    class="p-2 text-brand-ink/40 group-hover:text-accent-gold transition-colors"
                                    aria-label="Ver detalles"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            {#if orders.length === 0}
                <div class="text-center py-12 opacity-50 flex flex-col items-center">
                    <p>No hay pedidos recientes.</p>
                </div>
            {/if}
        </div>
    </div>

  {:else if activeTab === 'inventory'}
    <div in:fade={{ duration: 200 }}>
        <div class="flex justify-between items-center mb-6">
            <h2 class="font-serif text-xl font-bold text-brand-ink">Catálogo</h2>
            <input type="text" placeholder="Buscar..." bind:value={searchTerm} class="bg-white border border-brand-ink/20 rounded-full px-4 py-2 text-sm w-64 shadow-sm focus:outline-none focus:border-accent-gold" />
        </div>
        <div class="grid grid-cols-1 gap-4">
            {#each filteredProducts as product (product.id)}
                <div class="flex items-center justify-between p-3 bg-white border border-brand-ink/10 rounded-sm hover:shadow-md transition-all group">
                    <div class="flex items-center gap-3 flex-1 overflow-hidden">
                        <div class="w-10 h-14 bg-gray-100 rounded-sm overflow-hidden shrink-0 border border-brand-ink/5">
                            {#if product.cover_image} <img src={product.cover_image} alt="" class="w-full h-full object-cover" /> {/if}
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h3 class="font-bold text-brand-ink text-sm truncate">{product.title}</h3>
                                {#if product.status === 'draft'} <span class="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Borrador</span>
                                {:else if product.status === 'archived'} <span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Archivado</span> {/if}
                            </div>
                            <p class="text-xs text-brand-ink/50 truncate">
                                {product.author} • {formatPrice(product.price)}
                                {#if product.promotional_price} <span class="text-accent-gold ml-1 line-through opacity-70">{formatPrice(product.promotional_price)}</span> {/if}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 shrink-0">
                        <div class="flex items-center bg-paper-surface border border-brand-ink/10 rounded-sm h-8">
                            <button class="w-8 h-full flex items-center justify-center hover:bg-brand-ink/10 disabled:opacity-30" onclick={() => updateStock(product.id, Math.max(0, product.stock_qty - 1))} disabled={product.stock_qty <= 0} aria-label="Disminuir stock">-</button>
                            <input type="number" class="w-10 text-center bg-transparent text-sm font-bold focus:outline-none" value={product.stock_qty} disabled aria-label="Cantidad de stock" />
                            <button class="w-8 h-full flex items-center justify-center hover:bg-brand-ink/10" onclick={() => updateStock(product.id, product.stock_qty + 1)} aria-label="Aumentar stock">+</button>
                        </div>
                        <div class="flex items-center gap-1 border-l border-brand-ink/10 pl-4">
                            <button onclick={() => openEditModal(product)} class="p-2 text-brand-ink/60 hover:text-brand-ink hover:bg-brand-ink/5 rounded-full transition-colors" title="Editar" aria-label="Editar producto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                            </button>
                            <button onclick={() => handleDelete(product.id)} class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Eliminar" aria-label="Eliminar producto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
  {/if}
</div>

{#if isModalOpen}
    <div 
        class="fixed inset-0 bg-brand-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
        transition:fade={{ duration: 200 }}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onkeydown={(e) => e.key === 'Escape' && (isModalOpen = false)}
        onclick={(e) => { if(e.target === e.currentTarget) isModalOpen = false }}
    >
        <div class="bg-paper-base w-full max-w-lg rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" transition:fly={{ y: 20, duration: 300 }}>
            <div class="p-6 border-b border-brand-ink/10 flex justify-between items-center bg-paper-surface">
                <h3 class="font-serif font-bold text-xl text-brand-ink">{isEditing ? 'Editar Libro' : 'Nuevo Libro'}</h3>
                <button onclick={() => isModalOpen = false} class="text-brand-ink/50 hover:text-red-500 transition-colors" aria-label="Cerrar modal">✕</button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-5">
                {#if isEditing}
                    <div class="p-3 bg-brand-ink/5 rounded-sm border border-brand-ink/10">
                        <span class="block text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">Estado</span>
                        <div class="flex gap-4">
                            {#each ['active', 'draft', 'archived'] as status}
                                <label class="flex items-center gap-2 cursor-pointer group capitalize">
                                    <input type="radio" bind:group={formData.status} value={status} class="text-accent-gold" />
                                    <span class="text-sm font-medium">{status === 'active' ? 'Activo' : (status === 'draft' ? 'Borrador' : 'Archivado')}</span>
                                </label>
                            {/each}
                        </div>
                    </div>
                {/if}
                
                <div>
                    <label class="block">
                        <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Título *</span>
                        <input type="text" bind:value={formData.title} class="w-full border border-brand-ink/20 p-2.5 rounded-sm focus:border-accent-gold outline-none" />
                    </label>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block">
                            <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Autor *</span>
                            <input type="text" bind:value={formData.author} class="w-full border border-brand-ink/20 p-2.5 rounded-sm focus:border-accent-gold outline-none" />
                        </label>
                    </div>
                    <div>
                         <label class="block">
                             <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Idioma</span>
                             <select bind:value={formData.language} class="w-full border border-brand-ink/20 p-2.5 rounded-sm bg-white focus:border-accent-gold outline-none">
                                 <option value="es">🇪🇸 Español</option>
                                 <option value="en">🇺🇸 Inglés</option>
                                 <option value="pt">🇧🇷 Portugués</option>
                             </select>
                         </label>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block">
                            <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Precio Lista *</span>
                            <input type="number" bind:value={formData.price} class="w-full border border-brand-ink/20 p-2.5 rounded-sm focus:border-accent-gold outline-none" />
                        </label>
                    </div>
                    <div>
                        <label class="block">
                            <span class="block text-xs font-bold text-accent-gold mb-1 uppercase tracking-wider flex justify-between">
                                <span>Precio Oferta</span><span class="text-[10px] opacity-70 font-normal">Opcional</span>
                            </span>
                            <input type="number" bind:value={formData.promotional_price} class="w-full border border-accent-gold/30 bg-accent-gold/5 p-2.5 rounded-sm focus:border-accent-gold outline-none" placeholder="Ej: 150000" />
                        </label>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label class="block">
                            <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Stock</span>
                            <input type="number" bind:value={formData.stock_qty} class="w-full border border-brand-ink/20 p-2.5 rounded-sm focus:border-accent-gold outline-none" />
                        </label>
                     </div>
                     <div>
                         <label class="block">
                             <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Categoría</span>
                             <select bind:value={formData.category_id} class="w-full border border-brand-ink/20 p-2.5 rounded-sm bg-white focus:border-accent-gold outline-none">
                                 {#each categories as cat} <option value={cat.id}>{cat.name}</option> {/each}
                             </select>
                         </label>
                     </div>
                </div>
                <div>
                    <label class="block">
                        <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Sinopsis</span>
                        <textarea bind:value={formData.description} rows="3" class="w-full border border-brand-ink/20 p-2.5 rounded-sm focus:border-accent-gold outline-none resize-none"></textarea>
                    </label>
                </div>
                <div>
                    <span class="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Portada</span>
                    <div class="flex items-start gap-4">
                        <div class="w-20 h-28 bg-gray-100 border border-brand-ink/10 rounded-sm overflow-hidden relative shrink-0 flex items-center justify-center">
                            {#if isUploading} <div class="animate-spin h-5 w-5 border-2 border-brand-ink/20 border-t-brand-ink rounded-full"></div>
                            {:else if formData.cover_image} <img src={formData.cover_image} alt="Preview" class="w-full h-full object-cover" /> <button onclick={() => formData.cover_image = ''} class="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-sm hover:bg-red-600" aria-label="Quitar imagen">✕</button>
                            {:else} <span class="text-xs text-brand-ink/30 px-1">Sin foto</span> {/if}
                        </div>
                        <div class="flex-1">
                            <label class="block">
                                <span class="sr-only">Subir imagen de portada</span>
                                <input type="file" accept="image/*" onchange={handleImageUpload} disabled={isUploading} class="block w-full text-xs text-brand-ink/70 file:mr-2 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-brand-ink/5 hover:file:bg-brand-ink/10 cursor-pointer" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-6 border-t border-brand-ink/10 bg-paper-surface flex justify-end gap-3">
                <button onclick={() => isModalOpen = false} class="px-4 py-2 text-sm font-bold text-brand-ink/60 hover:text-brand-ink transition-colors">Cancelar</button>
                <button onclick={handleSaveBook} disabled={isSubmitting || isUploading || !formData.title || !formData.price} class="px-6 py-2 bg-brand-ink text-white font-bold rounded-sm shadow-md hover:bg-ink-deep disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {#if isSubmitting} <div class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> {/if} {isEditing ? 'Guardar Cambios' : 'Crear Libro'}
                </button>
            </div>
        </div>
    </div>
{/if}

{#if isOrderModalOpen && selectedOrder}
    <div 
        class="fixed inset-0 bg-brand-ink/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" 
        transition:fade={{ duration: 200 }}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onkeydown={(e) => e.key === 'Escape' && (isOrderModalOpen = false)}
        onclick={(e) => { if(e.target === e.currentTarget) isOrderModalOpen = false }}
    >
        <div 
            class="bg-paper-base w-full max-w-md rounded-sm shadow-2xl overflow-hidden relative"
            transition:fly={{ y: 20, duration: 300 }}
        >
            <div class="bg-brand-ink p-6 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 4.53l-8.72 8.7a3.02 3.02 0 0 0 0 4.28l4.28 4.28a3.02 3.02 0 0 0 4.28 0l8.7-8.72a2.01 2.01 0 0 0 .6-1.43V4.5a2 2 0 0 0-2-2h-5.71a2.01 2.01 0 0 0-1.43.59V4.53z"/></svg>
                </div>
                <p class="text-xs uppercase tracking-widest opacity-60 mb-1">Pedido Web</p>
                <h2 class="font-serif text-2xl font-bold">#{selectedOrder.id.slice(0, 8)}</h2>
                
                <div class="mt-4 flex items-center gap-3">
                    <div class="relative group">
                        <label class="sr-only">Cambiar estado del pedido</label>
                        <select 
                            value={selectedOrder.status} 
                            onchange={(e) => handleChangeStatus(e.currentTarget.value)}
                            disabled={isUpdatingOrder}
                            class="appearance-none pl-3 pr-8 py-1.5 rounded text-xs font-bold uppercase tracking-wide cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition-all
                            {selectedOrder.status === 'confirmed' ? 'bg-green-500 text-white' : 
                             selectedOrder.status === 'pending_shipment' ? 'bg-orange-500 text-white' : 
                             selectedOrder.status === 'ready_for_pickup' ? 'bg-purple-500 text-white' : 
                             selectedOrder.status === 'completed' ? 'bg-blue-600 text-white' : 
                             selectedOrder.status === 'cancelled' ? 'bg-red-500 text-white' : 
                             'bg-white/20 text-white'}"
                        >
                            <option value="pending_whatsapp" class="text-brand-ink bg-white">⏳ Pendiente</option>
                            <option value="confirmed" class="text-brand-ink bg-white">✅ Confirmado / Pagado</option>
                            <option value="pending_shipment" class="text-brand-ink bg-white">📦 Pendiente de Envío</option>
                            <option value="ready_for_pickup" class="text-brand-ink bg-white">🛍️ Listo para Retiro</option>
                            <option value="completed" class="text-brand-ink bg-white">🚀 Entregado / Retirado</option>
                            <option value="cancelled" class="text-brand-ink bg-white">❌ Cancelado</option>
                        </select>
                        
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current">
                            {#if isUpdatingOrder}
                                <div class="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></div>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            {/if}
                        </div>
                    </div>

                    <span class="text-xs opacity-70">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                    </span>
                </div>

                <button onclick={() => isOrderModalOpen = false} class="absolute top-4 right-4 text-white/50 hover:text-white transition-colors" aria-label="Cerrar detalle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div>
                    <h4 class="text-xs font-bold text-brand-ink/40 uppercase tracking-wider mb-2">Datos del Cliente</h4>
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full bg-brand-ink/5 flex items-center justify-center text-brand-ink">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div>
                            <p class="font-bold text-brand-ink">{selectedOrder.customer_name}</p>
                            <a href="tel:{selectedOrder.customer_contact}" class="text-sm text-brand-ink/60 hover:text-brand-ink underline decoration-dotted">
                                {selectedOrder.customer_contact}
                            </a>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="text-xs font-bold text-brand-ink/40 uppercase tracking-wider">Productos</h4>
                        {#if selectedOrder.is_gift}
                            <span class="text-xs font-bold text-accent-gold flex items-center gap-1 bg-accent-gold/10 px-2 py-0.5 rounded-full">
                                🎁 Para Regalo
                            </span>
                        {/if}
                    </div>
                    
                    <ul class="space-y-3">
                        {#each selectedOrder.cart_snapshot as item}
                            <li class="flex justify-between items-center text-sm border-b border-brand-ink/5 pb-2 last:border-0 last:pb-0">
                                <div class="flex gap-2 items-center">
                                    <span class="font-bold text-brand-ink w-5 text-center">{item.quantity}x</span>
                                    <span class="text-brand-ink/80">{item.title}</span>
                                </div>
                                <span class="font-mono text-brand-ink/60">{formatPrice(item.price * item.quantity)}</span>
                            </li>
                        {/each}
                    </ul>
                    
                    <div class="mt-4 flex justify-between items-center pt-4 border-t border-dashed border-brand-ink/20">
                        <span class="font-bold text-brand-ink">Total General</span>
                        <span class="font-serif text-xl font-bold text-brand-ink">{formatPrice(selectedOrder.total_amount)}</span>
                    </div>

                    <div class="mt-6 bg-brand-ink/5 p-4 rounded-sm border border-brand-ink/10">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="text-xs font-bold text-brand-ink uppercase tracking-wider">Respuesta Rápida</h4>
                            <button 
                                onclick={copyPaymentResponse}
                                class="text-xs font-bold text-brand-ink/60 hover:text-brand-ink flex items-center gap-1 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                Copiar Texto
                            </button>
                        </div>
                        <p class="text-[10px] text-brand-ink/50 font-mono leading-relaxed bg-white p-2 rounded border border-brand-ink/5 truncate">
                            Hola {selectedOrder.customer_name}! Recibimos tu pedido #{selectedOrder.id.slice(0,6)}. Total: {formatPrice(selectedOrder.total_amount)}. Datos para transfe...
                        </p>
                    </div>

                </div>
            </div>

            <div class="p-6 bg-paper-surface border-t border-brand-ink/10">
                <a 
                    href={`https://wa.me/${selectedOrder.customer_contact.replace(/\s+/g, '')}?text=Hola ${selectedOrder.customer_name}, te escribo por tu pedido #${selectedOrder.id.slice(0,6)} en la librería.`}
                    target="_blank"
                    class="block w-full text-center bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Contactar al Cliente
                </a>
            </div>
        </div>
    </div>
{/if}
