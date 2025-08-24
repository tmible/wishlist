<script>
  import AccentPicker from '@tmible/wishlist-ui/theme/accent-picker';
  import ModeSwitch from '@tmible/wishlist-ui/theme/mode-switch';

  /**
   * Акценты темы для выбора
   * @constant {{ id: string; label: string; color: string }[]}
   */
  const accents = [
    { id: 'blossom', label: 'цвет', color: 'pink-2' },
    { id: 'frozen', label: 'морозная', color: 'blue-1' },
    { id: 'elegant', label: 'элегантная', color: 'pink-9' },
  ];
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
    <AccentPicker {accents} />
    <ModeSwitch />
  </div>
</header>
