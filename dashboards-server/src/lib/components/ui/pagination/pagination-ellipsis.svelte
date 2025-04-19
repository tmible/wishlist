<script>
	import { cn } from "$lib/components/ui/utils.js";
	import DotsHorizontal from "svelte-radix/DotsHorizontal.svelte";
	let { class: className = undefined, ...rest } = $props();
	
</script>

<span
	aria-hidden
	class={cn("flex h-9 w-9 items-center justify-center", className)}
	{...rest}
>
	<DotsHorizontal class="h-4 w-4" />
	<span class="sr-only">More pages</span>
</span>
