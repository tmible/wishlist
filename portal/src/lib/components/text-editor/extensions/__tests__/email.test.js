import { describe, expect, it, vi } from 'vitest';
import Email from '../email.js';

describe('text editor / extensions / email', () => {
  it('should be defined', () => {
    expect(Email).toMatchSnapshot();
  });

  describe('add attributes', () => {
    it('should add attributes', () => {
      expect(Email.config.addAttributes()).toMatchSnapshot();
    });

    it('should parse href from HTML', () => {
      const getAttribute = vi.fn();
      Email.config.addAttributes().href.parseHTML({ getAttribute });
      expect(getAttribute).toHaveBeenCalledWith('href');
    });
  });

  it('should parse HTML', () => {
    expect(Email.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    const bindValue = { options: { HTMLAttributes: { 'from-options': 'attribute' } } };
    const argument = { HTMLAttributes: { 'from-argument': 'attribute' } };
    expect(Email.config.renderHTML.bind(bindValue)(argument)).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      Email.config.addCommands().setEmail('attributes')({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(Email.name, 'attributes');
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      Email.config.addCommands().toggleEmail('attributes')({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(Email.name, 'attributes');
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      Email.config.addCommands().unsetEmail()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(Email.name);
    });
  });

  it('should add input rules', () => {
    expect(Email.config.addInputRules()).toMatchSnapshot();
  });

  it('should add paste rules', () => {
    expect(Email.config.addPasteRules()).toMatchSnapshot();
  });
});
