<script>
	import { cn } from "$lib/components/ui/utils.js";
	let className = undefined;
	export let tag = "h3";
	export { className as class };
</script>

<svelte:element
	this={tag}
	class={cn("font-semibold leading-none tracking-tight", className)}
	{...$$restProps}
>
	<slot />
</svelte:element>
