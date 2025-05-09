import messageSupport from '$lib/server/support/use-cases/message.js';

/**
 * Отправка сообщения в поддержку
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ locals, request }) => {
  const messageUUID = messageSupport(locals.userid, await request.text());
  return new Response(
    null,
    { status: 202, headers: { Location: `/api/supportMessage/delivery/${messageUUID}` } },
  );
};
