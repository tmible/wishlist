<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, children, ...rest } = $props();
	
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={cn("rounded-xl border bg-card text-card-foreground shadow transition-colors", className)}
	{...rest}
	onclick={bubble('click')}
	onfocusin={bubble('focusin')}
	onfocusout={bubble('focusout')}
	onmouseenter={bubble('mouseenter')}
	onmouseleave={bubble('mouseleave')}
>
	{@render children?.()}
</div>
