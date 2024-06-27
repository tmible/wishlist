<script>
	import { cn } from "$lib/components/ui/utils.js";
	let className = undefined;
	export { className as class };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={cn("rounded-xl border bg-card text-card-foreground shadow transition-colors", className)}
	{...$$restProps}
	on:click
	on:focusin
	on:focusout
	on:mouseenter
	on:mouseleave
>
	<slot />
</div>
