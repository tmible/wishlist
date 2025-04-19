<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	

	const children_render = $derived(children);
</script>

<RangeCalendarPrimitive.Heading
	
	class={cn("text-sm font-medium", className)}
	{...rest}
>
	{#snippet children({ headingValue })}
		{#if children_render}{@render children_render({ headingValue, })}{:else}
			{headingValue}
		{/if}
	{/snippet}
</RangeCalendarPrimitive.Heading>
