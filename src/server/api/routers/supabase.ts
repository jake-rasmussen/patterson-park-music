import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabase/supabaseClient";

export const supabaseRouter = createTRPCRouter({
  onSMSInsert: publicProcedure.subscription(async function* () {
    const channel = supabase.channel("smsMessages");
    const eventQueue: Array<{ id: string; sms: any }> = [];

    try {
      channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "SMSMessage" },
          (payload) => {
            const sms = payload.new;
            if (sms?.id) {
              eventQueue.push({ id: sms.id, sms });
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to Realtime for SMSMessage");
          }
        });

      while (true) {
        while (eventQueue.length > 0) {
          const event = eventQueue.shift();
          if (event) {
            yield event.sms;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } finally {
      console.log("Unsubscribing from Realtime channel");
      await channel.unsubscribe();
    }
  }),
  onEmailInsert: publicProcedure.subscription(async function* () {
    const channel = supabase.channel("emailMessages");
    const eventQueue: Array<{ id: string; email: any }> = [];

    try {
      channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "EmailMessage" },
          (payload) => {
            const email = payload.new;
            if (email?.id) {
              eventQueue.push({ id: email.id, email });
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to Realtime for EmailMessage");
          }
        });

      while (true) {
        while (eventQueue.length > 0) {
          const event = eventQueue.shift();
          if (event) {
            yield event.email;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } finally {
      console.log("Unsubscribing from Realtime channel");
      await channel.unsubscribe();
    }
  }),

});
