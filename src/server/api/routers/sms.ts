import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const myNumber = process.env.TWILIO_PHONE_NUMBER!;

export const smsRouter = createTRPCRouter({
  sendSMS: publicProcedure
    .input(
      z.object({
        to: z.string().min(10, "Phone number is required"),
        message: z.string().min(1, "Message cannot be empty"),
        mediaUrls: z.array(z.string()).optional(), // Optional media URLs for attachments
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { to, message, mediaUrls } = input;

      try {
        const response = await client.messages.create({
          body: message,
          from: myNumber,
          to: to,
          mediaUrl: mediaUrls, // Include media URLs if present
        });

        const storedSMS = await ctx.db.sMSMessage.create({
          data: {
            messageSid: response.sid,
            from: myNumber,
            to: input.to,
            body: message,
            mediaUrls: mediaUrls || [],
          }
        })

        return {
          success: true,
          sid: response.sid,
          status: response.status,
          message: "SMS sent successfully",
          sms: storedSMS,
          mediaUrls: input.mediaUrls || [],
        };
      } catch (error) {
        console.error("Error sending SMS:", error);
        throw new Error("Failed to send SMS");
      }
    }),
  getAllMessages: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50), // Limit the number of messages to retrieve
      })
    )
    .query(async ({ input }) => {
      try {
        const messages = await client.messages.list({
          limit: input.limit,
        });

        return messages.map((message) => ({
          sid: message.sid,
          body: message.body,
          from: message.from,
          to: message.to,
          status: message.status,
          dateSent: message.dateSent,
          direction: message.direction,
        }));
      } catch (error) {
        console.error("Error fetching SMS messages:", error);
        throw new Error("Failed to retrieve SMS messages");
      }
    }),
  getSMSConversations: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      const { phoneNumber } = input;

      try {
        const messages = await ctx.db.sMSMessage.findMany({
          where: {
            OR: [
              { to: phoneNumber },
              { from: phoneNumber },
            ],
          },
          orderBy: {
            dateSent: "asc",
          },
        });

        return { success: true, messages };
      } catch (error) {
        console.error("Error retrieving conversations:", error);
        throw new Error("Failed to retrieve conversations with contact");
      }
    }),
  storeSMS: publicProcedure
    .input(
      z.object({
        messageSid: z.string(),
        from: z.string(),
        to: z.string(),
        body: z.string(),
        mediaUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { messageSid, from, to, body, mediaUrls } = input;

      try {
        // Save the incoming SMS message to the database
        const newMessage = await ctx.db.sMSMessage.create({
          data: {
            messageSid,
            from,
            to,
            body,
            mediaUrls: mediaUrls || [],
          },
        });

        return { success: true, message: newMessage };
      } catch (error) {
        console.error("Error saving SMS message:", error);
        throw new Error("Failed to save SMS message");
      }
    }),
});


async function fetchMediaUrls(messageSid: string): Promise<string[]> {
  try {
    const mediaList = await client.messages(messageSid).media.list();
    return mediaList.map((media) => `https://api.twilio.com${media.uri.replace(".json", "")}`);
  } catch (error) {
    console.error(`Failed to fetch media for message ${messageSid}:`, error);
    return [];
  }
}
