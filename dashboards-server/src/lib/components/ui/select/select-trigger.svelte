<script>
	import { Select as SelectPrimitive } from "bits-ui";
	import CaretSort from "svelte-radix/CaretSort.svelte";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<SelectPrimitive.Trigger
	class={cn(
		"flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
		className
	)}
	{...rest}
>
	{@render children?.()}
	<div>
		<CaretSort class="h-4 w-4 opacity-50" />
	</div>
</SelectPrimitive.Trigger>
