// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import TelegramEntity from '../telegram-entity.svelte';

describe('telegram entity', () => {
  let node;

  beforeEach(() => {
    node = {
      type: 'type',
      children: [],
    };
  });

  afterEach(cleanup);

  it('should display bold', () => {
    node.type = 'bold';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display italic', () => {
    node.type = 'italic';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display underline', () => {
    node.type = 'underline';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display strikethrough', () => {
    node.type = 'strikethrough';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display code', () => {
    node.type = 'code';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display blockquote', () => {
    node.type = 'blockquote';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  describe('pre', () => {
    beforeEach(() => node.type = 'pre');

    it('should display pre without language', () => {
      const { container } = render(TelegramEntity, { node });
      expect(container.innerHTML).toMatchSnapshot();
    });
    it('should display pre with language', () => {
      node.language = 'javascript';
      const { container } = render(TelegramEntity, { node });
      expect(container.innerHTML).toMatchSnapshot();
    });
  });

  describe('url', () => {
    beforeEach(() => node.type = 'url');

    it('should display url without protocol', () => {
      node.children = [{ text: 'example.com' }];
      const { container } = render(TelegramEntity, { node });
      expect(container.innerHTML).toMatchSnapshot();
    });

    it('should display url with http protocol', () => {
      node.children = [{ text: 'http://example.com' }];
      const { container } = render(TelegramEntity, { node });
      expect(container.innerHTML).toMatchSnapshot();
    });

    it('should display url with https protocol', () => {
      node.children = [{ text: 'https://example.com' }];
      const { container } = render(TelegramEntity, { node });
      expect(container.innerHTML).toMatchSnapshot();
    });
  });

  describe('text_link', () => {
    beforeEach(() => node.type = 'text_link');

    it('should display text_link without url', () => {
      const { container } = render(TelegramEntity, { node });
      expect(container.innerHTML).toMatchSnapshot();
    });

    it('should display text_link with url', () => {
      node.url = 'https://example.com';
      const { container } = render(TelegramEntity, { node });
      expect(container.innerHTML).toMatchSnapshot();
    });
  });

  it('should display spoiler', () => {
    node.type = 'spoiler';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display mention', () => {
    node.type = 'mention';
    node.children = [{ text: '@mention' }];
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display hashtag', () => {
    node.type = 'hashtag';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display bot_command', () => {
    node.type = 'bot_command';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display cashtag', () => {
    node.type = 'cashtag';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display email', () => {
    node.type = 'email';
    node.children = [{ text: 'email' }];
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display phone_number', () => {
    node.type = 'phone_number';
    node.children = [{ text: 'phone_number' }];
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display paragraph', () => {
    node.type = 'paragraph';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display mention_name', () => {
    node.type = 'mention_name';
    node.text = '  text\n ';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display bank_card', () => {
    node.type = 'bank_card';
    node.text = '  text\n ';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display custom_emoji', () => {
    node.type = 'custom_emoji';
    node.text = '  text\n ';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display default', () => {
    node.text = 'text';
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should display children recursively', () => {
    node.type = 'bold';
    node.children = [{
      type: 'italic',
      children: [{
        type: 'underline',
        children: [{ text: 'formatted' }],
      }],
    }];
    const { container } = render(TelegramEntity, { node });
    expect(container.innerHTML).toMatchSnapshot();
  });
});
