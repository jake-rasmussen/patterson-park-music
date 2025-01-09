import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createClient } from "~/utils/supabase/client/component";

const supabaseClient = createClient();

export const supabaseRouter = createTRPCRouter({
  onSMSInsert: protectedProcedure.subscription(async function* () {
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

          channel.subscribe();
        },
        cancel() {
          channel.unsubscribe();
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
    }
  }),

  onEmailInsert: protectedProcedure.subscription(async function* () {
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

          channel.subscribe();
        },
        cancel() {
          channel.unsubscribe();
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
    }
  }),
});
