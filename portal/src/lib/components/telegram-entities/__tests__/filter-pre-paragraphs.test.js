import { beforeEach, describe, expect, it } from 'vitest';
import { filterPreParagraphs } from '../filter-pre-paragraphs.js';

describe('filterPreParagraphs', () => {
  let breakpoint;
  let otherBreakpoint;

  beforeEach(() => {
    breakpoint = {
      offset: 0,
      entity: {
        type: 'paragraph',
        offset: 0,
        length: 0,
      },
      type: 'opening',
    };

    otherBreakpoint = {
      offset: 0,
      entity: {
        type: 'pre',
      },
      type: 'opening',
    };
  });

  it('should return true if original breakpoint\'s entity type is not "paragraph"', () => {
    breakpoint.entity.type = 'type';
    expect(filterPreParagraphs(breakpoint, undefined, [ otherBreakpoint ])).toBe(true);
  });

  it(
    'should return false if there is another breakpoint at the same ' +
    'offset with the same type with entity type "paragraph"',
    () => {
      expect(filterPreParagraphs(breakpoint, undefined, [ otherBreakpoint ])).toBe(false);
    },
  );

  it('should return true if there is no other breakpoint at the same offset', () => {
    otherBreakpoint.offset = 1;
    expect(filterPreParagraphs(breakpoint, undefined, [ otherBreakpoint ])).toBe(true);
  });

  it('should return true if there is no other breakpoint with entity type "pre"', () => {
    otherBreakpoint.entity.type = 'type';
    expect(filterPreParagraphs(breakpoint, undefined, [ otherBreakpoint ])).toBe(true);
  });

  it('should return true if there is no other breakpoint with the same type', () => {
    otherBreakpoint.type = 'closing';
    expect(filterPreParagraphs(breakpoint, undefined, [ otherBreakpoint ])).toBe(true);
  });
});
