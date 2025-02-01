import twilio from "twilio";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Status, USER_TYPE } from "@prisma/client";

// Twilio client initialization
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const myNumber = process.env.TWILIO_PHONE_NUMBER!;

export const smsRouter = createTRPCRouter({
  sendSMS: protectedProcedure
    .input(
      z.object({
        to: z.string().min(10),
        message: z.string(),
        mediaUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { to, message, mediaUrls } = input;

      try {
        // Resolve userId from the `to` phone number
        const user = await ctx.db.user.update({
          where: { phoneNumber: to },
          data: {
            isArchived: false
          }
        });

        // Send the SMS via Twilio
        const response = await client.messages.create({
          body: message,
          from: myNumber,
          to,
          mediaUrl: mediaUrls,
        });

        // Store the SMS message in the database
        const storedSMS = await ctx.db.sMSMessage.create({
          data: {
            from: myNumber,
            to,
            body: message,
            mediaUrls: mediaUrls || [],
            status: Status.SENT,
            errorCode: response.errorCode,
            date: new Date(),
            userId: user?.id || null, // Associate userId if found
          },
        });

        return {
          success: true,
          sid: response.sid,
          status: response.status,
          message: "SMS sent successfully",
          sms: storedSMS,
        };
      } catch (error) {
        console.error("Error sending SMS:", error);
        throw new Error("Failed to send SMS");
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
        status: z.enum(Object.values(Status) as [Status, ...Status[]]),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { from, to, body, mediaUrls } = input;

      try {
        // Check if sender exists
        let sender = await ctx.db.user.findFirst({
          where: { phoneNumber: from },
        });

        // Create a new user if sender doesn't exist
        if (!sender) {
          sender = await ctx.db.user.create({
            data: {
              firstName: "Unknown",
              lastName: "User",
              phoneNumber: from,
              type: USER_TYPE.UNKNOWN, // Default type, change if needed
            },
          });
        }

        // Update sender as having unread messages
        await ctx.db.user.update({
          where: { id: sender.id },
          data: { unreadMessage: true },
        });

        // Find recipient
        const recipient = await ctx.db.user.findFirst({
          where: { phoneNumber: to },
        });

        return await ctx.db.sMSMessage.create({
          data: {
            from,
            to,
            body,
            mediaUrls: mediaUrls || [],
            status: input.status,
            date: input.date,
            userId: sender?.id || null, // Associate userId if found
          },
        });
      } catch (error) {
        console.error("Error storing SMS message:", error);
        throw new Error("Failed to store SMS message");
      }
    }),
  getSMSConversations: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { phoneNumber } = input;

      try {
        return await ctx.db.sMSMessage.findMany({
          where: {
            OR: [
              { to: phoneNumber },
              { from: phoneNumber },
            ],
            NOT: [{ status: Status.PENDING }],
          },
          orderBy: {
            date: "asc",
          },
        });
      } catch (error) {
        console.error("Error retrieving conversations:", error);
        throw new Error("Failed to retrieve conversations with contact");
      }
    }),
});
