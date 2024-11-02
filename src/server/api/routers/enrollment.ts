import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { ENROLLMENT_STATUS } from "@prisma/client";

export const enrollmentRouter = createTRPCRouter({
  createEnrollment: publicProcedure
    .input(z.object({
      personId: z.string(),
      sectionId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      status: z.nativeEnum(ENROLLMENT_STATUS),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.enrollment.create({
        data: input,
      });
    }),

  getAllEnrollments: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.enrollment.findMany();
  }),

  getEnrollmentById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.enrollment.findUnique({
        where: { id: input },
      });
    }),

  updateEnrollment: publicProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.nativeEnum(ENROLLMENT_STATUS).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      return await ctx.db.enrollment.update({
        where: { id },
        data,
      });
    }),
});
