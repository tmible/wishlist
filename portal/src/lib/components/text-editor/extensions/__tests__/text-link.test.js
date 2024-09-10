import { describe, expect, it, vi } from 'vitest';
import TextLink from '../text-link.js';

describe('text editor / extensions / text link', () => {
  it('should be defined', () => {
    expect(TextLink).toMatchSnapshot();
  });

  describe('add attributes', () => {
    it('should add attributes', () => {
      expect(TextLink.config.addAttributes()).toMatchSnapshot();
    });

    it('should parse href from HTML', () => {
      const getAttribute = vi.fn();
      TextLink.config.addAttributes().href.parseHTML({ getAttribute });
      expect(getAttribute).toHaveBeenCalledWith('href');
    });
  });

  it('should parse HTML', () => {
    expect(TextLink.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    const bindValue = { options: { HTMLAttributes: { 'from-options': 'attribute' } } };
    const argument = { HTMLAttributes: { 'from-argument': 'attribute' } };
    expect(TextLink.config.renderHTML.bind(bindValue)(argument)).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      TextLink.config.addCommands().setTextLink('attributes')({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(TextLink.name, 'attributes');
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      TextLink.config.addCommands().toggleTextLink('attributes')({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(TextLink.name, 'attributes');
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      TextLink.config.addCommands().unsetTextLink()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(TextLink.name);
    });
  });
});
