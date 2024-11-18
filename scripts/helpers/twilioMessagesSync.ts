import { PrismaClient, SMSMessage } from "@prisma/client";
import twilio from "twilio";

const prisma = new PrismaClient();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || "",
  process.env.TWILIO_AUTH_TOKEN || ""
);

interface TwilioMessage {
  sid: string;
  from: string;
  to: string;
  body: string;
  dateSent: Date | null;
  numMedia: string;
}

/**
 * Fetch all messages from Twilio and upsert them into the database.
 */
export async function syncTwilioMessages(): Promise<void> {
  console.log("Starting Twilio message sync...");

  try {
    let messages: TwilioMessage[] = [];

    const response = await twilioClient.messages.list();
    messages = [...messages, ...response];

    console.log(`Fetched ${messages.length} messages from Twilio.`);

    const upsertPromises = messages.map(async (message) => {
      const mediaUrls =
        parseInt(message.numMedia, 10) > 0
          ? await fetchMediaUrls(message.sid)
          : [];

      return prisma.sMSMessage.upsert({
        where: { messageSid: message.sid },
        update: {
          from: message.from,
          to: message.to,
          body: message.body,
          dateSent: message.dateSent || new Date(),
          mediaUrls,
        },
        create: {
          messageSid: message.sid,
          from: message.from,
          to: message.to,
          body: message.body,
          dateSent: message.dateSent || new Date(),
          mediaUrls,
        },
      });
    });

    await Promise.all(upsertPromises);
    console.log("Successfully upserted messages into the database.");
  } catch (error) {
    console.error("Error syncing messages from Twilio:", error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch media URLs for a given message SID.
 * @param messageSid The SID of the message to fetch media URLs for.
 * @returns An array of media URLs.
 */
async function fetchMediaUrls(messageSid: string): Promise<string[]> {
  try {
    const mediaList = await twilioClient.messages(messageSid).media.list();
    return mediaList.map(
      (media) => `https://api.twilio.com${media.uri.replace(".json", "")}`
    );
  } catch (error) {
    console.error(`Error fetching media for message SID ${messageSid}:`, error);
    return [];
  }
}
