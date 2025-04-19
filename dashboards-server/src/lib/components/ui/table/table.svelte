<script>
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<div class="w-full overflow-auto">
	<table class={cn("w-full caption-bottom text-sm", className)} {...rest}>
		{@render children?.()}
	</table>
</div>
