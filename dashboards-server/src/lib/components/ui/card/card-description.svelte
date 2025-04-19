<script>
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<p class={cn("text-sm text-muted-foreground", className)} {...rest}>
	{@render children?.()}
</p>
