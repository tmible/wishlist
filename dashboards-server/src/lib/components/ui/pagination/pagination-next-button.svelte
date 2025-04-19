<script>
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/components/ui/utils.js";
	import ChevronRight from "svelte-radix/ChevronRight.svelte";
	let { class: className = undefined, children, ...rest } = $props();
	

	const children_render = $derived(children);
</script>

<PaginationPrimitive.NextButton asChild >
	{#snippet children({ builder })}
		<Button
			variant="ghost"
			class={cn("gap-1 px-2.5", className)}
			builders={[builder]}
			on:click
			{...rest}
		>
			{#if children_render}{@render children_render()}{:else}
				<ChevronRight class="h-4 w-4" />
			{/if}
		</Button>
	{/snippet}
</PaginationPrimitive.NextButton>
