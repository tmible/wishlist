import { describe, expect, it, vi } from 'vitest';
import Phone from '../phone.js';

describe('text editor / extensions / phone', () => {
  it('should be defined', () => {
    expect(Phone).toMatchSnapshot();
  });

  describe('add attributes', () => {
    it('should add attributes', () => {
      expect(Phone.config.addAttributes()).toMatchSnapshot();
    });

    it('should parse href from HTML', () => {
      const getAttribute = vi.fn();
      Phone.config.addAttributes().href.parseHTML({ getAttribute });
      expect(getAttribute).toHaveBeenCalledWith('href');
    });
  });

  it('should parse HTML', () => {
    expect(Phone.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    const bindValue = { options: { HTMLAttributes: { 'from-options': 'attribute' } } };
    const argument = { HTMLAttributes: { 'from-argument': 'attribute' } };
    expect(Phone.config.renderHTML.bind(bindValue)(argument)).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      Phone.config.addCommands().setPhone('attributes')({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(Phone.name, 'attributes');
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      Phone.config.addCommands().togglePhone('attributes')({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(Phone.name, 'attributes');
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      Phone.config.addCommands().unsetPhone()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(Phone.name);
    });
  });

  it('should add input rules', () => {
    expect(Phone.config.addInputRules()).toMatchSnapshot();
  });

  it('should add paste rules', () => {
    expect(Phone.config.addPasteRules()).toMatchSnapshot();
  });
});
