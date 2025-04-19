<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<RangeCalendarPrimitive.Header
	class={cn("relative flex w-full items-center justify-between pt-1", className)}
	{...rest}
>
	{@render children?.()}
</RangeCalendarPrimitive.Header>
