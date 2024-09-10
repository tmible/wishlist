import { describe, expect, it } from 'vitest';
import { sortBreakpoints } from '../sort-breakpoints.js';

describe('sortBreakpoints', () => {
  describe('sort by offset', () => {
    it('should sort ascending', () => {
      expect(sortBreakpoints({ offset: 0 }, { offset: 1 })).toBe(-1);
    });

    it('should sort descending', () => {
      expect(sortBreakpoints({ offset: 1 }, { offset: 0 })).toBe(1);
    });
  });

  describe('sort by type', () => {
    it('should sort ascending', () => {
      expect(
        sortBreakpoints({ offset: 0, type: 'closing' }, { offset: 0, type: 'opening' }),
      ).toBe(-1);
    });

    it('should sort descending', () => {
      expect(
        sortBreakpoints({ offset: 0, type: 'opening' }, { offset: 0, type: 'closing' }),
      ).toBe(1);
    });
  });

  describe('prioritize', () => {
    describe('opening', () => {
      describe('prioritize pres over others', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'pre' } },
              { offset: 0, type: 'opening', entity: { type: 'type' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'type' } },
              { offset: 0, type: 'opening', entity: { type: 'pre' } },
            ),
          ).toBe(1);
        });
      });

      describe('prioritize blockquotes over others', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'blockquote' } },
              { offset: 0, type: 'opening', entity: { type: 'type' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'type' } },
              { offset: 0, type: 'opening', entity: { type: 'blockquote' } },
            ),
          ).toBe(1);
        });
      });

      it('should equally prioritize pres and blockquotes', () => {
        const [ preFirst, blockquoteFirst ] = [
          sortBreakpoints(
            { offset: 0, type: 'opening', entity: { type: 'pre' } },
            { offset: 0, type: 'opening', entity: { type: 'blockquote' } },
          ),
          sortBreakpoints(
            { offset: 0, type: 'opening', entity: { type: 'blockquote' } },
            { offset: 0, type: 'opening', entity: { type: 'pre' } },
          ),
        ];
        expect(preFirst === blockquoteFirst).toBe(true);
      });

      describe('prioritize pres over paragraphs', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'pre' } },
              { offset: 0, type: 'opening', entity: { type: 'paragraph' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'paragraph' } },
              { offset: 0, type: 'opening', entity: { type: 'pre' } },
            ),
          ).toBe(1);
        });
      });

      describe('prioritize blockquotes over paragraphs', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'blockquote' } },
              { offset: 0, type: 'opening', entity: { type: 'v' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'paragraph' } },
              { offset: 0, type: 'opening', entity: { type: 'blockquote' } },
            ),
          ).toBe(1);
        });
      });

      describe('prioritize paragraphs over others', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'paragraph' } },
              { offset: 0, type: 'opening', entity: { type: 'type' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'opening', entity: { type: 'type' } },
              { offset: 0, type: 'opening', entity: { type: 'paragraph' } },
            ),
          ).toBe(1);
        });
      });
    });

    describe('closing', () => {
      describe('prioritize pres over others', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'type' } },
              { offset: 0, type: 'closing', entity: { type: 'pre' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'pre' } },
              { offset: 0, type: 'closing', entity: { type: 'type' } },
            ),
          ).toBe(1);
        });
      });

      describe('prioritize blockquotes over others', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'type' } },
              { offset: 0, type: 'closing', entity: { type: 'blockquote' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'blockquote' } },
              { offset: 0, type: 'closing', entity: { type: 'type' } },
            ),
          ).toBe(1);
        });
      });

      it('should equally prioritize pres and blockquotes', () => {
        const [ preFirst, blockquoteFirst ] = [
          sortBreakpoints(
            { offset: 0, type: 'closing', entity: { type: 'pre' } },
            { offset: 0, type: 'closing', entity: { type: 'blockquote' } },
          ),
          sortBreakpoints(
            { offset: 0, type: 'closing', entity: { type: 'blockquote' } },
            { offset: 0, type: 'closing', entity: { type: 'pre' } },
          ),
        ];
        expect(preFirst === blockquoteFirst).toBe(true);
      });

      describe('prioritize pres over paragraphs', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'paragraph' } },
              { offset: 0, type: 'closing', entity: { type: 'pre' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'pre' } },
              { offset: 0, type: 'closing', entity: { type: 'paragraph' } },
            ),
          ).toBe(1);
        });
      });

      describe('prioritize blockquotes over paragraphs', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'paragraph' } },
              { offset: 0, type: 'closing', entity: { type: 'blockquote' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'blockquote' } },
              { offset: 0, type: 'closing', entity: { type: 'paragraph' } },
            ),
          ).toBe(1);
        });
      });

      describe('prioritize paragraphs over others', () => {
        it('should prioritize ascending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'type' } },
              { offset: 0, type: 'closing', entity: { type: 'paragraph' } },
            ),
          ).toBe(-1);
        });

        it('should prioritize descending', () => {
          expect(
            sortBreakpoints(
              { offset: 0, type: 'closing', entity: { type: 'paragraph' } },
              { offset: 0, type: 'closing', entity: { type: 'type' } },
            ),
          ).toBe(1);
        });
      });
    });
  });

  describe('sort by length', () => {
    describe('opening', () => {
      it('should sort ascending', () => {
        expect(
          sortBreakpoints(
            { offset: 0, type: 'opening', entity: { type: 'type', length: 0 } },
            { offset: 0, type: 'opening', entity: { type: 'type', length: 1 } },
          ),
        ).toBe(1);
      });

      it('should sort descending', () => {
        expect(
          sortBreakpoints(
            { offset: 0, type: 'opening', entity: { type: 'type', length: 1 } },
            { offset: 0, type: 'opening', entity: { type: 'type', length: 0 } },
          ),
        ).toBe(-1);
      });

      it('should sort equal', () => {
        expect(
          sortBreakpoints(
            { offset: 0, type: 'opening', entity: { type: 'type', length: 0 } },
            { offset: 0, type: 'opening', entity: { type: 'type', length: 0 } },
          ),
        ).toBe(0);
      });
    });

    describe('closing', () => {
      it('should sort ascending', () => {
        expect(
          sortBreakpoints(
            { offset: 0, type: 'closing', entity: { type: 'type', length: 0 } },
            { offset: 0, type: 'closing', entity: { type: 'type', length: 1 } },
          ),
        ).toBe(-1);
      });

      it('should sort descending', () => {
        expect(
          sortBreakpoints(
            { offset: 0, type: 'closing', entity: { type: 'type', length: 1 } },
            { offset: 0, type: 'closing', entity: { type: 'type', length: 0 } },
          ),
        ).toBe(1);
      });

      it('should sort equal', () => {
        expect(
          sortBreakpoints(
            { offset: 0, type: 'closing', entity: { type: 'type', length: 0 } },
            { offset: 0, type: 'closing', entity: { type: 'type', length: 0 } },
          ),
        ).toBe(0);
      });
    });
  });
});
