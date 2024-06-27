<script>
	import { cn } from "$lib/components/ui/utils.js";
	let className = undefined;
	export { className as class };
</script>

<div class={cn("p-3 md:p-6 pt-0", className)} {...$$restProps}>
	<slot />
</div>
