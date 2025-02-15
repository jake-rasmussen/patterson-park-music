import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ENROLLMENT_STATUS } from "@prisma/client";

export const enrollmentRouter = createTRPCRouter({
  createEnrollment: protectedProcedure
    .input(z.object({
      userId: z.string(),
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
  createEnrollments: protectedProcedure
    .input(
      z.array(
        z.object({
          userId: z.string(),
          sectionId: z.string(),
          startDate: z.date(),
          endDate: z.date(),
          status: z.nativeEnum(ENROLLMENT_STATUS),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.enrollment.createMany({
        data: input,
      });

      return {
        success: true,
        count: result.count,
      };
    }),
  getAllEnrollments: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.enrollment.findMany();
  }),
  getEnrollmentById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.enrollment.findUnique({
        where: { id: input },
      });
    }),
  getEnrollmentsByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.enrollment.findMany({
        where: {
          userId: input
        },
        include: {
          section: {
            include: {
              teacher: true
            }
          }
        }
      });
    }),
  updateEnrollment: protectedProcedure
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
  deleteEnrollment: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const id = input;
      return await ctx.db.enrollment.delete({
        where: { id }
      })
    })
});
