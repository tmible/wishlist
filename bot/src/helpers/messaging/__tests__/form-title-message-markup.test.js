import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import formTitleMessageMarkup from '../form-title-message-markup.js';

describe('formTitleMessageMarkup', () => {
  it('should form markup for own list', () => {
    assertSnapshot(
      JSON.stringify(formTitleMessageMarkup({ chat: { id: 'userid' } }, 'userid')),
      resolve(
        import.meta.dirname,
        './__snapshots__/form-title-message-markup/should form markup for own list.json',
      ),
    );
  });

  it('should form markup for foreign list', () => {
    assertSnapshot(
      JSON.stringify(formTitleMessageMarkup({ chat: { id: 'chatId' } }, 'userid')),
      resolve(
        import.meta.dirname,
        './__snapshots__/form-title-message-markup/should form markup for foreign list.json',
      ),
    );
  });
});
