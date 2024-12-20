import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Status, WEEKDAY } from "@prisma/client";

const myEmail = process.env.SENDGRID_SENDER_EMAIL!;

export const futureEmailRouter = createTRPCRouter({
  createFutureEmailMessage: publicProcedure
    .input(
      z.object({
        to: z.array(z.string().email()),
        subject: z.string().min(1),
        body: z.string().min(1),
        cc: z.array(z.string().email()).optional(),
        bcc: z.array(z.string().email()).optional(),
        attachments: z.array(z.string()).optional(),
        headers: z.record(z.string(), z.any()).optional(),
        days: z.array(z.enum(Object.values(WEEKDAY) as [WEEKDAY, ...WEEKDAY[]])),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const newMessage = await ctx.db.futureEmailMessage.create({
          data: {
            from: myEmail,
            to: input.to,
            subject: input.subject,
            body: input.body,
            cc: input.cc || [],
            bcc: input.bcc || [],
            attachments: input.attachments || [],
            status: Status.PENDING,
            days: input.days,
            date: input.date,
          },
        });

        return { success: true, message: newMessage };
      } catch (error) {
        console.error("Error saving SMS message:", error);
        throw new Error("Failed to save SMS message");
      }
    }),
  getAllUpcomingEmailMessages: publicProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date();
      const upcomingMessages = await ctx.db.futureEmailMessage.findMany({
        where: {
          OR: [
            { date: { gte: now } },
            { days: { isEmpty: false } },
          ],
        },
        orderBy: { date: "asc" },
      });

      return upcomingMessages;
    } catch (error) {
      console.error("Error fetching upcoming email messages:", error);
      throw new Error("Failed to fetch upcoming email messages");
    }
  }),
  updateFutureEmailMessage: publicProcedure
    .input(
      z.object({
        id: z.string(),
        to: z.array(z.string().email()),
        subject: z.string().min(1),
        body: z.string().min(1),
        cc: z.array(z.string().email()).optional(),
        bcc: z.array(z.string().email()).optional(),
        attachments: z.array(z.string()).optional(),
        days: z.array(z.enum(Object.values(WEEKDAY) as [WEEKDAY, ...WEEKDAY[]])).nullable(),
        date: z.date().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedMessage = await ctx.db.futureEmailMessage.update({
          where: { id: input.id },
          data: {
            to: input.to,
            subject: input.subject,
            body: input.body,
            cc: input.cc || [],
            bcc: input.bcc || [],
            attachments: input.attachments || [],
            days: input.days || [],
            date: input.date,
          },
        });

        return { success: true, message: updatedMessage };
      } catch (error) {
        console.error("Error updating email message:", error);
        throw new Error("Failed to update email message");
      }
    }),
  deleteFutureEmailMessage: publicProcedure
    .input(
      z.object({
        id: z.string(), // ID of the message to delete
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedMessage = await ctx.db.futureEmailMessage.delete({
          where: { id: input.id },
        });

        return { success: true, message: deletedMessage };
      } catch (error) {
        console.error("Error deleting email message:", error);
        throw new Error("Failed to delete email message");
      }
    }),
});