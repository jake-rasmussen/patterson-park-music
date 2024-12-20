import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Status, WEEKDAY } from "@prisma/client";

const myNumber = process.env.TWILIO_PHONE_NUMBER!;

export const futureSMSRouter = createTRPCRouter({
  createFutureSMSMessage: publicProcedure
    .input(
      z.object({
        to: z.string().min(10),
        message: z.string().min(1),
        mediaUrls: z.array(z.string()).optional(),
        days: z.array(z.enum(Object.values(WEEKDAY) as [WEEKDAY, ...WEEKDAY[]])),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        to,
        message,
        mediaUrls,
        days,
        date,
      } = input;

      try {
        const newMessage = await ctx.db.futureSMSMessage.create({
          data: {
            from: myNumber,
            to,
            body: message,
            mediaUrls: mediaUrls || [],
            status: Status.PENDING,
            days,
            date,
          },
        });

        return { success: true, message: newMessage };
      } catch (error) {
        console.error("Error saving SMS message:", error);
        throw new Error("Failed to save SMS message");
      }
    }),
  getAllUpcomingSMSMessages: publicProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date();
      const upcomingMessages = await ctx.db.futureSMSMessage.findMany({
        where: {
          OR: [
            { date: { gte: now } }, // Messages with a specific date in the future
            { days: { isEmpty: false } }, // Recurring messages
          ],
        },
        orderBy: { date: "asc" }, // Order by date for one-time messages
      });

      return upcomingMessages;
    } catch (error) {
      console.error("Error fetching upcoming SMS messages:", error);
      throw new Error("Failed to fetch upcoming SMS messages");
    }
  }),
  updateFutureSMSMessage: publicProcedure
    .input(
      z.object({
        id: z.string(),
        to: z.string(),
        body: z.string().min(1),
        mediaUrls: z.array(z.string()).optional(),
        days: z.array(z.enum(Object.values(WEEKDAY) as [WEEKDAY, ...WEEKDAY[]])).nullable(),
        date: z.date().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedMessage = await ctx.db.futureSMSMessage.update({
          where: { id: input.id },
          data: {
            to: input.to,
            body: input.body,
            mediaUrls: input.mediaUrls || [],
            days: input.days || [],
            date: input.date,
          },
        });

        return { success: true, message: updatedMessage };
      } catch (error) {
        console.error("Error updating SMS message:", error);
        throw new Error("Failed to update SMS message");
      }
    }),
  deleteFutureSMSMessage: publicProcedure
    .input(
      z.object({
        id: z.string(), // ID of the message to delete
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedMessage = await ctx.db.futureSMSMessage.delete({
          where: { id: input.id },
        });

        return { success: true, message: deletedMessage };
      } catch (error) {
        console.error("Error deleting SMS message:", error);
        throw new Error("Failed to delete SMS message");
      }
    }),

});