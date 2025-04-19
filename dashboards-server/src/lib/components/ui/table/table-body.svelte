<script>
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<tbody class={cn("[&_tr:last-child]:border-0", className)} {...rest}>
	{@render children?.()}
</tbody>
