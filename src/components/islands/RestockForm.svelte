<script lang="ts">
  import { actions } from "astro:actions";
  import { fade } from "svelte/transition";

  let { productId } = $props();

  let contact = $state("");
  let isSubmitting = $state(false);
  let isSuccess = $state(false);
  let errorMessage = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    errorMessage = "";

    try {
      const { error } = await actions.requestRestock({ productId, contact });
      if (error) throw error;
      isSuccess = true;
    } catch (err: any) {
      errorMessage = err.message || "Ocurrió un error.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div
  class="bg-paper-surface border-2 border-dashed border-brand-ink/10 p-5 md:p-6 rounded-sm mt-6 overflow-hidden"
>
  {#if isSuccess}
    <div in:fade class="text-center space-y-2">
      <div
        class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline
            points="22 4 12 14.01 9 11.01"
          /></svg
        >
      </div>
      <h3 class="font-serif font-bold text-lg text-brand-ink">
        ¡Te avisaremos!
      </h3>
      <p class="text-sm text-brand-ink/60">
        Guardamos tu contacto. Si vuelve a entrar, serás el primero en saberlo.
      </p>
    </div>
  {:else}
    <div in:fade>
      <div class="flex items-center gap-2 mb-3 text-brand-ink/50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          /><line x1="12" y1="9" x2="12" y2="13" /><line
            x1="12"
            y1="17"
            x2="12.01"
            y2="17"
          /></svg
        >
        <span class="text-[10px] md:text-xs font-bold uppercase tracking-wider"
          >Agotado Temporalmente</span
        >
      </div>

      <h3
        class="font-serif font-bold text-lg md:text-xl text-brand-ink mb-2 leading-tight"
      >
        ¿Buscas este libro?
      </h3>
      <p class="text-xs md:text-sm text-brand-ink/70 mb-4">
        Este ejemplar ya se vendió, pero déjanos tu contacto y te avisaremos si
        conseguimos otro.
      </p>

      <form onsubmit={handleSubmit} class="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          bind:value={contact}
          placeholder="WhatsApp o Email..."
          required
          disabled={isSubmitting}
          class="flex-1 bg-white border border-brand-ink/20 px-4 py-3 md:py-2 rounded-sm text-sm focus:border-accent-gold outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSubmitting || contact.length < 5}
          class="bg-brand-ink text-white font-bold text-sm px-6 py-3 md:py-2 rounded-sm hover:bg-ink-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSubmitting ? "Procesando..." : "Avísame"}
        </button>
      </form>

      {#if errorMessage}
        <p class="text-xs text-red-500 mt-2">{errorMessage}</p>
      {/if}
    </div>
  {/if}
</div>
