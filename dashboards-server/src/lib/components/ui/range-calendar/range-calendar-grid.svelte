<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<RangeCalendarPrimitive.Grid
	class={cn("w-full border-collapse space-y-1", className)}
	{...rest}
>
	{@render children?.()}
</RangeCalendarPrimitive.Grid>
