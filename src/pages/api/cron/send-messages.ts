import { WEEKDAY } from "@prisma/client";
import { db } from "~/server/db";
import { api } from "~/utils/api";

export default async function handler(req: any, res: any) {
  const sendSMS = api.sms.sendSMS.useMutation();
  const sendEmail = api.email.sendEmail.useMutation();

  try {
    const now = new Date();
    const currentWeekday = Object.values(WEEKDAY)[now.getDay()];

    const smsMessages = await db.futureSMSMessage.findMany({
      where: {
        date: { lte: now },
      },
    });

    const recurringSMSMessages = await db.futureSMSMessage.findMany({
      where: {
        days: { has: currentWeekday },
      },
    });

    const emailMessages = await db.futureEmailMessage.findMany({
      where: {
        date: { lte: now },
      },
    });

    const recurringEmailMessages = await db.futureEmailMessage.findMany({
      where: {
        days: { has: currentWeekday },
      },
    });

    const allSMSMessages = [...smsMessages, ...recurringSMSMessages];
    for (const sms of allSMSMessages) {
      await sendSMS.mutateAsync({
        message: sms.body,
        to: sms.to,
        mediaUrls: sms.mediaUrls,
      });

      if (!sms.days) {
        await db.futureSMSMessage.delete({ where: { id: sms.id } });
      }
    }

    const allEmailMessages = [...emailMessages, ...recurringEmailMessages];
    for (const email of allEmailMessages) {
      await sendEmail.mutateAsync({
        to: email.to as [string, ...string[]],
        subject: email.subject,
        body: email.body,
        cc: email.cc,
        bcc: email.bcc,
        // TODO: add attachments
      });

      if (!email.days) {
        await db.futureEmailMessage.delete({ where: { id: email.id } });
      }
    }

    res.status(200).json({ message: "Messages processed successfully" });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ error: "Failed to process messages" });
  }
}
