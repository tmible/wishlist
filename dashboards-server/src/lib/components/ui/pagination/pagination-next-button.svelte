<script>
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/components/ui/utils.js";
	import ChevronRight from "svelte-radix/ChevronRight.svelte";
	let className = undefined;
	export { className as class };
</script>

<PaginationPrimitive.NextButton asChild let:builder>
	<Button
		variant="ghost"
		class={cn("gap-1 px-2.5", className)}
		builders={[builder]}
		on:click
		{...$$restProps}
	>
		<slot>
			<ChevronRight class="h-4 w-4" />
		</slot>
	</Button>
</PaginationPrimitive.NextButton>
