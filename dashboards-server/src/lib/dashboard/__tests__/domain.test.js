import { describe, expect, it } from 'vitest';
import { PERIOD } from '$lib/constants/period.const.js';
import { buildDashboard } from '../domain.js';

describe('dashboard / domain', () => {
  it('should build dashboard in minimal variant', () => {
    expect(buildDashboard({ type: 'line', chartConfigs: [] })).toMatchSnapshot();
  });

  it('should build dashboard in maximal variant', () => {
    expect(
      buildDashboard({
        type: 'line',
        period: PERIOD.HOUR,
        initialData: { 0: 'initial', 1: 'data' },
        chartConfigs: [{
          key: 0,
          label: '0',
          isDisplayed: false,
        }, {
          key: 1,
          label: '1',
          isDisplayed: true,
        }],
      }),
    ).toMatchSnapshot();
  });

  it('should build line dashboard', () => {
    expect(
      buildDashboard({
        type: 'line',
        chartConfigs: [{
          key: 0,
          label: '0',
        }, {
          key: 1,
          label: '1',
        }],
      }),
    ).toMatchSnapshot();
  });

  it('should build doughnut dashboard', () => {
    expect(buildDashboard({ type: 'doughnut', key: 'key', label: 'label' })).toMatchSnapshot();
  });
});
