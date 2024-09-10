import { describe, expect, it, vi } from 'vitest';
import Cashtag from '../cashtag.js';

describe('text editor / extensions / cashtag', () => {
  it('should be defined', () => {
    expect(Cashtag).toMatchSnapshot();
  });

  it('should parse HTML', () => {
    expect(Cashtag.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    expect(Cashtag.config.renderHTML()).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      Cashtag.config.addCommands().setCashtag()({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(Cashtag.name);
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      Cashtag.config.addCommands().toggleCashtag()({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(Cashtag.name);
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      Cashtag.config.addCommands().unsetCashtag()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(Cashtag.name);
    });
  });

  it('should add input rules', () => {
    expect(Cashtag.config.addInputRules()).toMatchSnapshot();
  });

  it('should add paste rules', () => {
    expect(Cashtag.config.addPasteRules()).toMatchSnapshot();
  });
});
