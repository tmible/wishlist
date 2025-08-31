<!-- https://github.com/flo-bit/svelte-swiper-cards -->
<!-- 62d93b2ed39794899b6d293693ecc45850c4f921 -->
<!--
Copyright 2024 flo-bit
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
<script lang="ts">
	interface Props {
		element: HTMLElement;
		title?: string;
		description?: string;
		image?: string | undefined;
	}

	let {
		element = $bindable(),
		title = '',
		description = '',
		image = undefined
	}: Props = $props();
</script>

<div
	class="w-full h-full absolute cursor-grab ease-in-out rounded-xl touch-none select-none md:border bg-base-100"
	bind:this={element}
>
	{#key image}
		{#if image}
			<img class="w-full h-full rounded-xl object-cover" src={image} alt={title} />
		{/if}
	{/key}
	<div class="absolute inset-0 from-white/80 via-white/0 rounded-b-xl"></div>
	<div class="p-4 absolute bottom-0 w-full flex justify-center">
		<div class="flex items-center flex-col">
			<h3 class="text-3xl font-semibold pb-4 text-center">{title}</h3>
			<p>{description}</p>
		</div>
	</div>
</div>
