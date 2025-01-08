import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createClient } from "~/utils/supabase/client/component";

const supabaseClient = createClient();

export const supabaseRouter = createTRPCRouter({
  onSMSInsert: publicProcedure.subscription(async function* ({ ctx }) {
    const channelKey = "smsMessages";
    const channel = supabaseClient.channel(channelKey);

    try {
      const eventStream = new ReadableStream({
        start(controller) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "SMSMessage" },
            (payload) => {
              const sms = payload.new;
              if (sms?.id) {
                controller.enqueue(sms);
              }
            }
          );

          channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("Realtime channel subscribed successfully");
            }
          });
        },
        cancel() {
          channel.unsubscribe();
          console.log("Unsubscribed from SMSMessage Realtime channel");
        },
      });

      const reader = eventStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } catch (error) {
      console.error("Error in subscription:", error);
      throw error;
    } finally {
      channel.unsubscribe();
      console.log("Cleaned up the channel subscription.");
    }
  }),

  onEmailInsert: publicProcedure.subscription(async function* ({ ctx }) {
    const channelKey = "emailMessages";
    const channel = supabaseClient.channel(channelKey);

    try {
      const eventStream = new ReadableStream({
        start(controller) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "EmailMessage" },
            (payload) => {
              const email = payload.new;
              if (email?.id) {
                controller.enqueue(email);
              }
            }
          );

          channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("Realtime channel subscribed successfully for EmailMessage");
            }
          });
        },
        cancel() {
          channel.unsubscribe();
          console.log("Unsubscribed from EmailMessage Realtime channel");
        },
      });

      const reader = eventStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } catch (error) {
      console.error("Error in subscription:", error);
      throw error;
    } finally {
      channel.unsubscribe();
      console.log("Cleaned up the channel subscription for EmailMessage.");
    }
  }),
});
