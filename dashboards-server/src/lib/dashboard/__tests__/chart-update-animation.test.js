import { describe, expect, it } from 'vitest';
import { ChartUpdateAnimation } from '../chart-update-animation.js';

describe('dashboard / chart update animation', () => {
  for (const chart of [ 'time', 'activeUsers' ]) {
    describe(`${chart} chart`, () => {
      it('should return true if there is no previous data', () => {
        expect(
          ChartUpdateAnimation[chart](
            { data: { datasets: [] } },
            { data: { datasets: [{ data: [ 'data' ] }] } },
          ),
        ).toBe(
          true,
        );
      });

      it('should return false if there is no current data', () => {
        expect(
          ChartUpdateAnimation[chart](
            { data: { datasets: [{ data: [] }] } },
            { data: { datasets: [] } },
          ),
        ).toBe(
          false,
        );
      });

      it('should return false if neither previous length is 0, nor current is greater', () => {
        expect(
          ChartUpdateAnimation[chart](
            { data: { datasets: [{ data: [ 'data' ] }] } },
            { data: { datasets: [{ data: [] }] } },
          ),
        ).toBe(
          false,
        );
      });

      it('should return false if previous length is greater than 0', () => {
        expect(
          ChartUpdateAnimation[chart](
            { data: { datasets: [{ data: [ 'data' ] }] } },
            { data: { datasets: [{ data: [ 'data' ] }] } },
          ),
        ).toBe(
          false,
        );
      });

      it('should return false if current length is not greater than 0', () => {
        expect(
          ChartUpdateAnimation[chart](
            { data: { datasets: [{ data: [] }] } },
            { data: { datasets: [{ data: [] }] } },
          ),
        ).toBe(
          false,
        );
      });

      it('should return true if previous length is 0 and current is greater', () => {
        expect(
          ChartUpdateAnimation[chart](
            { data: { datasets: [{ data: [] }] } },
            { data: { datasets: [{ data: [ 'data' ] }] } },
          ),
        ).toBe(
          true,
        );
      });
    });
  }

  for (const chart of [ 'successRate', 'authenticationFunnel' ]) {
    describe(`${chart} chart`, () => {
      it('should return true if there is no previous cutout', () => {
        expect(ChartUpdateAnimation[chart]({}, { options: { cutout: 1 } })).toBe(true);
      });

      it('should return true if there is no current cutout', () => {
        expect(ChartUpdateAnimation[chart]({ options: { cutout: 0 } }, {})).toBe(true);
      });

      it('should return false if previous and current cutouts are equal', () => {
        expect(
          ChartUpdateAnimation[chart]({ options: { cutout: 0 } }, { options: { cutout: 0 } }),
        ).toBe(
          false,
        );
      });

      it('should return true if previous and current cutouts are not equal', () => {
        expect(
          ChartUpdateAnimation[chart]({ options: { cutout: 0 } }, { options: { cutout: 1 } }),
        ).toBe(
          true,
        );
      });
    });
  }
});
