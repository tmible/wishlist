// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addParagraphBreakpointsToEveryBlockquote } from '../add-paragraph-breakpoints-to-every-blockquote.js';
import { entitiesToBreakpoints } from '../entities-to-breakpoints.js';
import { filterPreParagraphs } from '../filter-pre-paragraphs.js';
import { lineBreaksToBreakpoints } from '../line-breaks-to-breakpoints.js';
import TelegramEntitiesParser from '../parser.svelte';
import { sortBreakpoints } from '../sort-breakpoints.js';
import entities from './parser-entities.json' with { type: 'json' };

vi.mock(
  '../add-paragraph-breakpoints-to-every-blockquote.js',
  async (importOriginal) => {
    const original = await importOriginal();
    const spy = vi.fn(original.addParagraphBreakpointsToEveryBlockquote);
    return { addParagraphBreakpointsToEveryBlockquote: spy };
  },
);
vi.mock(
  '../entities-to-breakpoints.js',
  async (importOriginal) => {
    const original = await importOriginal();
    const spy = vi.fn(original.entitiesToBreakpoints);
    return { entitiesToBreakpoints: spy };
  },
);
vi.mock(
  '../filter-pre-paragraphs.js',
  async (importOriginal) => {
    const original = await importOriginal();
    const spy = vi.fn(original.filterPreParagraphs);
    return { filterPreParagraphs: spy };
  },
);
vi.mock(
  '../line-breaks-to-breakpoints.js',
  async (importOriginal) => {
    const original = await importOriginal();
    const spy = vi.fn(original.lineBreaksToBreakpoints);
    return { lineBreaksToBreakpoints: spy };
  },
);
vi.mock(
  '../sort-breakpoints.js',
  async (importOriginal) => {
    const original = await importOriginal();
    const spy = vi.fn(original.sortBreakpoints);
    return { sortBreakpoints: spy };
  },
);

const text =
  `ueyrghi erogij woeriugh woerifrjh woeifj woeihjf woeifn woerifj woefij woiefj owiejf weiufn
oreigjnpoerkglsrgnj
eporkg erkmg wpoerg wpoef
@wlkergn #erkbn $KDF /ernm ev@jewpeorij.lnjf example.com +12345678901 ldtkrhnj`;

describe('telegram entities parser', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should convert entities to breakpoints', () => {
    render(TelegramEntitiesParser, { entities, text });
    expect(entitiesToBreakpoints).toHaveBeenCalledWith(entities);
  });

  it('should consider line breaks as breakpoints', () => {
    render(TelegramEntitiesParser, { entities, text });
    expect(
      lineBreaksToBreakpoints,
    ).toHaveBeenCalledWith(
      Array.from(text.matchAll(/(?!^)\n(?!$)/g)),
      text.length,
    );
  });

  it('should add paragraph breakpoints to every blockquote', () => {
    render(TelegramEntitiesParser, { entities, text });
    expect(addParagraphBreakpointsToEveryBlockquote).toHaveBeenCalled();
  });

  it('should filter pre paragraphs', () => {
    render(TelegramEntitiesParser, { entities, text });
    expect(filterPreParagraphs).toHaveBeenCalled();
  });

  it('should sort breakpoints', () => {
    render(TelegramEntitiesParser, { entities, text });
    expect(sortBreakpoints).toHaveBeenCalled();
  });

  it('should build and display tree', () => {
    const { container } = render(TelegramEntitiesParser, { entities, text });
    expect(container.innerHTML).toMatchSnapshot();
  });
});
