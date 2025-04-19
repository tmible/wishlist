<script>
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<ul class={cn("flex flex-row items-center gap-1", className)} {...rest}>
	{@render children?.()}
</ul>
