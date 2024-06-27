<script>
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/components/ui/utils.js";
	import ChevronLeft from "svelte-radix/ChevronLeft.svelte";
	let className = undefined;
	export { className as class };
</script>

<PaginationPrimitive.PrevButton asChild let:builder>
	<Button
		variant="ghost"
		class={cn("gap-1 px-2.5", className)}
		builders={[builder]}
		on:click
		{...$$restProps}
	>
		<slot>
			<ChevronLeft class="h-4 w-4" />
		</slot>
	</Button>
</PaginationPrimitive.PrevButton>
