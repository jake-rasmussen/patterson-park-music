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
        const familyData = req.body;
        const createdFamily = await caller.family.createFamily(familyData);
        return res.status(201).json(createdFamily);
      }
      case "GET": {
        const { id } = req.query;
        if (id) {
          const family = await caller.family.getFamilyById(String(id));
          return res.status(200).json(family);
        } else {
          const families = await caller.family.getAllFamilies();
          return res.status(200).json(families);
        }
      }
      case "PUT": {
        const { id, data } = req.body;
        const updatedFamily = await caller.family.updateFamily({ id, data });
        return res.status(200).json(updatedFamily);
      }
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
