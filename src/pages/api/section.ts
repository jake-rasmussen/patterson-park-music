import type { NextApiRequest, NextApiResponse } from "next";
import { createCallerFactory } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

const createCaller = createCallerFactory(appRouter);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const caller = createCaller({ db });

    switch (req.method) {
      case "POST": {
        const sectionData = req.body;
        const createdSection = await caller.section.createSection(sectionData);
        return res.status(201).json(createdSection);
      }
      case "GET": {
        const { id } = req.query;
        if (id) {
          const section = await caller.section.getSectionById(String(id));
          return res.status(200).json(section);
        } else {
          const sections = await caller.section.getAllSections();
          return res.status(200).json(sections);
        }
      }
      case "PUT": {
        const { id, data } = req.body;
        const updatedSection = await caller.section.updateSection({ id, data });
        return res.status(200).json(updatedSection);
      }
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
