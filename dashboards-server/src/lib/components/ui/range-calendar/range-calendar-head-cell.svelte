<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<RangeCalendarPrimitive.HeadCell
	class={cn("w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground", className)}
	{...rest}
>
	{@render children?.()}
</RangeCalendarPrimitive.HeadCell>
