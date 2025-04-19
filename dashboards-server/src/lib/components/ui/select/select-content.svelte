<script>
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn, flyAndScale } from "$lib/components/ui/utils.js";
	import { scale } from "svelte/transition";
	/**
	 * @typedef {Object} Props
	 * @property {any} [class]
	 * @property {number} [sideOffset]
	 * @property {any} [inTransition]
	 * @property {any} [inTransitionConfig]
	 * @property {any} [outTransition]
	 * @property {any} [outTransitionConfig]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: className = undefined,
		sideOffset = 4,
		inTransition = flyAndScale,
		inTransitionConfig = undefined,
		outTransition = scale,
		outTransitionConfig = {
		start: 0.95,
		opacity: 0,
		duration: 50,
	},
		children,
		...rest
	} = $props();
	
</script>

<SelectPrimitive.Content
	{inTransition}
	{inTransitionConfig}
	{outTransition}
	{outTransitionConfig}
	{sideOffset}
	class={cn(
		"relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md focus:outline-none",
		className
	)}
	{...rest}
>
	<div class="w-full p-1">
		{@render children?.()}
	</div>
</SelectPrimitive.Content>
