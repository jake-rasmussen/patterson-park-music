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
        const enrollmentData = req.body;
        const createdEnrollment = await caller.enrollment.createEnrollment(enrollmentData);
        return res.status(201).json(createdEnrollment);
      }
      case "GET": {
        const { id } = req.query;
        if (id) {
          const enrollment = await caller.enrollment.getEnrollmentById(String(id));
          return res.status(200).json(enrollment);
        } else {
          const enrollments = await caller.enrollment.getAllEnrollments();
          return res.status(200).json(enrollments);
        }
      }
      case "PUT": {
        const { id, data } = req.body;
        const updatedEnrollment = await caller.enrollment.updateEnrollment({ id, data });
        return res.status(200).json(updatedEnrollment);
      }
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
