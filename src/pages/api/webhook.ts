import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";
import { db } from "~/server/db";
import twilio from "twilio";
import { supabase } from "~/server/supabase/supabaseClient";

const createCaller = createCallerFactory(appRouter);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const twiml = new twilio.twiml.MessagingResponse();

  if (req.method === "POST") {
    try {
      const twilioBody = req.body;

      // Extract media URLs and store them in Supabase
      const numMedia = parseInt(twilioBody.NumMedia, 10);
      const mediaUrls: string[] = [];
      
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = twilioBody[`MediaUrl${i}`];
        if (mediaUrl) {
          // Fetch the media from Twilio
          const mediaResponse = await fetch(mediaUrl);
          const mediaBuffer = await mediaResponse.arrayBuffer();

          // Get file extension from the content type
          const contentType = mediaResponse.headers.get("content-type") || "application/octet-stream";
          const fileExtension = contentType.split("/")[1] || "bin";

          // Generate a unique file path
          const filePath = `uploads/${Date.now()}-${mediaUrl}${i}.${fileExtension}`;

          // Upload to Supabase
          const { error } = await supabase.storage
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

          // Generate a public URL for the uploaded media
          const { data: publicUrlData } = supabase.storage
            .from("media")
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrlData.publicUrl);
        }
      }

      // Use the createCaller to call the tRPC mutation directly
      const caller = createCaller({ db });
      await caller.sms.storeSMS({
        messageSid: twilioBody.MessageSid,
        from: twilioBody.From,
        to: twilioBody.To,
        body: twilioBody.Body,
        mediaUrls, // Pass the uploaded media URLs
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
