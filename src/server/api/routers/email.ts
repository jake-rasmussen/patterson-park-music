import sgMail from "@sendgrid/mail";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Status } from "@prisma/client";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const myEmail = process.env.SENDGRID_SENDER_EMAIL!;

export const emailRouter = createTRPCRouter({
  sendEmail: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        body: z.string().min(1),
        cc: z.array(z.string().email()).optional(),
        bcc: z.array(z.string().email()).optional(),
        attachments: z
          .array(
            z.object({
              filename: z.string(),
              type: z.string(),
              content: z.string(),
              url: z.string().url(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { to, subject, body, cc, bcc, attachments } = input;

      try {
        // Resolve userId from the `to` email addresses
        const user = await ctx.db.user.update({
          where: { email: to },
          data: {
            isArchived: false,
          }
        });

        const response = await sgMail.send({
          from: myEmail,
          to,
          subject,
          html: body,
          cc,
          bcc,
          attachments: attachments?.map((attachment) => ({
            filename: attachment.filename,
            type: attachment.type,
            content: attachment.content,
          })),
        });

        const storedEmail = await ctx.db.emailMessage.create({
          data: {
            from: myEmail,
            to: [to], // TODO: see if we want to handle multiple emails
            subject,
            body,
            cc: cc || [],
            bcc: bcc || [],
            attachments: attachments?.map((attachment) => attachment.url) || [],
            status: Status.SENT,
            errorCode: response[0]?.statusCode || null,
            date: new Date(),
            userId: user?.id || null, // Associate userId if found
          },
        });

        return {
          success: true,
          message: "Email sent successfully",
          email: storedEmail,
        };
      } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
      }
    }),
  storeEmail: publicProcedure
    .input(
      z.object({
        from: z.string().email().optional(),
        to: z.array(z.string().email()),
        subject: z.string().min(1),
        body: z.string().min(1),
        cc: z.array(z.string().email()).optional(),
        bcc: z.array(z.string().email()).optional(),
        attachments: z.array(z.string()).optional(),
        headers: z.record(z.string(), z.any()).optional(),
        status: z.enum([Status.PENDING, Status.RECEIVED, Status.SENT]),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Resolve userId from the `to` email addresses
        const recipient = await ctx.db.user.findFirst({
          where: { email: { in: input.to } },
        });

        const sender = await ctx.db.user.findFirst({
          where: { email: input.from },
        });

        await ctx.db.user.update({
          where: {
            id: sender?.id,
          },
          data: {
            unreadMessage: true,
          }
        });

        const newEmail = await ctx.db.emailMessage.create({
          data: {
            from: input.from || myEmail,
            to: input.to,
            subject: input.subject,
            body: input.body,
            cc: input.cc || [],
            bcc: input.bcc || [],
            attachments: input.attachments || [],
            status: input.status,
            date: input.date,
            userId: recipient?.id || null, // Associate userId if found
          },
        });

        return { success: true, email: newEmail };
      } catch (error) {
        console.error("Error storing email:", error);
        throw new Error("Failed to store email");
      }
    }),

  getEmailConversations: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { email } = input;

      try {
        const messages = await ctx.db.emailMessage.findMany({
          where: {
            OR: [
              {
                from: myEmail,
                to: {
                  has: email,
                },
              },
              {
                from: email,
                to: {
                  has: myEmail,
                },
              },
            ],
            NOT: {
              status: Status.PENDING,
            },
          },
          orderBy: {
            date: "asc",
          },
        });

        return { success: true, messages };
      } catch (error) {
        console.error("Error fetching email conversations:", error);
        throw new Error("Failed to fetch email conversations");
      }
    }),
});
