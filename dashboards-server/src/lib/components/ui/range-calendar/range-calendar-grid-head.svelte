<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<RangeCalendarPrimitive.GridHead class={cn(className)} {...rest}>
	{@render children?.()}
</RangeCalendarPrimitive.GridHead>
