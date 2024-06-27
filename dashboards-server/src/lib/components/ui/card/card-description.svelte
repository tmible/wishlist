<script>
	import { cn } from "$lib/components/ui/utils.js";
	let className = undefined;
	export { className as class };
</script>

<p class={cn("text-sm text-muted-foreground", className)} {...$$restProps}>
	<slot />
</p>
