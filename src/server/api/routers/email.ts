import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import sgMail from "@sendgrid/mail";

// Set the API key from the environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const emailRouter = createTRPCRouter({
  sendEmail: publicProcedure
    .input(
      z.object({
        to: z.string().email("Invalid email address"),
        subject: z.string().min(1, "Subject cannot be empty"),
        message: z.string().min(1, "Body cannot be empty"),
      })
    )
    .mutation(async ({ input }) => {
      const { to, subject, message } = input;

      try {
        const msg = {
          to,
          from: process.env.SENDGRID_SENDER_EMAIL!, // Replace with your verified sender email
          subject,
          text: message,
        };

        await sgMail.send(msg);

        return { success: true, message: "Email sent successfully" };
      } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
      }
    }),
});
