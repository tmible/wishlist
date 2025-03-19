<!-- Svelte компонент для отображения узла дерева элементов разметки текста в HTML -->
<script>
  import TelegramEntity from './telegram-entity.svelte';

  /** @typedef {import('./telegram-entities-parser.js').EntitiesTreeNode} EntitiesTreeNode */

  /**
   * @typedef {object} Props
   * @property {EntitiesTreeNode} node Узел дерева для отображения
   */

  /** @type {Props} */
  const { node } = $props();

  /**
   * Тэг HTML элемента, соответствующего типу представляемой узлом сущности
   * @type {string | undefined}
   */
  let tag = $state();

  /**
   * Атрибуты HTML элемента, соответствующего типу представляемой узлом сущности
   * @type {Record<string, string>}
   */
  let attributes = $state({});

  /**
   * Подбор [тэга]{@link tag} и [атрибутов]{@link attributes} HTML элемента по типу
   * [узла дерева]{@link node}
   */
  // eslint-disable-next-line max-lines-per-function, max-statements -- Один большой switch
  $effect(() => {
    switch (node.type) {
      case 'bold': {
        tag = 'b';
        break;
      }
      case 'italic': {
        tag = 'i';
        break;
      }
      case 'underline': {
        tag = 'u';
        break;
      }
      case 'strikethrough': {
        tag = 's';
        break;
      }
      case 'code': {
        tag = 'code';
        break;
      }
      case 'blockquote': {
        tag = 'blockquote';
        attributes = { class: 'prose' };
        break;
      }
      case 'pre': {
        tag = 'pre';
        attributes = { language: node.language ?? null };
        break;
      }
      case 'url': {
        tag = 'a';
        attributes = {
          href: node.children[0].text.trim().replace(/^(?!https?:\/\/)|^http:\/\//, 'https://'),
        };
        break;
      }
      case 'text_link': {
        tag = 'a';
        attributes = {
          href: node.url ?? null,
          'data-entity': node.type,
        };
        break;
      }
      case 'spoiler': {
        tag = 'span';
        attributes = {
          class: 'text-transparent hover:text-base-content spoiler',
          'data-entity': node.type,
        };
        break;
      }
      case 'mention': {
        tag = 'a';
        attributes = {
          href: `https://t.me/${node.children[0].text.replace(/^@/, '')}`,
          'data-entity': node.type,
        };
        break;
      }
      case 'hashtag':
      case 'bot_command':
      case 'cashtag': {
        tag = 'span';
        attributes = {
          class: 'link cursor-auto',
          'data-entity': node.type,
        };
        break;
      }
      case 'email': {
        tag = 'a';
        attributes = {
          href: `mailto:${node.children[0].text}`,
          'data-entity': node.type,
        };
        break;
      }
      case 'phone_number': {
        tag = 'a';
        attributes = {
          href: `tel:${node.children[0].text}`,
          'data-entity': node.type,
        };
        break;
      }
      case 'paragraph': {
        tag = 'p';
        attributes = { class: 'break-words' };
        break;
      }
      default: {
        tag = undefined;
        attributes = {};
        break;
      }
    }
  });
</script>

{#if tag}
  <svelte:element this={tag} {...attributes}>
    {#each node.children as { index, ...child } (index)}
      <TelegramEntity node={child} />
    {/each}
  </svelte:element>
{:else if [ 'mention_name', 'bank_card', 'custom_emoji' ].includes(node.type)}
  {node.text.trim()}
{:else}
  {node.text}
{/if}
