<script>
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<SelectPrimitive.Label class={cn("px-2 py-1.5 text-sm font-semibold", className)} {...rest}>
	{@render children?.()}
</SelectPrimitive.Label>
