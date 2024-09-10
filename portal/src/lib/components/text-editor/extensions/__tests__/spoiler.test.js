import { describe, expect, it, vi } from 'vitest';
import Spoiler from '../spoiler.js';

describe('text editor / extensions / spoiler', () => {
  it('should be defined', () => {
    expect(Spoiler).toMatchSnapshot();
  });

  it('should parse HTML', () => {
    expect(Spoiler.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    expect(Spoiler.config.renderHTML()).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      Spoiler.config.addCommands().setSpoiler()({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(Spoiler.name);
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      Spoiler.config.addCommands().toggleSpoiler()({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(Spoiler.name);
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      Spoiler.config.addCommands().unsetSpoiler()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(Spoiler.name);
    });
  });

  describe('add keyboard shortcuts', () => {
    it('should add keyboard shortcuts', () => {
      expect(Spoiler.config.addKeyboardShortcuts()).toMatchSnapshot();
    });

    it('should implement keyboard shortcut', () => {
      const toggleSpoiler = vi.fn();
      const bindValue = { editor: { commands: { toggleSpoiler } } };
      Spoiler.config.addKeyboardShortcuts.bind(bindValue)()['Mod-Shift-p']();
      expect(toggleSpoiler).toHaveBeenCalled();
    });
  });
});
