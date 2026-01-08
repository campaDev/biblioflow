declare module "astro:actions" {
	type Actions = typeof import("/Users/hugocampanoli/Code/biblioflow/src/actions/index.ts")["server"];

	export const actions: Actions;
}