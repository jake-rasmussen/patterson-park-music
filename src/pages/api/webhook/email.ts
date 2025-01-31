import { NextApiRequest, NextApiResponse } from "next";
import multiparty from "multiparty";
import { createCaller } from "~/server/api/root";
import { db } from "~/server/db";
import { Status } from "@prisma/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

function extractEmail(rawString: string): string | null {
  const emailRegex = /<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/;
  const match = rawString.match(emailRegex);

  return match ? match[1]!.trim() : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        res.status(500).json({ error: "Failed to parse incoming email" });
        return;
      }

      const rawFrom = fields.from?.[0] || "";
      const rawTo = fields.to || [];
      const rawCc = fields.cc || [];
      const rawBcc = fields.bcc || [];
      const subject = fields.subject?.[0] || "(No Subject)";
      const text = fields.text?.[0] || "";
      const html = fields.html?.[0] || text;

      const from = extractEmail(rawFrom);
      const to = rawTo.map((email: string) => extractEmail(email)).filter(Boolean) as string[];
      const cc = rawCc.map((email: string) => extractEmail(email)).filter(Boolean) as string[];
      const bcc = rawBcc.map((email: string) => extractEmail(email)).filter(Boolean) as string[];

      if (!to.length) {
        throw new Error("The 'to' field must contain at least one recipient");
      }

      if (!from) {
        throw new Error("Invalid 'from' field");
      }

      const caller = createCaller({ db, user: null });
      console.log({
        from,
        to,
        subject,
        cc,
        bcc,
        attachments: [],
        headers: {},
        status: Status.RECEIVED,
      })
      await caller.email.storeEmail({
        from,
        to,
        subject,
        body: html,
        cc,
        bcc,
        attachments: [],
        headers: {},
        status: Status.RECEIVED,
      });

      res.status(200).json({
        message: "Email processed successfully",
        metadata: { from, to, subject, html, cc, bcc },
      });
    });
  } catch (error: any) {
    console.error("Error handling email:", error);
    res.status(500).json({ error: error.message || "Failed to process email" });
  }
}
