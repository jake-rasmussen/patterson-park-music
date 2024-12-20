import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import sgMail from "@sendgrid/mail";
import { Status } from "@prisma/client";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const myEmail = process.env.SENDGRID_SENDER_EMAIL!;

export const emailRouter = createTRPCRouter({
  sendEmail: publicProcedure
    .input(
      z.object({
        to: z.array(z.string().email()).nonempty(),
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
            content: attachment.content, // Use Base64 content as is
          })),
        });

        const storedEmail = await ctx.db.emailMessage.create({
          data: {
            from: myEmail,
            to,
            subject,
            body,
            cc: cc || [],
            bcc: bcc || [],
            attachments: attachments?.map((attachment) => attachment.url) || [],
            status: Status.SENT,
            date: new Date(),
          },
        });

        return {
          success: true,
          message: "Email sent successfully",
          email: storedEmail
        };
      } catch (error: any) {
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
        status: z.enum([
          Status.PENDING,
          Status.RECEIVED,
          Status.SENT,
        ]),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
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
          },
        });

        return { success: true, email: newEmail };
      } catch (error) {
        console.error("Error storing email:", error);
        throw new Error("Failed to store email");
      }
    }),
  getEmailConversations: publicProcedure
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
            }
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
