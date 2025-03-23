<script>
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
</script>

<header class="navbar">
  <div class="pl-12 md:pl-24 mr-auto relative self-start">
    <a href="https://t.me/tmible" target="_blank">
      <div class="absolute top-[-0.5rem] p-2 bg-[#ffd1dc]" data-theme="light">
        tmible
      </div>
    </a>
  </div>
  <div class="mr-4">
    <ThemeSwitcher />
  </div>
</header>
