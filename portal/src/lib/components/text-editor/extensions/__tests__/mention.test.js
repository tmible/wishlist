import { describe, expect, it, vi } from 'vitest';
import Mention from '../mention.js';

describe('text editor / extensions / mention', () => {
  it('should be defined', () => {
    expect(Mention).toMatchSnapshot();
  });

  describe('add attributes', () => {
    it('should add attributes', () => {
      expect(Mention.config.addAttributes()).toMatchSnapshot();
    });

    it('should parse href from HTML', () => {
      const getAttribute = vi.fn();
      Mention.config.addAttributes().href.parseHTML({ getAttribute });
      expect(getAttribute).toHaveBeenCalledWith('href');
    });
  });

  it('should parse HTML', () => {
    expect(Mention.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    const bindValue = { options: { HTMLAttributes: { 'from-options': 'attribute' } } };
    const argument = { HTMLAttributes: { 'from-argument': 'attribute' } };
    expect(Mention.config.renderHTML.bind(bindValue)(argument)).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      Mention.config.addCommands().setMention('attributes')({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(Mention.name, 'attributes');
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      Mention.config.addCommands().toggleMention('attributes')({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(Mention.name, 'attributes');
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      Mention.config.addCommands().unsetMention()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(Mention.name);
    });
  });

  it('should add input rules', () => {
    expect(Mention.config.addInputRules()).toMatchSnapshot();
  });

  it('should add paste rules', () => {
    expect(Mention.config.addPasteRules()).toMatchSnapshot();
  });
});
