import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import twilio from "twilio";
import { Status } from "@prisma/client";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const myNumber = process.env.TWILIO_PHONE_NUMBER!;

export const smsRouter = createTRPCRouter({
  sendSMS: publicProcedure
    .input(
      z.object({
        to: z.string().min(10),
        message: z.string().min(1),
        mediaUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { to, message, mediaUrls } = input;

      try {
        const response = await client.messages.create({
          body: message,
          from: myNumber,
          to: to,
          mediaUrl: mediaUrls,
        });

        const storedSMS = await ctx.db.sMSMessage.create({
          data: {
            from: myNumber,
            to: input.to,
            body: message,
            mediaUrls: mediaUrls || [],
            status: Status.SENT,
            date: new Date(),
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
      const { messageSid, from, to, body, mediaUrls } = input;

      try {
        const newMessage = await ctx.db.sMSMessage.create({
          data: {
            from,
            to,
            body,
            mediaUrls: mediaUrls || [],
            status: input.status,
            date: input.date,
          },
        });

        return { success: true, message: newMessage };
      } catch (error) {
        console.error("Error saving SMS message:", error);
        throw new Error("Failed to save SMS message");
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
            NOT: [
              { status: Status.PENDING }
            ]
          },
          orderBy: {
            date: "asc",
          },
        });

        return { success: true, messages };
      } catch (error) {
        console.error("Error retrieving conversations:", error);
        throw new Error("Failed to retrieve conversations with contact");
      }
    }),
});