import type { NextApiRequest, NextApiResponse } from "next";
import { createCallerFactory } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

const createCaller = createCallerFactory(appRouter); // Initialize the caller factory

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const caller = createCaller({ db }); // Provide context for each request

    switch (req.method) {
      case "POST": {
        const personData = req.body;
        const createdPerson = await caller.person.createPerson(personData);
        return res.status(201).json(createdPerson);
      }
      case "GET": {
        const { id } = req.query;
        if (id) {
          const person = await caller.person.getPersonById(String(id));
          return res.status(200).json(person);
        } else {
          const persons = await caller.person.getAllPersons();
          return res.status(200).json(persons);
        }
      }
      // case "PUT": {
      //   const { id, data } = req.body;
      //   const updatedPerson = await caller.person.updatePerson({ id, data });
      //   return res.status(200).json(updatedPerson);
      // }
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
