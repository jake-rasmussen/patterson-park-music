import { WEEKDAY } from "@prisma/client";
import { createCaller } from "~/server/api/root";
import { db } from "~/server/db";

export default async function handler(req: any, res: any) {
  const caller = createCaller({ db, user: null });

  try {
    const now = new Date();
    const weekdayNames = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const currentWeekday = weekdayNames[now.getDay()-1];

    // Fetch SMS messages
    const smsMessages = await db.futureSMSMessage.findMany({
      where: {
        date: { lte: now },
      },
    });

    const recurringSMSMessages = await db.futureSMSMessage.findMany({
      where: {
        days: { has: currentWeekday as WEEKDAY },
      },
    });

    // Fetch email messages
    const emailMessages = await db.futureEmailMessage.findMany({
      where: {
        date: { lte: now },
      },
    });

    const recurringEmailMessages = await db.futureEmailMessage.findMany({
      where: {
        days: { has: currentWeekday as WEEKDAY },
      },
    });

    // Process SMS messages
    const allSMSMessages = [...smsMessages, ...recurringSMSMessages];
    for (const sms of allSMSMessages) {
      await caller.sms.sendSMS({
        message: sms.body,
        to: sms.to,
        mediaUrls: sms.mediaUrls,
      });

      if (sms.days.length === 0) {
        // A one-time message
        await caller.futureSMS.deleteFutureSMSMessage({ id: sms.id });
      }
    }

    // Process email messages
    const allEmailMessages = [...emailMessages, ...recurringEmailMessages];
    for (const email of allEmailMessages) {
      // Process attachments if they exist
      let processedAttachments: {
        type: string;
        filename: string;
        content: string;
        url: string;
      }[] = [];

      if (email.attachments && email.attachments.length > 0) {
        processedAttachments = await Promise.all(
          email.attachments.map(async (attachmentUrl) => {
            const response = await fetch(attachmentUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch attachment: ${attachmentUrl}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const base64Content = Buffer.from(arrayBuffer).toString("base64");

            return {
              filename: attachmentUrl.split("/").pop()!, // Use the filename from the URL
              type: response.headers.get("content-type") || "application/octet-stream",
              content: base64Content, // Base64 encoded content
              url: attachmentUrl,
            };
          })
        );
      }

      // Send email with processed attachments
      await caller.email.sendEmail({
        to: email.to[0]!,
        subject: email.subject,
        body: email.body,
        cc: email.cc,
        bcc: email.bcc,
        attachments: processedAttachments, // Pass attachments here
      });

      if (email.days.length === 0) {
        // A one-time message
        await caller.futureEmail.deleteFutureEmailMessage({ id: email.id });
      }
    }

    res.status(200).json({ message: "Messages processed successfully" });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ error: "Failed to process messages" });
  }
}