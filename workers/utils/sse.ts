const encoder = new TextEncoder();

export function sse(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}
