// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { createTable } from 'svelte-headless-table';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initBotUserUpdatesFeature } from '../initialization.js';
import { botUserUpdates } from '../store.js';
import BotUserUpdatesTable from '../table.svelte';

vi.mock('svelte-headless-table');
vi.mock('../filter-button.svelte');
vi.mock('../initialization.js');
vi.mock('../store.js', async () => {
  const { writable } = await import('svelte/store');
  return { botUserUpdates: writable({}) };
});
vi.mock('../table-header-date-range-filter.svelte');
vi.mock('../table-header-simple-filter.svelte');
vi.mock('../use-cases/get-page.js');

describe('bot user updates / table', () => {
  let createColumns;
  let column;
  let createViewModel;

  beforeEach(() => {
    createColumns = vi.fn();
    column = vi.fn();
    createViewModel = vi.fn().mockReturnValue({});
    vi.mocked(initBotUserUpdatesFeature).mockReturnValue(vi.fn());
    vi.mocked(
      createTable,
    ).mockReturnValue(
      { createColumns, column, createViewModel },
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should init bot user updates feature', () => {
    render(BotUserUpdatesTable);
    expect(vi.mocked(initBotUserUpdatesFeature)).toHaveBeenCalled();
  });

  it('should set data to botUserUpdates', () => {
    vi.spyOn(vi.mocked(botUserUpdates), 'set');
    render(BotUserUpdatesTable, { data: 'data' });
    expect(vi.mocked(botUserUpdates.set)).toHaveBeenCalledWith('data');
  });

  it('should set empty botUserUpdates', () => {
    vi.spyOn(vi.mocked(botUserUpdates), 'set');
    render(BotUserUpdatesTable);
    expect(vi.mocked(botUserUpdates.set)).toHaveBeenCalledWith({});
  });

  it('should create table', () => {
    render(BotUserUpdatesTable);
    expect(vi.mocked(createTable)).toHaveBeenCalled();
  });

  it('should create table columns', () => {
    render(BotUserUpdatesTable);
    expect(createColumns).toHaveBeenCalled();
  });

  it('should create table view model', () => {
    render(BotUserUpdatesTable);
    expect(createViewModel).toHaveBeenCalled();
  });

  describe('on destroy', () => {
    it('should init bot user updates feature', () => {
      const destroyBotUserUpdatesFeature = vi.fn();
      vi.mocked(initBotUserUpdatesFeature).mockReturnValueOnce(destroyBotUserUpdatesFeature);
      render(BotUserUpdatesTable).unmount();
      expect(destroyBotUserUpdatesFeature).toHaveBeenCalled();
    });
  });
});
