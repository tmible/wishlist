import { beforeEach, describe, expect, it } from 'vitest';
import { goUpSavingNodes } from '../go-up-saving-nodes.js';

const breakpoint = { entity: { type: 'type 1' } };

describe('goUpSavingNodes', () => {
  let tree;

  beforeEach(() => {
    tree = {
      parent: null,
      children: [],
    };
    tree.children.push({
      type: 'type 1',
      parent: tree,
      children: [ 'child' ],
    });
  });

  it('should just go one level up if node type is equal to breakpoint entity type', () => {
    const [ initialNode ] = tree.children;
    expect(goUpSavingNodes(initialNode, breakpoint)).toBe(initialNode.parent);
  });

  it('should delete node if it has no children', () => {
    const [ initialNode ] = tree.children;
    initialNode.children = [];
    goUpSavingNodes(initialNode, breakpoint);
    expect(tree).toMatchSnapshot();
  });

  describe('passing several nodes', () => {
    beforeEach(() => {
      tree.children[0].children = [{
        index: 0,
        type: 'type 2',
        parent: tree.children[0],
        children: [],
      }, {
        index: 1,
        type: 'type 2',
        parent: tree.children[0],
        children: [],
      }];
      tree.children[0].children[1].children = [{
        index: 0,
        type: 'type 2',
        parent: tree.children[0].children[1],
        children: [ 'child' ],
      }];
    });

    it(
      'should go up until node type won\'t equal breakpoint ' +
      'entity type and repeat all passed nodes',
      () => {
        const [ initialNode ] = tree.children[0].children[1].children;
        goUpSavingNodes(initialNode, breakpoint);
        expect(tree).toMatchSnapshot();
      },
    );

    it('should delete all passed nodes that don\'t have children', () => {
      const [ initialNode ] = tree.children[0].children[1].children;
      initialNode.children = [];
      goUpSavingNodes(initialNode, breakpoint);
      expect(tree).toMatchSnapshot();
    });
  });
});
