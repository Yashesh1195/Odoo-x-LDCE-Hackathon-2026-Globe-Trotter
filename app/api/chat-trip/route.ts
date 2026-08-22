import { streamChatMessages } from "@/app/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatMessages(messages)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Unknown chat error occurred";
          controller.enqueue(
            encoder.encode(`\n\n⚠️ **Chat Error:** ${message}`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to process chat request";
    return Response.json({ error: message }, { status: 500 });
  }
}
