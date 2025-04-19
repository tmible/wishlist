<script>
	import { cn } from "$lib/components/ui/utils.js";
	import { Select as SelectPrimitive } from "bits-ui";
	import Check from "svelte-radix/Check.svelte";
	let {
		class: className = undefined,
		value,
		label = undefined,
		disabled = undefined,
		children,
		...rest
	} = $props();
	
</script>

<SelectPrimitive.Item
	{value}
	{disabled}
	{label}
	class={cn(
		"relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
		className
	)}
	{...rest}
	on:click
	on:pointermove
	on:focusin
>
	<span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
		<SelectPrimitive.ItemIndicator>
			<Check class="h-4 w-4" />
		</SelectPrimitive.ItemIndicator>
	</span>
	{#if children}{@render children()}{:else}
		{label ? label : value}
	{/if}
</SelectPrimitive.Item>
