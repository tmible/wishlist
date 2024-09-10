import { beforeEach, describe, expect, it } from 'vitest';
import { addParagraphBreakpointsToEveryBlockquote } from '../add-paragraph-breakpoints-to-every-blockquote.js';

// eslint-disable-next-line no-secrets/no-secrets -- Просто длинное название
describe('addParagraphBreakpointsToEveryBlockquote', () => {
  let breakpoint;
  let otherBreakpoint;
  let newBreakpoint;

  beforeEach(() => {
    breakpoint = {
      offset: 0,
      entity: {
        type: 'blockquote',
        offset: 0,
        length: 0,
      },
      type: 'opening',
    };

    otherBreakpoint = {
      offset: 0,
      entity: {
        type: 'paragraph',
      },
      type: 'opening',
    };

    newBreakpoint = {
      offset: breakpoint.offset,
      entity: {
        type: 'paragraph',
        length: breakpoint.length,
      },
      type: breakpoint.type,
    };
  });

  it('should return original breakpoint if it\'s entity type is not "blockquote"', () => {
    breakpoint.entity.type = 'type';
    expect(
      addParagraphBreakpointsToEveryBlockquote(breakpoint, undefined, [ otherBreakpoint ]),
    ).toEqual(
      [ breakpoint ],
    );
  });

  it(
    'should return original breakpoint there is another breakpoint at the same ' +
    'offset with the same type with entity type "paragraph"',
    () => {
      expect(
        addParagraphBreakpointsToEveryBlockquote(breakpoint, undefined, [ otherBreakpoint ]),
      ).toEqual(
        [ breakpoint ],
      );
    },
  );

  it(
    'should return original breakpoint and new breakpoint if there is ' +
    'no other breakpoint at the same offset',
    () => {
      otherBreakpoint.offset = 1;
      expect(
        addParagraphBreakpointsToEveryBlockquote(breakpoint, undefined, [ otherBreakpoint ]),
      ).toEqual(
        [ breakpoint, newBreakpoint ],
      );
    },
  );

  it(
    'should return original breakpoint and new breakpoint if there is ' +
    'no other breakpoint with entity type "paragraph"',
    () => {
      otherBreakpoint.entity.type = 'type';
      expect(
        addParagraphBreakpointsToEveryBlockquote(breakpoint, undefined, [ otherBreakpoint ]),
      ).toEqual(
        [ breakpoint, newBreakpoint ],
      );
    },
  );

  it(
    'should return original breakpoint and new breakpoint if there is ' +
    'no other breakpoint with the same type',
    () => {
      otherBreakpoint.type = 'closing';
      expect(
        addParagraphBreakpointsToEveryBlockquote(breakpoint, undefined, [ otherBreakpoint ]),
      ).toEqual(
        [ breakpoint, newBreakpoint ],
      );
    },
  );
});
