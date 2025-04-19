<script>
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<div class={cn("p-3 md:p-6 pt-0", className)} {...rest}>
	{@render children?.()}
</div>
