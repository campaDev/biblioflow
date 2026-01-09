<script lang="ts">
  import { formatPrice } from '@utils/formatting';

  // Recibimos los datos calculados desde el servidor
  let { stats } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  
  <div class="bg-paper-base p-5 rounded-sm shadow-sm border border-brand-ink/5 relative overflow-hidden group">
    <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-brand-ink">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
    </div>
    <p class="text-xs font-bold text-brand-ink/50 uppercase tracking-widest mb-1">Oportunidades (Leads)</p>
    <h3 class="text-3xl font-serif font-bold text-brand-ink">{stats.totalLeads}</h3>
    <p class="text-[10px] text-brand-ink/40 mt-2">Pedidos iniciados en la web</p>
  </div>

  <div class="bg-paper-base p-5 rounded-sm shadow-sm border border-brand-ink/5 relative overflow-hidden group">
    <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-green-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    </div>
    <p class="text-xs font-bold text-green-600/70 uppercase tracking-widest mb-1">Ventas Cerradas</p>
    <h3 class="text-3xl font-serif font-bold text-brand-ink">{stats.closedSales}</h3>
    <p class="text-[10px] text-brand-ink/40 mt-2">Pagados o Entregados</p>
  </div>

  <div class="bg-paper-base p-5 rounded-sm shadow-sm border border-brand-ink/5 relative overflow-hidden group">
    <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
    </div>
    <p class="text-xs font-bold text-blue-600/70 uppercase tracking-widest mb-1">Efectividad</p>
    <h3 class="text-3xl font-serif font-bold text-brand-ink">{stats.conversionRate}%</h3>
    <p class="text-[10px] text-brand-ink/40 mt-2">De Lead a Cliente Real</p>
  </div>

  <div class="bg-brand-ink p-5 rounded-sm shadow-md relative overflow-hidden group text-white">
    <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-accent-gold">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    </div>
    <p class="text-xs font-bold text-accent-gold uppercase tracking-widest mb-1">Ingresos Web</p>
    <h3 class="text-3xl text-paper-base font-serif font-bold">{formatPrice(stats.totalRevenue)}</h3>
    <p class="text-[10px] text-white/40 mt-2">Generados por la plataforma</p>
  </div>

</div>
