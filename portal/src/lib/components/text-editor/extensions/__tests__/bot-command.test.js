import { describe, expect, it, vi } from 'vitest';
import BotCommand from '../bot-command.js';

describe('text editor / extensions / bot command', () => {
  it('should be defined', () => {
    expect(BotCommand).toMatchSnapshot();
  });

  it('should parse HTML', () => {
    expect(BotCommand.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    expect(BotCommand.config.renderHTML()).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      BotCommand.config.addCommands().setBotCommand()({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(BotCommand.name);
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      BotCommand.config.addCommands().toggleBotCommand()({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(BotCommand.name);
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      BotCommand.config.addCommands().unsetBotCommand()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(BotCommand.name);
    });
  });

  it('should add input rules', () => {
    expect(BotCommand.config.addInputRules()).toMatchSnapshot();
  });

  it('should add paste rules', () => {
    expect(BotCommand.config.addPasteRules()).toMatchSnapshot();
  });
});
