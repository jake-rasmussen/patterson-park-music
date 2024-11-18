import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const myNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio number from .env

export const smsRouter = createTRPCRouter({
  sendSMS: publicProcedure
    .input(
      z.object({
        to: z.string().min(10, "Phone number is required"),
        message: z.string().min(1, "Message cannot be empty"),
        mediaUrl: z.array(z.string()).optional(), // Optional media URLs for attachments
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await client.messages.create({
          body: input.message,
          from: process.env.TWILIO_PHONE_NUMBER, // Replace with your Twilio phone number
          to: input.to,
          mediaUrl: input.mediaUrl, // Include media URLs if present
        });

        return {
          success: true,
          sid: response.sid,
          status: response.status,
          message: "SMS sent successfully",
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
  // Get a conversation with a specific number, including media if present
  getConversationWithNumber: publicProcedure
    .input(
      z.object({
        otherNumber: z.string().min(1),                // The requested number for conversation
        limit: z.number().min(1).max(50).default(10), // Number of messages per page
        lastMessageId: z.string().optional(),         // Cursor for pagination
      })
    )
    .query(async ({ input }) => {
      const { limit, otherNumber, lastMessageId } = input;

      try {
        // Fetch messages in both directions (sent to and from the other number)
        const messagesToMe = await client.messages.list({
          limit,
          to: myNumber,
          from: otherNumber,
          ...(lastMessageId && { beforeSid: lastMessageId }),
        });

        const messagesFromMe = await client.messages.list({
          limit,
          to: otherNumber,
          from: myNumber,
          ...(lastMessageId && { beforeSid: lastMessageId }),
        });

        // Combine and sort messages by date
        const allMessages = [...messagesToMe, ...messagesFromMe].sort(
          (a, b) => new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime()
        );

        return {
          messages: await Promise.all(
            allMessages.map(async (message) => ({
              sid: message.sid,
              body: message.body,
              from: message.from,
              to: message.to,
              status: message.status,
              dateSent: message.dateSent,
              direction: message.direction,
              mediaUrls: parseInt(message.numMedia) > 0 ? await fetchMediaUrls(message.sid) : [], // Fetch media URLs if available
            }))
          ),
          hasMore: allMessages.length === limit, // Indicates if there are more messages
          lastMessageId: allMessages.length > 0 ? allMessages[allMessages.length - 1]?.sid : null, // For next page
        };
      } catch (error) {
        console.error("Error fetching SMS conversation:", error);
        throw new Error("Failed to retrieve SMS conversation");
      }
    }),
  storeSMS: publicProcedure
    .input(
      z.object({
        messageSid: z.string(),
        from: z.string(),
        to: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { messageSid, from, to, body } = input;

      try {
        // Save the incoming SMS message to the database
        const newMessage = await ctx.db.sMSMessage.create({
          data: {
            messageSid,
            from,
            to,
            body,
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
