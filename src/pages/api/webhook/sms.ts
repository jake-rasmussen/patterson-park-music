import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";
import { db } from "~/server/db";
import twilio from "twilio";
import { Status } from "@prisma/client";
import { createClient } from "~/utils/supabase/client/component";

const createCaller = createCallerFactory(appRouter);
const supabaseClient = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const twiml = new twilio.twiml.MessagingResponse();

  if (req.method === "POST") {
    try {
      const twilioBody = req.body;

      const numMedia = parseInt(twilioBody.NumMedia, 10);
      const mediaUrls: string[] = [];

      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = twilioBody[`MediaUrl${i}`];
        if (mediaUrl) {
          const mediaResponse = await fetch(mediaUrl);
          const mediaBuffer = await mediaResponse.arrayBuffer();

          const contentType = mediaResponse.headers.get("content-type") || "application/octet-stream";
          const fileExtension = contentType.split("/")[1] || "bin";

          const filePath = `uploads/${Date.now()}-${mediaUrl}${i}.${fileExtension}`;

          const { error } = await supabaseClient.storage
            .from("media")
            .upload(filePath, Buffer.from(mediaBuffer), {
              contentType,
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error("Error uploading media to Supabase:", error);
            throw new Error("Failed to upload media to Supabase");
          }

          const { data: publicUrlData } = supabaseClient.storage
            .from("media")
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrlData.publicUrl);
        }
      }

      const caller = createCaller({ db, user: null });
      await caller.sms.storeSMS({
        messageSid: twilioBody.MessageSid,
        from: twilioBody.From,
        to: twilioBody.To,
        body: twilioBody.Body,
        mediaUrls,
        status: Status.RECEIVED,
      });

      res.setHeader("Content-Type", "text/xml");
      res.status(200).send(twiml.toString());
    } catch (error) {
      console.error("Webhook Error:", error);

      res.setHeader("Content-Type", "text/xml");
      res.status(200).send(twiml.toString());
    }
  } else {
    res.setHeader("Content-Type", "text/xml");
    res.status(405).send(twiml.toString());
  }
}
