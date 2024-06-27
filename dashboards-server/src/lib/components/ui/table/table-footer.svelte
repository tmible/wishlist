<script>
	import { cn } from "$lib/components/ui/utils.js";
	let className = undefined;
	export { className as class };
</script>

<tfoot class={cn("bg-primary font-medium text-primary-foreground", className)} {...$$restProps}>
	<slot />
</tfoot>
