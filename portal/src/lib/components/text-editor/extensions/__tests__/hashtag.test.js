import { describe, expect, it, vi } from 'vitest';
import Hashtag from '../hashtag.js';

describe('text editor / extensions / hashtag', () => {
  it('should be defined', () => {
    expect(Hashtag).toMatchSnapshot();
  });

  it('should parse HTML', () => {
    expect(Hashtag.config.parseHTML()).toMatchSnapshot();
  });

  it('should render HTML', () => {
    expect(Hashtag.config.renderHTML()).toMatchSnapshot();
  });

  describe('add commands', () => {
    it('should add set command', () => {
      const setMark = vi.fn();
      Hashtag.config.addCommands().setHashtag()({ commands: { setMark } });
      expect(setMark).toHaveBeenCalledWith(Hashtag.name);
    });

    it('should add toggle command', () => {
      const toggleMark = vi.fn();
      Hashtag.config.addCommands().toggleHashtag()({ commands: { toggleMark } });
      expect(toggleMark).toHaveBeenCalledWith(Hashtag.name);
    });

    it('should add unset command', () => {
      const unsetMark = vi.fn();
      Hashtag.config.addCommands().unsetHashtag()({ commands: { unsetMark } });
      expect(unsetMark).toHaveBeenCalledWith(Hashtag.name);
    });
  });

  it('should add input rules', () => {
    expect(Hashtag.config.addInputRules()).toMatchSnapshot();
  });

  it('should add paste rules', () => {
    expect(Hashtag.config.addPasteRules()).toMatchSnapshot();
  });
});
