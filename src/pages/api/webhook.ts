import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";
import { db } from "~/server/db";
import twilio from "twilio";

const createCaller = createCallerFactory(appRouter);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const twiml = new twilio.twiml.MessagingResponse(); // Create a TwiML response

  if (req.method === "POST") {
    try {
      const twilioBody = req.body;

      // Use the createCaller to call the tRPC mutation directly
      const caller = createCaller({ db });
      await caller.sms.storeSMS({
        messageSid: twilioBody.MessageSid,
        from: twilioBody.From,
        to: twilioBody.To,
        body: twilioBody.Body,
      });

      // Return an empty valid TwiML response
      res.setHeader("Content-Type", "text/xml");
      res.status(200).send(twiml.toString());
    } catch (error) {
      console.error("Webhook Error:", error);

      // Return TwiML even if there's an error
      res.setHeader("Content-Type", "text/xml");
      res.status(200).send(twiml.toString());
    }
  } else {
    // Twilio expects a valid response even for unsupported methods
    res.setHeader("Content-Type", "text/xml");
    res.status(405).send(twiml.toString());
  }
}
