import messageDeliveryStatus from '$lib/server/support/message-delivery-status.js';

/**
 * Отправка сообщения в поддержку
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ params }) => {
  const messageUUID = params.uuid;

  const stream = new ReadableStream({
    start: (controller) => {
      let unsubscribe;

      const timeout = setTimeout(
        () => {
          unsubscribe?.();
          try {
            controller.enqueue('event:close\ndata:\n\n');
          } catch {}
        },
        10000,
      );

      unsubscribe = messageDeliveryStatus.subscribeOnceTo(
        messageUUID,
        (status) => {
          if (timeout) {
            clearTimeout(timeout);
          }
          unsubscribe = null;
          try {
            controller.enqueue(`event:${status}\ndata:\n\n`);
            controller.enqueue('event:close\ndata:\n\n');
          } catch {}
        },
      );
    },
  });

  return new Response(
    stream,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    },
  );
};
