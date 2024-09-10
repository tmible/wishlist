// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addParagraphBreakpointsToEveryBlockquote } from '../add-paragraph-breakpoints-to-every-blockquote.js';
import { entitiesToBreakpoints } from '../entities-to-breakpoints.js';
import { filterPreParagraphs } from '../filter-pre-paragraphs.js';
import { lineBreaksToBreakpoints } from '../line-breaks-to-breakpoints.js';
import TelegramEntitiesParser from '../parser.svelte';
import { sortBreakpoints } from '../sort-breakpoints.js';

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

/* eslint-disable-next-line @stylistic/js/max-len --
   Длинная константа, читать не нужно, хранить так проще */
const entities = JSON.parse('[{"type":"blockquote","offset":105,"length":33},{"type":"bold","offset":0,"length":7},{"type":"bold","offset":49,"length":21},{"type":"bot_command","offset":159,"length":5},{"type":"cashtag","offset":154,"length":4},{"type":"code","offset":34,"length":6},{"type":"email","offset":165,"length":17},{"type":"hashtag","offset":147,"length":6},{"type":"italic","offset":8,"length":6},{"type":"italic","offset":71,"length":13},{"type":"mention","offset":138,"length":8},{"type":"phone_number","offset":195,"length":12},{"type":"pre","offset":92,"length":13,"language":null},{"type":"spoiler","offset":41,"length":7},{"type":"spoiler","offset":117,"length":14},{"type":"strikethrough","offset":24,"length":9},{"type":"strikethrough","offset":56,"length":7},{"type":"strikethrough","offset":119,"length":5},{"type":"text_link","offset":208,"length":8,"url":"https://example.com"},{"type":"underline","offset":15,"length":8},{"type":"underline","offset":78,"length":14},{"type":"url","offset":183,"length":11}]');
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
