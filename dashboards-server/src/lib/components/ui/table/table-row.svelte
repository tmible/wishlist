<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<tr
	class={cn(
		"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
		className
	)}
	{...rest}
	onclick={bubble('click')}
	onkeydown={bubble('keydown')}
>
	{@render children?.()}
</tr>
