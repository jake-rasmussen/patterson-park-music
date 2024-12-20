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
        const tagPersonData = req.body;
        const createdTagPerson = await caller.tag.createTagPerson(tagPersonData);
        return res.status(201).json(createdTagPerson);
      }
      case "GET": {
        const { id } = req.query;
        if (id) {
          const tagPerson = await caller.tag.getTagPersonById(String(id));
          return res.status(200).json(tagPerson);
        } else {
          const tagPersons = await caller.tag.getAllTagPersons();
          return res.status(200).json(tagPersons);
        }
      }
      case "PUT": {
        const { id, data } = req.body;
        const updatedTagPerson = await caller.tag.updateTagPerson({ id, data });
        return res.status(200).json(updatedTagPerson);
      }
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
