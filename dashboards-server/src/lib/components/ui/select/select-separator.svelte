<script>
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/components/ui/utils.js";
	let { class: className = undefined, ...rest } = $props();
	
</script>

<SelectPrimitive.Separator class={cn("-mx-1 my-1 h-px bg-muted", className)} {...rest} />
