/** @typedef {import('./parser.svelte').EntitiesTreeNode} EntitiesTreeNode */
/** @typedef {import('./parser.svelte').Breakpoint} Breakpoint */

/**
 * Переход к родителю узла дерева с удалением текущего, если у него нет потомков
 * @function stepUpDeletingEmptyChild
 * @param {EntitiesTreeNode} node Узел дерева
 * @returns {EntitiesTreeNode} Новый узел дерева
 */
const stepUpDeletingEmptyChild = (node) => {
  const indexToDelete = node.children.length === 0 ? node.index : null;
  if (indexToDelete !== null) {
    node.parent.children.splice(
      node.parent.children.findIndex(({ index }) => index === indexToDelete),
      1,
    );
  }
  return node.parent;
};

/**
 * Закрытие элемента разметки текста с сохранением всех действующих. Фактически переход вверх
 * по дереву до нужного узла с запоминанием пройденных узлов и их повтоорением уже на одном уровне
 * с закрытым элементом
 * @function goUpSavingNodes
 * @param {EntitiesTreeNode} initialNode Изначальный текущий узел дерева
 * @param {Breakpoint} breakpoint Закрывающая точка изменения разметки текста
 * @returns {EntitiesTreeNode} Новый текущий узел дерева
 */
export const goUpSavingNodes = (initialNode, breakpoint) => {
  let node = initialNode;
  const repeatChildren = [];
  while (node.type !== breakpoint.entity.type) {
    repeatChildren.push(node.type);
    node = stepUpDeletingEmptyChild(node);
  }
  node = stepUpDeletingEmptyChild(node);
  while (repeatChildren.length > 0) {
    node.children.push({
      index: node.children.length,
      type: repeatChildren.pop(),
      children: [],
      parent: node,
    });
    node = node.children.at(-1);
  }
  return node;
};
